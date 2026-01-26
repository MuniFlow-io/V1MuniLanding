'use client';

/**
 * Hook: useBondGenerator
 *
 * ARCHITECTURE: Hook Layer (Layer 2) - SMART
 * - Manages state for complete bond generation workflow
 * - Calls frontend APIs (Layer 4)
 * - NO direct lib imports
 * - NO console.log (forbidden in hooks)
 * - Returns data formatted for components
 * - Auto-saves progress to database (debounced)
 * - Restores progress on mount
 *
 * WORKFLOW:
 * 1. Upload files (template, maturity, CUSIP)
 * 2. Validate template tags
 * 3. Preview bonds (dry run assembly)
 * 4. Confirm finality (lock inputs)
 * 5. Assembly check (show metadata)
 * 6. Generate bonds (fill templates + ZIP)
 * 7. Download ZIP
 */

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { assembleBondsApi, generateBondsApi } from '../api/bondGeneratorApi';
import { getLatestDraftApi, saveDraftWithFilesApi, restoreDraftFilesApi } from '../api/draftApi';
import type { AssembledBond, BondGeneratorStep, TagMap } from '../types';
import type { BondInfo } from '../components/BondInfoFormSection';

export interface UseBondGeneratorResult {
  // State
  step: BondGeneratorStep;
  templateFile: File | null;
  maturityFile: File | null;
  cusipFile: File | null;
  tagMap: TagMap | null;
  bonds: AssembledBond[] | null;
  bondInfo: BondInfo;
  isLoading: boolean;
  error: string | null;
  isFinalized: boolean;
  hasSavedDraft: boolean;
  showLegalDisclaimer: boolean;
  legalAccepted: boolean;

  // Actions
  setTemplateFile: (file: File | null) => void;
  setMaturityFile: (file: File | null) => void;
  setCusipFile: (file: File | null) => void;
  setTagMap: (tagMap: TagMap | null) => void;
  setBondInfo: (bondInfo: BondInfo) => void;
  uploadTemplate: (file?: File) => Promise<void>;
  previewParsedData: () => Promise<void>;
  proceedFromPreview: () => void;
  generateBonds: () => Promise<void>;
  completeTagging: (taggedFile: File) => void;
  cancelTagging: () => void;
  goToStep: (step: BondGeneratorStep) => void;
  reset: () => void;
  acceptLegalDisclaimer: () => void;
}

