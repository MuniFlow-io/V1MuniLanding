'use client';

/**
 * EditableCell Component
 *
 * ARCHITECTURE: Atom Component
 * - Editable table cell with inline editing
 * - NO hooks, NO business logic
 * - Pure UI with callbacks
 */

import { Check, Close, Edit } from '@mui/icons-material';
import { Box, IconButton, TableCell, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

interface EditableCellProps {
  value: string | number | null;
  isEditing: boolean;
  hasError: boolean;
  onEdit: () => void;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  align?: 'left' | 'right' | 'center';
  type?: 'text' | 'number' | 'date';
  width?: string;
}

export function EditableCell({
  value,
  isEditing,
  hasError,
  onEdit,
  onSave,
  onCancel,
  align = 'left',
  type = 'text',
  width,
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(String(value || ''));

  // Sync editValue with value prop when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditValue(String(value || ''));
    }
  }, [isEditing, value]);

  const handleSave = () => {
    onSave(editValue);
  };

  const handleCancel = () => {
    setEditValue(String(value || ''));
    onCancel();
  };

  if (isEditing) {
    return (
      <TableCell align={align} sx={{ width }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            type={type}
            size="small"
            autoFocus
            error={hasError}
            sx={{ flexGrow: 1 }}
          />
          <IconButton size="small" onClick={handleSave} color="primary">
            <Check />
          </IconButton>
          <IconButton size="small" onClick={handleCancel}>
            <Close />
          </IconButton>
        </Box>
      </TableCell>
    );
  }

  return (
    <TableCell
      align={align}
      sx={{
        width,
        backgroundColor: hasError ? 'error.light' : 'transparent',
        cursor: 'pointer',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
      onClick={onEdit}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {value || '(empty)'}
        <IconButton size="small" sx={{ opacity: 0.5 }}>
          <Edit sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </TableCell>
  );
}
