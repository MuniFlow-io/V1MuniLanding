'use client';

/**
 * Tag Assignment Popup Component
 * Shows when user selects text in document
 * Allows them to assign a bond tag to the selected text
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - NO hooks, NO business logic
 * - Pure UI - shows popup at position with tag options
 */

import { Box, Button, Chip, MenuItem, Popover, Select, Typography } from '@mui/material';
import { useState } from 'react';
import { TAG_OPTIONS } from '../types/tagConstants';

// Simplified color constants since theme doesn't export detailed colors
const colors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  text: {
    primary: '#ffffff',
    secondary: '#9ca3af',
    disabled: '#6b7280',
  },
  background: {
    subtle: '#1f2937',
  },
  border: {
    light: '#374151',
    default: '#4b5563',
  },
};

interface TagAssignmentPopupProps {
  /** Whether popup is visible */
  isOpen: boolean;
  /** Selected text from document */
  selectedText: string;
  /** Position to show popup (from text selection) */
  position: { x: number; y: number };
  /** Previously assigned tags (to show which are already used) */
  assignedTags?: Array<{ tag: string; text: string }>;
  /** Current tag assigned to this text (if reassigning) */
  existingTag?: string;
  /** Callback when user confirms tag assignment */
  onAssignTag: (tagName: string) => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

/**
 * Popup that appears when user selects text in the document
 * Lets them choose which bond tag to assign to that text
 * Now with explicit confirmation step
 */
export function TagAssignmentPopup({
  isOpen,
  selectedText,
  position,
  assignedTags = [],
  existingTag,
  onAssignTag,
  onCancel,
}: TagAssignmentPopupProps) {
  const [selectedTag, setSelectedTag] = useState<string>(existingTag || '');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedTag && selectedTag !== existingTag) {
      onAssignTag(selectedTag);
    }
  };

  const assignedTagNames = new Set(assignedTags.map((t) => t.tag));
  const isReassigning = !!existingTag && selectedTag && selectedTag !== existingTag;
  const canConfirm = selectedTag && selectedTag !== existingTag;

  // Create a virtual anchor element at the selection position
  // Using 'any' here because MUI Popover accepts a virtual element with getBoundingClientRect
  // but TypeScript requires full Element interface. This is a common MUI pattern.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anchorEl: any = {
    nodeType: 1,
    getBoundingClientRect: () => ({
      top: position.y,
      left: position.x,
      right: position.x,
      bottom: position.y,
      width: 0,
      height: 0,
      x: position.x,
      y: position.y,
      toJSON: () => ({}),
    }),
  };

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onCancel}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            overflow: 'visible',
            border: `2px solid ${colors.primary}`,
            maxHeight: 'calc(100vh - 100px)',
          },
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Box sx={{ width: 320, p: 2 }}>
        {/* Header */}
        <Typography
          variant="subtitle2"
          fontWeight={600}
          gutterBottom
          sx={{ color: colors.text.primary }}
        >
          Assign Tag to Selection
        </Typography>

        {/* Selected text preview */}
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: colors.background.subtle,
            borderRadius: 1,
            border: `1px solid ${colors.border.light}`,
            maxHeight: 60,
            overflow: 'hidden',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            "{selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}"
          </Typography>
        </Box>

        {/* Reassignment notice */}
        {isReassigning && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: colors.warning + '15',
              borderRadius: 1,
              border: `1px solid ${colors.warning}`,
            }}
          >
            <Typography variant="caption" sx={{ color: colors.warning, fontWeight: 600 }}>
              Changing tag assignment:
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <Box component="span" sx={{ textDecoration: 'line-through', opacity: 0.6 }}>
                {TAG_OPTIONS.find((opt) => opt.value === existingTag)?.label || existingTag}
              </Box>
              {' → '}
              <Box component="span" sx={{ fontWeight: 600, color: colors.primary }}>
                {TAG_OPTIONS.find((opt) => opt.value === selectedTag)?.label || selectedTag}
              </Box>
            </Typography>
          </Box>
        )}

        {/* Tag selector */}
        <Select
          fullWidth
          size="medium"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          displayEmpty
          autoFocus
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.border.default,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary,
            },
          }}
        >
          <MenuItem value="" disabled>
            <em>Select a tag...</em>
          </MenuItem>
          {TAG_OPTIONS.filter((opt) => opt.value).map((option) => {
            const isAlreadyAssigned = assignedTagNames.has(option.value);
            return (
              <MenuItem key={option.value} value={option.value}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Typography variant="body2" fontWeight={option.required ? 600 : 400}>
                    {option.label}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {option.required && (
                      <Chip
                        label="REQUIRED"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: colors.error,
                          color: 'white',
                        }}
                      />
                    )}
                    {isAlreadyAssigned && (
                      <Chip
                        label="ASSIGNED"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: colors.success,
                          color: 'white',
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </MenuItem>
            );
          })}
        </Select>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth
            size="medium"
            variant="outlined"
            onClick={onCancel}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderColor: colors.border.default,
              color: colors.text.secondary,
              '&:hover': {
                borderColor: colors.primary,
                bgcolor: `${colors.primary}08`,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            size="medium"
            variant="contained"
            onClick={handleConfirm}
            disabled={!canConfirm}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: colors.primary,
              color: 'white',
              '&:hover': {
                bgcolor: colors.primaryDark,
              },
              '&:disabled': {
                bgcolor: colors.border.light,
                color: colors.text.disabled,
              },
            }}
          >
            {isReassigning ? 'Change Tag' : 'Assign Tag'}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
