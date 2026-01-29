/**
 * CusipSchedulePreview Component
 *
 * ARCHITECTURE: Organism Component
 * - Shows parsed CUSIP schedule with editing capability
 * - NO hooks (state passed via props)
 * - NO business logic
 * - Calls callbacks for user actions
 */

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Warning } from '@mui/icons-material';
import type {
  CusipSchedulePreview as CusipSchedulePreviewData,
  EditableCusipField,
} from '../types/cusipPreview';
import { CusipRowPreview } from './molecules/CusipRowPreview';

interface CusipSchedulePreviewProps {
  schedule: CusipSchedulePreviewData;
  editingCell: { rowNumber: number; field: EditableCusipField } | null;
  onEditCell: (rowNumber: number, field: EditableCusipField) => void;
  onSaveCell: (rowNumber: number, field: EditableCusipField, value: string) => void;
  onCancelEdit: () => void;
  onToggleConfirm: (rowNumber: number) => void;
  onCheckAllValid: () => void;
  onUncheckAll: () => void;
  confirmedCount: number;
  totalRows: number;
}

export function CusipSchedulePreview({
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
}: CusipSchedulePreviewProps) {
  const { summary, diagnostics } = schedule;
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
            CUSIP Schedule
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

      {/* Format Indicator and Alerts */}
      <Box>
        {/* Format Indicator */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={diagnostics.hasMultiColumnCusip ? 'Split-Column Format' : 'Single-Column Format'}
            size="small"
            color="info"
          />
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

        {/* Summary Card with Icons - Match Maturity style */}
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
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '60px', textAlign: 'center' }}>
                <Checkbox size="small" disabled />
              </TableCell>
              <TableCell>Row #</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>CUSIP Number</TableCell>
              <TableCell>Maturity Date</TableCell>
              <TableCell>Series</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.rows.map((row) => (
              <CusipRowPreview
                key={row.rowNumber}
                row={row}
                editingCell={editingCell}
                onEdit={onEditCell}
                onSave={onSaveCell}
                onCancel={onCancelEdit}
                onToggleConfirm={onToggleConfirm}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
