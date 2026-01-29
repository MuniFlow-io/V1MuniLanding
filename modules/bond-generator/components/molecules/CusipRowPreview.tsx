/**
 * CusipRowPreview Component
 *
 * ARCHITECTURE: Molecule Component
 * - Displays single CUSIP row with editing capability
 * - NO hooks (callbacks passed via props)
 * - NO business logic
 */

import { Checkbox, TableCell, TableRow } from '@mui/material';
import type { EditableCusipField, ParsedCusipRow } from '../../types/cusipPreview';
import { formatDateForDisplay } from '../../utils/formatDate';
import { EditableCell } from '../atoms/EditableCell';
import { StatusBadge } from '../atoms/StatusBadge';

interface CusipRowPreviewProps {
  row: ParsedCusipRow;
  editingCell: { rowNumber: number; field: EditableCusipField } | null;
  onEdit: (rowNumber: number, field: EditableCusipField) => void;
  onSave: (rowNumber: number, field: EditableCusipField, value: string) => void;
  onCancel: () => void;
  onToggleConfirm: (rowNumber: number) => void;
}

export function CusipRowPreview({
  row,
  editingCell,
  onEdit,
  onSave,
  onCancel,
  onToggleConfirm,
}: CusipRowPreviewProps) {
  const isEditingCusip = editingCell?.rowNumber === row.rowNumber && editingCell?.field === 'cusip';
  const isEditingMaturity =
    editingCell?.rowNumber === row.rowNumber && editingCell?.field === 'maturity_date';
  const isEditingSeries =
    editingCell?.rowNumber === row.rowNumber && editingCell?.field === 'series';

  return (
    <TableRow
      sx={{
        backgroundColor:
          row.status === 'error'
            ? 'error.lighter'
            : row.status === 'warning'
              ? 'warning.lighter'
              : undefined,
      }}
    >
      {/* Confirmation Checkbox */}
      <TableCell sx={{ width: '60px', textAlign: 'center', padding: 1 }}>
        <Checkbox
          checked={row.confirmed || false}
          onChange={() => onToggleConfirm(row.rowNumber)}
          disabled={row.status === 'error'} // Cannot confirm rows with errors
          size="small"
          color="primary"
        />
      </TableCell>

      {/* Row Number */}
      <TableCell>{row.rowNumber}</TableCell>

      {/* Status Badge */}
      <TableCell>
        <StatusBadge status={row.status} errors={row.errors} warnings={row.warnings} />
      </TableCell>

      {/* CUSIP */}
      <EditableCell
        value={row.cusip || ''}
        isEditing={isEditingCusip}
        hasError={row.errors?.some((e) => e.includes('CUSIP')) || false}
        onEdit={() => onEdit(row.rowNumber, 'cusip')}
        onSave={(value) => onSave(row.rowNumber, 'cusip', value)}
        onCancel={onCancel}
      />

      {/* Maturity Date */}
      <EditableCell
        value={formatDateForDisplay(row.maturity_date) || ''}
        isEditing={isEditingMaturity}
        hasError={row.errors?.some((e) => e.includes('Maturity Date')) || false}
        onEdit={() => onEdit(row.rowNumber, 'maturity_date')}
        onSave={(value) => onSave(row.rowNumber, 'maturity_date', value)}
        onCancel={onCancel}
      />

      {/* Series */}
      <EditableCell
        value={row.series || ''}
        isEditing={isEditingSeries}
        hasError={false}
        onEdit={() => onEdit(row.rowNumber, 'series')}
        onSave={(value) => onSave(row.rowNumber, 'series', value)}
        onCancel={onCancel}
      />
    </TableRow>
  );
}