export function useBondGenerator(): UseBondGeneratorResult {
  // =========================================================================
  // STATE
  // =========================================================================
  const searchParams = useSearchParams();

  const [step, setStep] = useState<BondGeneratorStep>('upload-template');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [maturityFile, setMaturityFile] = useState<File | null>(null);
  const [cusipFile, setCusipFile] = useState<File | null>(null);
  const [tagMap, setTagMap] = useState<TagMap | null>(null);
  const [bonds, setBonds] = useState<AssembledBond[] | null>(null);
  const [bondInfo, setBondInfo] = useState<BondInfo>({
    issuerName: '',
    bondTitle: '',
    interestDates: {
      firstDate: null,
      secondDate: null,
    },
    bondNumbering: {
      startingNumber: 1,
      customPrefix: undefined,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [showLegalDisclaimer, setShowLegalDisclaimer] = useState(false); // Start false, show after draft check
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [isRestoringDraft, setIsRestoringDraft] = useState(true);

  // Track if we've loaded initial draft (prevent double-load)
  const hasLoadedDraft = useRef(false);
  // Track save timeout for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track current draft ID (for resume scenario)
  const currentDraftId = useRef<string | null>(null);

  // =========================================================================
  // DRAFT PERSISTENCE
  // =========================================================================

  /**
   * Load saved draft on mount
   * Restores user's progress from database
   */
  useEffect(() => {
    if (hasLoadedDraft.current) return;

    const loadDraft = async () => {
      try {
        // ✅ FIX: Check if user wants to start fresh (new=true query param)
        const isNewSession = searchParams?.get('new') === 'true';

        if (isNewSession) {
          // ✅ FIX: Clear draft ID so auto-save creates NEW draft instead of updating
          currentDraftId.current = null;
          hasLoadedDraft.current = true;
          setIsRestoringDraft(false);
          setShowLegalDisclaimer(true); // Show for new sessions
          return;
        }

        const draft = await getLatestDraftApi();

        if (draft) {
          // Store draft ID for future saves
          currentDraftId.current = draft.id;

          // ✅ CRITICAL: Restore FILES FIRST before setting step
          // This prevents race condition where UI renders with step but no files
          try {
            const restoredFiles = await restoreDraftFilesApi(draft.id);

            if (restoredFiles.template) {
              setTemplateFile(restoredFiles.template);
            }
            if (restoredFiles.maturity) {
              setMaturityFile(restoredFiles.maturity);
            }
            if (restoredFiles.cusip) {
              setCusipFile(restoredFiles.cusip);
            }
          } catch {
            // Continue anyway - user can re-upload files
          }

          // Tag map IS restored (most valuable data - manual work)
          if (draft.tag_map) {
            setTagMap(draft.tag_map);
          }

          // ✅ NOW set step and other state AFTER files are loaded
          const draftStep = draft.current_step as BondGeneratorStep;
          const safeStep =
            draftStep === 'generating' || draftStep === 'complete'
              ? 'upload-data' // Reset to safe resume point
              : draftStep;

          setIsFinalized(draft.is_finalized);
          setLegalAccepted(draft.legal_accepted ?? false);

          // Show legal disclaimer ONLY if NOT already accepted
          setShowLegalDisclaimer(!draft.legal_accepted);

          setHasSavedDraft(true);

          // Set step LAST to ensure all data is loaded first
          setStep(safeStep);
        } else {
          // No draft found - show legal disclaimer for first-time users
          setShowLegalDisclaimer(true);
        }

        hasLoadedDraft.current = true;
        setIsRestoringDraft(false);
      } catch {
        // Silent fail - don't block user if draft load fails
        hasLoadedDraft.current = true;
        setIsRestoringDraft(false);
      }
    };

    loadDraft();
  }, [searchParams]);

  /**
   * Auto-save draft on state change (debounced)
   * Saves progress to database after 1 second of inactivity
   */
  useEffect(() => {
    // Don't save until we've loaded initial draft
    if (!hasLoadedDraft.current) return undefined;

    // ✅ FIX: Don't save terminal states - they cause stuck UI
    // User completed/generating → shouldn't restore to these states
    if (step === 'generating' || step === 'complete') {
      return undefined;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (debounced 1 second)
    saveTimeoutRef.current = setTimeout(() => {
      const saveDraft = async () => {
        try {
          // ✅ NEW: Save WITH actual files (not just metadata)
          const savedDraft = await saveDraftWithFilesApi(
            {
              current_step: step,
              tag_map: tagMap,
              is_finalized: isFinalized,
              legal_accepted: legalAccepted,
              draft_id: currentDraftId.current || undefined,
            },
            {
              template: templateFile || undefined,
              maturity: maturityFile || undefined,
              cusip: cusipFile || undefined,
            }
          );

          // Update draft ID after save (in case it was created)
          if (savedDraft.id) {
            currentDraftId.current = savedDraft.id;
          }

          setHasSavedDraft(true);
        } catch {
          // Silent fail - don't interrupt user flow if save fails
        }
      };

      saveDraft();
    }, 1000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [step, templateFile, maturityFile, cusipFile, tagMap, isFinalized, legalAccepted]);

  // =========================================================================
  // ACTIONS
  // =========================================================================

  /**
   * Upload DOCX template and go to tagging
   * Don't validate tags yet - user will add them in the next step
   *
   * @param file - Optional file parameter (avoids race condition with state)
   */
  const uploadTemplate = async (file?: File) => {
    const fileToUpload = file || templateFile;

    if (!fileToUpload) {
      setError('Please upload bond form template');
      return;
    }

    // Block if legal not accepted
    if (!legalAccepted) {
      setError('Please accept the legal disclaimer first');
      return;
    }

    // Validate file type
    if (!fileToUpload.name.toLowerCase().endsWith('.docx')) {
      setError('Only DOCX files are supported. Please upload a .docx file.');
      return;
    }

    setError(null);

    // Save the file to state so TemplateTagging component can use it
    setTemplateFile(fileToUpload);

    // Go straight to tagging - don't try to validate tags yet
    // The tagging page will detect blanks and user will assign tags
    setStep('tagging');
  };

  /**
   * Complete tagging - user is done tagging
   * Save tags and proceed to next step
   */
  const completeTagging = async (taggedFile: File, tags?: TagMap) => {
    setTemplateFile(taggedFile);
    if (tags) {
      setTagMap(tags);
    }
    setStep('upload-data');
  };

  /**
   * Cancel tagging - return to template upload
   */
  const cancelTagging = () => {
    setStep('upload-template');
    setTemplateFile(null);
    setTagMap(null);
  };

  /**
   * Preview parsed data - shows maturity + CUSIP parsing results
   * User can review and edit errors before proceeding
   */
  const previewParsedData = async () => {
    if (!maturityFile || !cusipFile) {
      setError('Please upload maturity schedule and CUSIP file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Move to preview-data step
      // The preview page will handle parsing and showing results
      setStep('preview-data');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Proceed from preview - assemble bonds and move to assembly check
   * UPDATED: Now goes directly to assembly-check (finality modal shows there)
   * Passes bond numbering config if user provided custom settings
   */
  const proceedFromPreview = async () => {
    if (!maturityFile || !cusipFile) {
      setError('Missing required files');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call assembly API to merge maturity + CUSIP data with optional numbering config
      const result = await assembleBondsApi(maturityFile, cusipFile, bondInfo.bondNumbering);
      setBonds(result);
      setIsFinalized(true); // Mark as finalized when entering assembly check
      setStep('assembly-check');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assemble bonds');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Confirm finality - REMOVED
   * Finality is now confirmed via modal in AssemblyCheckScreen
   * isFinalized flag is set when entering assembly-check step
   */

  /**
   * Generate actual bond certificates
   * Fills templates, creates ZIP, triggers download
   */
  const generateBonds = async () => {
    if (!templateFile || !maturityFile || !cusipFile) {
      setError('All files required');
      return;
    }

    // Bond info (issuer, title, interest dates) is OPTIONAL - no validation needed
    // Users can choose to tag these fields or not during the tagging step

    setIsLoading(true);
    setError(null);
    setStep('generating');

    try {
      // Call generate API - handles template fill + ZIP creation + download
      await generateBondsApi(templateFile, maturityFile, cusipFile, bondInfo);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStep('assembly-check'); // Go back to assembly check on error
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Go to a specific step
   * ✅ FIX: Validate prerequisites before allowing navigation
   */
  const goToStep = (newStep: BondGeneratorStep) => {
    // ✅ FIX: Validate that previous steps are completed before allowing forward navigation
    const stepOrder: BondGeneratorStep[] = [
      'upload-template',
      'tagging',
      'upload-data',
      'preview-data',
      'assembly-check',
      'generating',
      'complete',
    ];

    const currentIndex = stepOrder.indexOf(step);
    const targetIndex = stepOrder.indexOf(newStep);

    // If going forward, validate prerequisites
    if (targetIndex > currentIndex) {
      // Can't go to tagging without template
      if (targetIndex >= 1 && !templateFile) {
        setError('Please upload bond form template first');
        return;
      }

      // Can't go to upload-data without completing tagging
      if (targetIndex >= 2 && !templateFile) {
        setError('Please complete template tagging first');
        return;
      }

      // Can't go to preview-data without data files
      if (targetIndex >= 3 && (!maturityFile || !cusipFile)) {
        setError('Please upload maturity schedule and CUSIP file first');
        return;
      }

      // Can't go to finality without assembled bonds
      if (targetIndex >= 4 && !bonds) {
        setError('Please review parsed data first');
        return;
      }

      // Can't go to assembly-check without confirming finality
      if (targetIndex >= 5 && !isFinalized) {
        setError('Please confirm finality first');
        return;
      }
    }

    setStep(newStep);
    setError(null);
  };

  /**
   * Reset all state - start over
   * Clears files, tags, bonds, errors, and finality lock
   */
  const reset = () => {
    setStep('upload-template');
    setTemplateFile(null);
    setMaturityFile(null);
    setCusipFile(null);
    setTagMap(null);
    setBonds(null);
    setBondInfo({
      issuerName: '',
      bondTitle: '',
      interestDates: {
        firstDate: null,
        secondDate: null,
      },
    });
    setError(null);
    setIsFinalized(false);
    setIsLoading(false);
    currentDraftId.current = null; // Clear draft ID
  };

  // =========================================================================
  // RETURN
  // =========================================================================

  return {
    // State
    step,
    templateFile,
    maturityFile,
    cusipFile,
    tagMap,
    bonds,
    bondInfo,
    isLoading: isLoading || isRestoringDraft,
    error,
    isFinalized,
    hasSavedDraft,
    showLegalDisclaimer,
    legalAccepted,

    // Actions
    setTemplateFile,
    setMaturityFile,
    setCusipFile,
    setTagMap,
    setBondInfo,
    uploadTemplate,
    previewParsedData,
    proceedFromPreview,
    generateBonds,
    completeTagging,
    cancelTagging,
    goToStep,
    reset,
    acceptLegalDisclaimer: () => {
      setLegalAccepted(true);
      setShowLegalDisclaimer(false);
    },
  };
}
