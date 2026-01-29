'use client';

/**
 * useMaturityPreview Hook
 *
 * ARCHITECTURE: Hook Layer (Layer 2)
 * - Manages maturity schedule preview state
 * - Handles editing, validation
 * - NO direct API calls (uses Frontend API)
 * - Returns typed interface
 */

import { useCallback, useState } from 'react';
import type {
  EditableField,
  MaturitySchedulePreview,
  ParsedMaturityRow,
  RowStatus,
} from '../types/maturityPreview';

export interface UseMaturityPreviewReturn {
  schedule: MaturitySchedulePreview | null;
  editingCell: { rowNumber: number; field: EditableField } | null;
  setSchedule: (schedule: MaturitySchedulePreview) => void;
  editCell: (rowNumber: number, field: EditableField) => void;
  saveCell: (rowNumber: number, field: EditableField, value: string) => void;
  cancelEdit: () => void;
  toggleConfirmation: (rowNumber: number) => void;
  checkAllValid: () => void;
  uncheckAll: () => void;
  allRowsConfirmed: boolean;
  confirmedCount: number;
  getValidRows: () => ParsedMaturityRow[];
}

/**
 * Hook for managing maturity schedule preview and editing
 *
 * @returns Maturity preview state and actions
 */
export function useMaturityPreview(): UseMaturityPreviewReturn {
  const [schedule, setScheduleState] = useState<MaturitySchedulePreview | null>(null);
  const [editingCell, setEditingCell] = useState<{
    rowNumber: number;
    field: EditableField;
  } | null>(null);

  /**
   * Set the initial parsed schedule
   */
  const setSchedule = useCallback((newSchedule: MaturitySchedulePreview) => {
    setScheduleState(newSchedule);
  }, []);

  /**
   * Start editing a cell
   */
  const editCell = useCallback((rowNumber: number, field: EditableField) => {
    setEditingCell({ rowNumber, field });
  }, []);

  /**
   * Save edited cell value
   */
  const saveCell = useCallback(
    (rowNumber: number, field: EditableField, value: string) => {
      if (!schedule) return;

      // Update the row with new value
      const updatedRows = schedule.rows.map((row) => {
        if (row.rowNumber !== rowNumber) return row;

        const updatedRow = { ...row };
        const errors = row.errors ? [...row.errors] : [];
        const warnings = row.warnings ? [...row.warnings] : [];

        // Update the field value
        if (field === 'maturity_date') {
          updatedRow.maturity_date = value || null;
          // Remove maturity date errors
          const errorIndex = errors.findIndex((e) => e.includes('Maturity Date'));
          if (errorIndex !== -1) errors.splice(errorIndex, 1);
        } else if (field === 'principal_amount') {
          const num = parseFloat(value);
          updatedRow.principal_amount = isNaN(num) ? null : num;
          // Remove principal errors
          const errorIndex = errors.findIndex((e) => e.includes('Principal Amount'));
          if (errorIndex !== -1) errors.splice(errorIndex, 1);
        } else if (field === 'coupon_rate') {
          const num = parseFloat(value);
          updatedRow.coupon_rate = isNaN(num) ? null : num;
          // Remove rate errors
          const errorIndex = errors.findIndex((e) => e.includes('Coupon Rate'));
          if (errorIndex !== -1) errors.splice(errorIndex, 1);
        } else if (field === 'series') {
          updatedRow.series = value || null;
        }

        // Update status based on remaining errors
        updatedRow.errors = errors;
        updatedRow.warnings = warnings;
        updatedRow.status = determineRowStatus(errors, warnings);

        return updatedRow;
      });

      // Recalculate summary
      const summary = {
        total: updatedRows.length,
        valid: updatedRows.filter((r) => r.status === 'valid').length,
        warnings: updatedRows.filter((r) => r.status === 'warning').length,
        errors: updatedRows.filter((r) => r.status === 'error').length,
        skipped: updatedRows.filter((r) => r.status === 'skipped').length,
      };

      setScheduleState({
        ...schedule,
        rows: updatedRows,
        summary,
      });

      setEditingCell(null);
    },
    [schedule]
  );

  /**
   * Cancel editing
   */
  const cancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  /**
   * Toggle row confirmation checkbox
   */
  const toggleConfirmation = useCallback(
    (rowNumber: number) => {
      if (!schedule) return;

      const updatedRows = schedule.rows.map((row) => {
        if (row.rowNumber !== rowNumber) return row;
        return { ...row, confirmed: !row.confirmed };
      });

      setScheduleState({
        ...schedule,
        rows: updatedRows,
      });
    },
    [schedule]
  );

  /**
   * Check all rows that don't have errors
   */
  const checkAllValid = useCallback(() => {
    if (!schedule) return;

    const updatedRows = schedule.rows.map((row) => ({
      ...row,
      confirmed: row.status !== 'error', // Only check non-error rows
    }));

    setScheduleState({
      ...schedule,
      rows: updatedRows,
    });
  }, [schedule]);

  /**
   * Uncheck all rows
   */
  const uncheckAll = useCallback(() => {
    if (!schedule) return;

    const updatedRows = schedule.rows.map((row) => ({
      ...row,
      confirmed: false,
    }));

    setScheduleState({
      ...schedule,
      rows: updatedRows,
    });
  }, [schedule]);

  /**
   * Check if all rows are confirmed
   */
  const allRowsConfirmed = schedule?.rows.every((row) => row.confirmed === true) ?? false;

  /**
   * Count of confirmed rows
   */
  const confirmedCount = schedule?.rows.filter((row) => row.confirmed === true).length ?? 0;

  /**
   * Get only valid rows (for continuing to next step)
   */
  const getValidRows = useCallback((): ParsedMaturityRow[] => {
    if (!schedule) return [];
    return schedule.rows.filter((row) => row.status === 'valid');
  }, [schedule]);

  return {
    schedule,
    editingCell,
    setSchedule,
    editCell,
    saveCell,
    cancelEdit,
    toggleConfirmation,
    checkAllValid,
    uncheckAll,
    allRowsConfirmed,
    confirmedCount,
    getValidRows,
  };
}

/**
 * Helper: Determine row status based on errors and warnings
 */
function determineRowStatus(errors: string[], warnings: string[]): RowStatus {
  if (errors.length > 0) return 'error';
  if (warnings.length > 0) return 'warning';
  return 'valid';
}
