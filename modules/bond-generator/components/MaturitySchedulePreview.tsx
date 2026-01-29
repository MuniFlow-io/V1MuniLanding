/**
 * MaturitySchedulePreview Component
 *
 * ARCHITECTURE: Organism Component
 * - Shows parsed maturity schedule with editing capability
 * - NO hooks (state passed via props)
 * - NO business logic
 * - Calls callbacks for user actions
 */

import { CheckCircle, Error as ErrorIcon, Warning } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type {
  EditableField,
  MaturitySchedulePreview as MaturitySchedulePreviewData,
} from '../types/maturityPreview';
import { formatCurrency } from '../utils/formatCurrency';
import { MaturityRowPreview } from './molecules/MaturityRowPreview';

interface MaturitySchedulePreviewProps {
  schedule: MaturitySchedulePreviewData;
  editingCell: { rowNumber: number; field: EditableField } | null;
  onEditCell: (rowNumber: number, field: EditableField) => void;
  onSaveCell: (rowNumber: number, field: EditableField, value: string) => void;
  onCancelEdit: () => void;
  onToggleConfirm: (rowNumber: number) => void;
  onCheckAllValid: () => void;
  onUncheckAll: () => void;
  confirmedCount: number;
  totalRows: number;
}

export function MaturitySchedulePreview({
  schedule,
  editingCell,
  onEditCell,
  onSaveCell,
  onCancelEdit,
  onToggleConfirm,
  onCheckAllValid,
  onUncheckAll,
  confirmedCount,
  totalRows,
}: MaturitySchedulePreviewProps) {
  const { summary } = schedule;
  const hasErrors = summary.errors > 0;
  const hasWarnings = summary.warnings > 0;
  const allConfirmed = confirmedCount === totalRows;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header with Action Buttons */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
            Maturity Schedule
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
            Review each row and check the box to confirm. Click any cell to edit.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onCheckAllValid}
            disabled={hasErrors || allConfirmed}
          >
            Check All Valid
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={onUncheckAll}
            disabled={confirmedCount === 0}
          >
            Uncheck All
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Found {summary.errors} rows with errors. Click on cells to edit and fix issues.
        </Alert>
      )}

      {hasWarnings && !hasErrors && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Found {summary.warnings} rows with warnings. Review before continuing.
        </Alert>
      )}

      {/* Redesigned Summary Section - Cleaner Layout */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          p: 2,
          backgroundColor: hasErrors
            ? 'error.lighter'
            : hasWarnings
              ? 'warning.lighter'
              : 'success.lighter',
          borderRadius: 1,
          border: 1,
          borderColor: hasErrors ? 'error.main' : hasWarnings ? 'warning.main' : 'success.main',
          mb: 2,
        }}
      >
        {/* Status Icon + Two-line format */}
        {hasErrors ? (
          <>
            <ErrorIcon sx={{ color: 'error.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Errors Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.errors} {summary.errors === 1 ? 'row needs' : 'rows need'} correction
              </Typography>
            </Box>
          </>
        ) : hasWarnings ? (
          <>
            <Warning sx={{ color: 'warning.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Warnings Detected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.warnings} {summary.warnings === 1 ? 'row has' : 'rows have'} warnings
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                All Valid
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.total} {summary.total === 1 ? 'row' : 'rows'} ready
              </Typography>
            </Box>
          </>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Typography variant="body2">
            <strong>{summary.total}</strong> rows
          </Typography>
          {summary.valid > 0 && (
            <Typography variant="body2" sx={{ color: 'success.dark' }}>
              <strong>{summary.valid}</strong> valid
            </Typography>
          )}
          {summary.warnings > 0 && (
            <Typography variant="body2" sx={{ color: 'warning.dark' }}>
              <strong>{summary.warnings}</strong> warnings
            </Typography>
          )}
          {summary.errors > 0 && (
            <Typography variant="body2" sx={{ color: 'error.dark' }}>
              <strong>{summary.errors}</strong> errors
            </Typography>
          )}
          {/* Confirmation Status */}
          {allConfirmed ? (
            <Typography
              variant="body2"
              sx={{ color: 'success.dark', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <strong>All rows checked</strong> ✓
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>
                {confirmedCount}/{totalRows}
              </strong>{' '}
              checked
            </Typography>
          )}
        </Box>
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '60px', textAlign: 'center', fontWeight: 600 }}>✓</TableCell>
              <TableCell sx={{ width: '10%', textAlign: 'center', fontWeight: 600 }}>
                Status
              </TableCell>
              <TableCell sx={{ width: '18%', textAlign: 'left', fontWeight: 600 }}>
                Maturity Date
              </TableCell>
              <TableCell sx={{ width: '27%', textAlign: 'center', fontWeight: 600 }}>
                Principal Amount
              </TableCell>
              <TableCell sx={{ width: '20%', textAlign: 'center', fontWeight: 600 }}>
                Coupon Rate (%)
              </TableCell>
              <TableCell sx={{ width: '20%', textAlign: 'center', fontWeight: 600 }}>
                Series
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.rows.map((row) => (
              <MaturityRowPreview
                key={row.rowNumber}
                row={row}
                editingCell={editingCell}
                onEdit={onEditCell}
                onSave={onSaveCell}
                onCancel={onCancelEdit}
                onToggleConfirm={onToggleConfirm}
              />
            ))}

            {/* TOTAL ROW - Centered with label and amount together */}
            <TableRow
              sx={{
                borderTop: '3px double',
                borderColor: 'primary.main',
                backgroundColor: 'transparent',
              }}
            >
              {/* Total spans all columns, centered */}
              <TableCell
                colSpan={6}
                sx={{
                  textAlign: 'center',
                  pt: 2.5,
                  pb: 2,
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    TOTAL PRINCIPAL:
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'primary.main' }}>
                    {(() => {
                      // Sum ALL rows with valid principal amounts (not just 'valid' status)
                      // Rows with warnings/errors may still have valid amounts to sum
                      let total = 0;

                      schedule.rows.forEach((row) => {
                        // Check if principal_amount is a valid number (not null, not NaN)
                        if (
                          typeof row.principal_amount === 'number' &&
                          !isNaN(row.principal_amount)
                        ) {
                          total += row.principal_amount;
                        }
                      });

                      return formatCurrency(total);
                    })()}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
