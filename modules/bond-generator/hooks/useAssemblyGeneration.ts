'use client';

/**
 * Assembly Generation Hook
 * 
 * ARCHITECTURE: Hook (Layer 2) - SMART
 * - Manages preview and generation logic
 * - Handles auth checking
 * - Handles preview limiting
 * - Calls APIs
 * - Component is DUMB and just calls this hook
 * 
 * ELITE STANDARDS:
 * - <200 lines
 * - All logic lives here (not in component)
 * - Component just renders based on this hook's state
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { 
  getPreviewsRemaining, 
  hasPreviewsRemaining, 
  incrementPreviewCount 
} from '@/lib/previewLimiter';
import { logger } from '@/lib/logger';
import type { AssembledBond } from '@/modules/bond-generator/types';

interface UseAssemblyGenerationProps {
  bonds: AssembledBond[] | null;
  templateFile?: File | null;
  onGenerate: () => void;
}

interface UseAssemblyGenerationResult {
  // Preview state
  showPreviewModal: boolean;
  previewHtml: string | null;
  isLoadingPreview: boolean;
  previewsRemaining: number;
  
  // Account gate state
  showAccountGate: boolean;
  accountGateReason: 'preview_limit' | 'download';
  
  // Actions
  handlePreviewFirst: () => Promise<void>;
  handleGenerateClick: () => void;
  closePreviewModal: () => void;
  closeAccountGate: () => void;
}

export function useAssemblyGeneration({
  bonds,
  templateFile,
  onGenerate,
}: UseAssemblyGenerationProps): UseAssemblyGenerationResult {
  const { user } = useAuth();
  
  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  // Account gate state
  const [showAccountGate, setShowAccountGate] = useState(false);
  const [accountGateReason, setAccountGateReason] = useState<'preview_limit' | 'download'>('download');
  
  // Preview limit state
  const [previewsRemaining, setPreviewsRemaining] = useState(3);

  // Load preview count from localStorage on mount
  useEffect(() => {
    setPreviewsRemaining(getPreviewsRemaining());
  }, []);

  /**
   * Handle preview generation
   * Contains auth logic, preview limit logic, and API call
   */
  const handlePreviewFirst = async () => {
    if (!bonds || bonds.length === 0 || !templateFile) {
      logger.warn('Preview attempted without bonds or template');
      return;
    }
    
    // AUTH CHECK: Skip preview limit if user is authenticated
    if (!user && !hasPreviewsRemaining()) {
      logger.info('Preview limit reached for guest user, showing account gate');
      setAccountGateReason('preview_limit');
      setShowAccountGate(true);
      return;
    }
    
    setIsLoadingPreview(true);
    setShowPreviewModal(true);
    
    try {
      logger.info('Generating bond preview', { 
        bondIndex: 0,
        authenticated: !!user 
      });
      
      // API CALL: Generate preview
      const formData = new FormData();
      formData.append('template', templateFile);
      formData.append('bondData', JSON.stringify(bonds[0]));
      
      const response = await fetch('/api/bond-generator/preview-filled-bond-public', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewHtml(data.html);
        
        // PREVIEW LIMIT LOGIC: Only increment counter for guest users
        if (!user) {
          incrementPreviewCount();
          setPreviewsRemaining(getPreviewsRemaining());
        }
        
        logger.info('Bond preview generated successfully', { 
          authenticated: !!user,
          previewsRemaining: user ? 'unlimited' : getPreviewsRemaining() 
        });
      } else {
        logger.warn('Preview API returned error', { status: response.status });
        setPreviewHtml(null);
      }
    } catch (error) {
      logger.error('Preview failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      setPreviewHtml(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  /**
   * Handle generate click
   * Contains auth logic and delegation to onGenerate
   */
  const handleGenerateClick = () => {
    // AUTH CHECK: Check if user is authenticated
    if (!user) {
      // Guest user - show account gate
      logger.info('Generate clicked without auth, showing gate');
      setAccountGateReason('download');
      setShowAccountGate(true);
      return;
    }
    
    // User is authenticated - proceed with generation
    logger.info('Generate clicked with auth, proceeding', { userId: user.id });
    onGenerate();
  };

  /**
   * Close preview modal
   */
  const closePreviewModal = () => {
    setShowPreviewModal(false);
  };

  /**
   * Close account gate
   */
  const closeAccountGate = () => {
    setShowAccountGate(false);
  };

  return {
    // Preview state
    showPreviewModal,
    previewHtml,
    isLoadingPreview,
    previewsRemaining,
    
    // Account gate state
    showAccountGate,
    accountGateReason,
    
    // Actions
    handlePreviewFirst,
    handleGenerateClick,
    closePreviewModal,
    closeAccountGate,
  };
}
