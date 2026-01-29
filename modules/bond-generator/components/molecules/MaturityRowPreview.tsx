/**
 * MaturityRowPreview Component
 *
 * ARCHITECTURE: Molecule Component
 * - Single row in maturity schedule preview
 * - NO hooks, NO business logic
 * - Receives data and callbacks via props
 */

import { Box, Checkbox, TableCell, TableRow, Tooltip } from '@mui/material';
import type { EditableField, ParsedMaturityRow } from '../../types/maturityPreview';
import { formatDateForDisplay } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { EditableCell } from '../atoms/EditableCell';
import { StatusBadge } from '../atoms/StatusBadge';

interface MaturityRowPreviewProps {
  row: ParsedMaturityRow;
  editingCell: { rowNumber: number; field: EditableField } | null;
  onEdit: (rowNumber: number, field: EditableField) => void;
  onSave: (rowNumber: number, field: EditableField, value: string) => void;
  onCancel: () => void;
  onToggleConfirm: (rowNumber: number) => void;
}

export function MaturityRowPreview({
  row,
  editingCell,
  onEdit,
  onSave,
  onCancel,
  onToggleConfirm,
}: MaturityRowPreviewProps) {
  // Check if THIS specific cell is being edited
  const isCellEditing = (field: EditableField): boolean => {
    if (!editingCell) return false;
    return editingCell.rowNumber === row.rowNumber && editingCell.field === field;
  };

  // Determine if row should be greyed out (skipped rows)
  const isSkipped = row.status === 'skipped';

  return (
    <TableRow
      sx={{
        opacity: isSkipped ? 0.5 : 1,
        backgroundColor:
          row.status === 'error'
            ? 'error.lighter'
            : row.status === 'warning'
              ? 'warning.lighter'
              : 'transparent',
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

      {/* Status Badge */}
      <TableCell sx={{ width: '10%', textAlign: 'center' }}>
        {/* Only show tooltip if there are errors or warnings */}
        {(row.errors && row.errors.length > 0) || (row.warnings && row.warnings.length > 0) ? (
          <Tooltip
            title={
              <Box>
                {row.errors && row.errors.length > 0 && (
                  <Box>
                    <strong>Errors:</strong>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {row.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </Box>
                )}
                {row.warnings && row.warnings.length > 0 && (
                  <Box>
                    <strong>Warnings:</strong>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {row.warnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Box>
            }
          >
            <span>
              <StatusBadge status={row.status} />
            </span>
          </Tooltip>
        ) : (
          <StatusBadge status={row.status} />
        )}
      </TableCell>

      {/* Maturity Date */}
      <EditableCell
        value={formatDateForDisplay(row.maturity_date)}
        isEditing={isCellEditing('maturity_date')}
        hasError={row.errors?.some((e) => e.includes('Maturity Date')) || false}
        onEdit={() => onEdit(row.rowNumber, 'maturity_date')}
        onSave={(val) => onSave(row.rowNumber, 'maturity_date', val)}
        onCancel={onCancel}
        type="date"
        width="18%"
      />

      {/* Principal Amount */}
      <EditableCell
        value={formatCurrency(row.principal_amount)}
        isEditing={isCellEditing('principal_amount')}
        hasError={row.errors?.some((e) => e.includes('Principal Amount')) || false}
        onEdit={() => onEdit(row.rowNumber, 'principal_amount')}
        onSave={(val) => onSave(row.rowNumber, 'principal_amount', val)}
        onCancel={onCancel}
        align="center"
        type="number"
        width="27%"
      />

      {/* Coupon Rate */}
      <EditableCell
        value={row.coupon_rate}
        isEditing={isCellEditing('coupon_rate')}
        hasError={row.errors?.some((e) => e.includes('Coupon Rate')) || false}
        onEdit={() => onEdit(row.rowNumber, 'coupon_rate')}
        onSave={(val) => onSave(row.rowNumber, 'coupon_rate', val)}
        onCancel={onCancel}
        align="center"
        type="number"
        width="20%"
      />

      {/* Series */}
      <EditableCell
        value={row.series || '-'}
        isEditing={isCellEditing('series')}
        hasError={false}
        onEdit={() => onEdit(row.rowNumber, 'series')}
        onSave={(val) => onSave(row.rowNumber, 'series', val)}
        onCancel={onCancel}
        align="center"
        width="20%"
      />
    </TableRow>
  );
}
