'use client';

/**
 * Blank Space Tagging Page - V2 CLEAN ARCHITECTURE
 *
 * USER FLOW:
 * 1. Sidebar shows 7 required tags
 * 2. User clicks tag → enters selection mode
 * 3. User highlights text in document
 * 4. Text gets assigned to that tag
 * 5. Tag turns green
 * 6. Repeat until all assigned
 * 7. Save button enables → save
 */

import { theme } from '@/modules/app/constants/theme';
import { Check, CheckCircle, ChevronLeft, Error as ErrorIcon, Info } from '@mui/icons-material';

// Extract colors from theme for easier access
const colors = theme.colors;
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Drawer,
  Fab,
  Snackbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TagProgressPanel } from '../components/TagProgressPanel';
import { useBlankTagging } from '../hooks/useBlankTagging';
import type { TagMap } from '../types';

interface BlankSpaceTaggingPageProps {
  templateFile: File;
  onComplete: (taggedFile: File, tagMap?: TagMap) => void;
  onCancel: () => void;
  existingTagMap?: TagMap | null;
}

export function BlankSpaceTaggingPage({
  templateFile,
  onComplete,
  onCancel,
  existingTagMap,
}: BlankSpaceTaggingPageProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Tag panel collapsed state (default collapsed on mobile, expanded on desktop)
  const [isPanelOpen, setIsPanelOpen] = useState(!isMobile);

  // ✅ NEW: Convert TagMap to initial assignments if resuming
  const initialAssignments = useMemo(() => {
    if (!existingTagMap || !existingTagMap.tags || existingTagMap.tags.length === 0) {
      return undefined;
    }

    const map = new Map<string, { text: string; position?: number }>();
    existingTagMap.tags.forEach((tagPos) => {
      map.set(tagPos.tag, {
        text: `{{${tagPos.tag}}}`, // Text is already replaced in DOCX
        position: tagPos.position,
      });
    });
    return map;
  }, [existingTagMap]);

  // V2 Hook - Clean state management
  // ✅ UPDATED: Pass initial assignments to hook
  const {
    activeTag,
    setActiveTag,
    assignments,
    assignText,
    unassign,
    clearAll,
    isValid,
    missingTags,
    isSaving,
    saveError,
    save,
  } = useBlankTagging(initialAssignments);

  // Document preview state
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info';
  } | null>(null);

  // Auto-collapse panel on mobile when screen size changes
  useEffect(() => {
    setIsPanelOpen(!isMobile);
  }, [isMobile]);

  // Load HTML preview on mount
  useEffect(() => {
    const loadPreview = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const { getAuthHeadersForFormData } = await import('@/lib/auth/getAuthHeaders');
        const headers = await getAuthHeadersForFormData();
        const formData = new FormData();
        formData.append('template', templateFile);

        const response = await fetch('/api/bond-generator/template/preview', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        setHtml(result.html);
        setToast({ message: 'Document loaded successfully', severity: 'success' });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load document preview';
        setLoadError(errorMessage);
        setToast({ message: errorMessage, severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [templateFile]);

  // Write HTML to iframe
  useEffect(() => {
    if (!iframeRef.current || !html) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    try {
      doc.open();
      doc.write(html);
      doc.close();
    } catch {
      setLoadError('Failed to render document in preview');
      setToast({ message: 'Failed to render document', severity: 'error' });
    }
  }, [html]);

  // Listen for text selection in iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TEXT_SELECTED') {
        const selectedText = event.data.text;

        // Only process if we're in selection mode (activeTag is set)
        if (!activeTag) {
          setToast({
            message: 'Click a tag in the sidebar first to enter selection mode',
            severity: 'info',
          });
          return;
        }

        // Don't allow selecting already-tagged text
        if (selectedText.includes('{{') && selectedText.includes('}}')) {
          setToast({
            message: 'Cannot select already-tagged text',
            severity: 'error',
          });
          return;
        }

        // User can select ANY text - we'll replace it exactly
        // Normalize whitespace to match DOCX
        const normalizedText = selectedText
          .replace(/\u00A0/g, ' ') // Non-breaking space → space
          .replace(/\s+/g, ' ') // Multiple spaces → single space
          .trim();

        // Assign the selected text to the active tag
        assignText(activeTag, normalizedText);

        setToast({
          message: `Assigned to ${activeTag}`,
          severity: 'success',
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTag, assignText]);

  // Handle save
  const handleSave = async () => {
    // ✅ FIX: Disable button during save to prevent double-clicks
    if (isSaving) return;

    setToast({ message: 'Applying tags to document...', severity: 'info' });

    const taggedFile = await save(templateFile);

    if (taggedFile) {
      setToast({ message: 'Tags applied successfully!', severity: 'success' });

      // ✅ NEW: Convert assignments to TagMap format
      const tagMap: TagMap = {
        templateId: templateFile.name, // Simple ID based on filename
        templateHash: '', // Not used in current implementation
        tags: Array.from(assignments.entries()).map(([tagName, assignment], index) => ({
          tag: tagName,
          position: assignment.position ?? index, // Use position if available, otherwise index
        })),
        filename: templateFile.name,
        size: templateFile.size,
      };

      // ✅ FIX: Pass tags to completeTagging
      onComplete(taggedFile, tagMap);
    } else {
      setToast({ message: saveError || 'Failed to save tags', severity: 'error' });
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Main Content - Document Preview */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            bgcolor: 'white',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0, flex: { xs: '1 1 100%', md: '0 1 auto' } }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
            >
              Step 2: Tag Your Bond Form
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {templateFile.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {assignments.size > 0 && (
              <Button
                variant="outlined"
                onClick={clearAll}
                size={isMobile ? 'small' : 'medium'}
                sx={{ textTransform: 'none', borderColor: '#d32f2f', color: '#d32f2f' }}
              >
                Clear All
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={onCancel}
              size={isMobile ? 'small' : 'medium'}
              sx={{ textTransform: 'none' }}
            >
              ← Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              startIcon={<Check />}
              disabled={!isValid || isSaving}
              size={isMobile ? 'small' : 'medium'}
              sx={{ textTransform: 'none', bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
            >
              {isSaving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </Box>
        </Box>

        {/* Instructions */}
        {activeTag && (
          <Alert
            severity="info"
            sx={{
              borderRadius: 0,
              bgcolor: `${colors.primary}10`,
              borderBottom: `2px solid ${colors.primary}`,
            }}
          >
            <Typography variant="body2">
              <strong>Selection mode:</strong> Highlight the text in the document for{' '}
              <strong>{activeTag}</strong>
            </Typography>
          </Alert>
        )}

        {/* Load Error */}
        {loadError && (
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            <Typography variant="body2">
              <strong>Error:</strong> {loadError}
            </Typography>
          </Alert>
        )}

        {/* Loading */}
        {isLoading && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={60} sx={{ color: colors.primary }} />
            <Typography variant="h6">Loading document...</Typography>
          </Box>
        )}

        {/* Document Preview */}
        {!isLoading && html && (
          <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', bgcolor: 'white' }}>
            <iframe
              ref={iframeRef}
              title="Bond Form Document"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: 'white',
              }}
              sandbox="allow-scripts allow-same-origin"
            />
          </Box>
        )}
      </Box>

      {/* Floating button to show sidebar when hidden */}
      {!isPanelOpen && (
        <Tooltip title="Show tags" placement="left">
          <Fab
            color="primary"
            size="small"
            onClick={() => setIsPanelOpen(true)}
            sx={{
              position: 'fixed',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1200,
            }}
          >
            <ChevronLeft />
          </Fab>
        </Tooltip>
      )}

      {/* Sidebar - Tag Progress Panel (Collapsible) */}
      <Drawer
        anchor="right"
        open={isPanelOpen}
        variant="persistent"
        sx={{
          width: isPanelOpen ? 280 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            position: 'relative',
            border: 'none',
            transition: 'width 0.3s ease',
          },
        }}
      >
        <TagProgressPanel
          activeTag={activeTag}
          assignments={assignments}
          onSelectTag={setActiveTag}
          onRemoveTag={unassign}
          isOpen={isPanelOpen}
          onToggle={() => setIsPanelOpen(!isPanelOpen)}
        />
      </Drawer>

      {/* Toast Notifications */}
      {toast && (
        <Snackbar
          open={true}
          autoHideDuration={3000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={toast.severity}
            onClose={() => setToast(null)}
            icon={
              toast.severity === 'success' ? (
                <CheckCircle />
              ) : toast.severity === 'error' ? (
                <ErrorIcon />
              ) : (
                <Info />
              )
            }
            sx={{
              minWidth: 320,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              ...(toast.severity === 'success' && {
                bgcolor: colors.success,
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' },
              }),
              ...(toast.severity === 'error' && {
                bgcolor: colors.error,
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' },
              }),
              ...(toast.severity === 'info' && {
                bgcolor: colors.primary,
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' },
              }),
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
