/**
 * Tag Progress Panel - V2 INTERACTIVE
 *
 * USER FLOW:
 * - Click a tag → enters selection mode for that tag
 * - Selected tag highlights
 * - Document waits for user to select text
 * - Green checkmark when assigned
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Pure UI component
 * - NO business logic
 * - Shows required AND optional tags
 */

import { Check, Edit, ChevronRight } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { REQUIRED_TAGS, OPTIONAL_TAGS, getTagDisplayName } from '../types/tagConstants';

interface TagAssignment {
  text: string;
  position?: number;
}

interface TagProgressPanelProps {
  activeTag: string | null;
  assignments: Map<string, TagAssignment>;
  onSelectTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function TagProgressPanel({
  activeTag,
  assignments,
  onSelectTag,
  onRemoveTag,
  onToggle,
}: TagProgressPanelProps) {
  const requiredAssignedCount = REQUIRED_TAGS.filter((tag) => assignments.has(tag)).length;
  const progressPercent = Math.round((requiredAssignedCount / REQUIRED_TAGS.length) * 100);

  const renderTag = (tag: string, isRequired: boolean, index?: number) => {
    const assignment = assignments.get(tag);
    const isAssigned = !!assignment;
    const isActive = tag === activeTag;

    return (
      <Box
        key={tag}
        sx={{
          mb: 1.5,
          p: 2,
          borderRadius: 2,
          border: 2,
          borderColor: isActive ? 'primary.main' : isAssigned ? 'success.light' : 'grey.300',
          bgcolor: isActive ? 'primary.50' : isAssigned ? 'success.50' : 'grey.50',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: isActive ? 'primary.dark' : isAssigned ? 'success.main' : 'grey.400',
            transform: 'translateY(-2px)',
            boxShadow: 2,
          },
        }}
        onClick={() => onSelectTag(tag)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Status icon */}
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: isAssigned ? 'success.main' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isAssigned ? (
                <Check sx={{ fontSize: 18, color: 'white' }} />
              ) : (
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {isRequired && index !== undefined ? index + 1 : '•'}
                </Typography>
              )}
            </Box>

            {/* Tag name */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {getTagDisplayName(tag)}
              </Typography>
              {assignment && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mt: 0.5,
                  }}
                >
                  "{assignment.text.substring(0, 30)}
                  {assignment.text.length > 30 ? '...' : ''}"
                </Typography>
              )}
            </Box>
          </Box>

          {/* Edit/Remove button */}
          {isAssigned && !isActive && (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTag(tag);
              }}
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <Edit fontSize="small" />
            </Button>
          )}
        </Box>

        {isActive && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              p: 1,
              bgcolor: 'primary.100',
              borderRadius: 1,
              fontWeight: 600,
              color: 'primary.dark',
            }}
          >
            → Now select text in the document
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 350,
        maxHeight: '90vh',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Instructions - Only show when tag is active */}
      {activeTag && (
        <Box
          sx={{
            py: 1.5,
            px: 2,
            bgcolor: 'primary.50',
            borderBottom: 2,
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="body2" fontWeight={600} color="primary.dark">
            → Select text for:{' '}
            <Chip label={getTagDisplayName(activeTag)} size="small" color="primary" />
          </Typography>
        </Box>
      )}

      {/* Required Tags Section */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.5,
              borderRadius: '16px',
              bgcolor: 'error.main',
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white' }}>
              REQUIRED TAGS
            </Typography>
          </Box>
          {onToggle && (
            <Tooltip title="Hide sidebar">
              <IconButton
                onClick={onToggle}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {REQUIRED_TAGS.map((tag, index) => renderTag(tag, true, index))}
      </Box>

      {/* Optional Tags Section */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.5,
              borderRadius: '16px',
              bgcolor: 'grey.600',
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white' }}>
              OPTIONAL TAGS
            </Typography>
          </Box>
        </Box>
        {OPTIONAL_TAGS.map((tag) => renderTag(tag, false))}
      </Box>

      {/* Summary */}
      {progressPercent === 100 && (
        <Box sx={{ p: 2, bgcolor: 'success.50', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="success.dark" fontWeight="bold">
            ✓ All required tags assigned! Click "Save & Continue" to proceed.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
