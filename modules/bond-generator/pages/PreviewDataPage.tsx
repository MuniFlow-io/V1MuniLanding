'use client';

/**
 * Preview Data Page
 *
 * ARCHITECTURE: Page Component
 * - Shows parsed maturity + CUSIP data with inline editing
 * - User can fix parsing errors before proceeding
 * - NO business logic (uses hooks)
 */

import { Alert, Box, Button, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { parseCusipApi, parseMaturityApi } from '../api/bondGeneratorApi';
import { CusipSchedulePreview } from '../components/CusipSchedulePreview';
import { MaturitySchedulePreview } from '../components/MaturitySchedulePreview';
import { useCusipPreview } from '../hooks/useCusipPreview';
import { useMaturityPreview } from '../hooks/useMaturityPreview';

interface PreviewDataPageProps {
  maturityFile: File;
  cusipFile: File;
  onContinue: () => void;
  onCancel: () => void;
}

export function PreviewDataPage({
  maturityFile,
  cusipFile,
  onContinue,
  onCancel,
}: PreviewDataPageProps) {
  const [activeTab, setActiveTab] = useState<'maturity' | 'cusip'>('maturity');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const maturityPreview = useMaturityPreview();
  const cusipPreview = useCusipPreview();

  // Load parsed data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Parse both files in parallel
        const [maturityResult, cusipResult] = await Promise.all([
          parseMaturityApi(maturityFile),
          parseCusipApi(cusipFile),
        ]);

        maturityPreview.setSchedule(maturityResult);
        cusipPreview.setSchedule(cusipResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse files');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Only run once on mount

  const hasMaturityErrors = maturityPreview.schedule?.summary.errors ?? 0 > 0;
  const hasCusipErrors = cusipPreview.schedule?.summary.errors ?? 0 > 0;

  const maturityValid = maturityPreview.schedule?.summary.valid ?? 0;
  const cusipValid = cusipPreview.schedule?.summary.valid ?? 0;
  const totalMaturityRows = maturityPreview.schedule?.rows.length ?? 0;
  const totalCusipRows = cusipPreview.schedule?.rows.length ?? 0;

  /**
   * Calculate what's blocking the user from proceeding (if anything)
   * Returns null if user can proceed
   */
  const getBlockReason = (): string | null => {
    // Priority 1: Errors (must fix first)
    if (hasMaturityErrors) {
      const errorCount = maturityPreview.schedule?.summary.errors ?? 0;
      return `Fix ${errorCount} error${errorCount > 1 ? 's' : ''} in maturity schedule`;
    }
    if (hasCusipErrors) {
      const errorCount = cusipPreview.schedule?.summary.errors ?? 0;
      return `Fix ${errorCount} error${errorCount > 1 ? 's' : ''} in CUSIP schedule`;
    }

    // Priority 2: Confirmations (must check all rows in BOTH schedules)
    if (!maturityPreview.allRowsConfirmed) {
      const unchecked = totalMaturityRows - maturityPreview.confirmedCount;
      return `Check ${unchecked} remaining maturity row${unchecked > 1 ? 's' : ''}`;
    }
    if (!cusipPreview.allRowsConfirmed) {
      const unchecked = totalCusipRows - cusipPreview.confirmedCount;
      return `Check ${unchecked} remaining CUSIP row${unchecked > 1 ? 's' : ''}`;
    }

    // Priority 3: No valid data
    if (maturityValid === 0) {
      return 'No valid maturity rows to process';
    }
    if (cusipValid === 0) {
      return 'No valid CUSIP rows to process';
    }

    return null; // All good - can proceed!
  };

  const blockReason = getBlockReason();
  const canContinue = blockReason === null;

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Parsing Excel Files...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reading maturity schedule and CUSIP data
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={onCancel}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Step 4: Review Parsed Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review the parsed data below. Click any cell to edit and fix errors.
        </Typography>
      </Box>

      {/* Summary Alert */}
      {!blockReason && maturityValid > 0 && cusipValid > 0 && (
        <Alert severity="success">
          All data parsed successfully! {maturityValid} maturities, {cusipValid} CUSIPs ready.
        </Alert>
      )}

      {blockReason && <Alert severity="warning">{blockReason}</Alert>}

      {/* Tabs for Maturity vs CUSIP */}
      <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
        <Tab
          label={`Maturity Schedule (${maturityValid}/${maturityPreview.schedule?.summary.total ?? 0})`}
          value="maturity"
        />
        <Tab
          label={`CUSIP Schedule (${cusipValid}/${cusipPreview.schedule?.summary.total ?? 0})`}
          value="cusip"
        />
      </Tabs>

      {/* Maturity Preview */}
      {activeTab === 'maturity' && maturityPreview.schedule && (
        <MaturitySchedulePreview
          schedule={maturityPreview.schedule}
          editingCell={maturityPreview.editingCell}
          onEditCell={maturityPreview.editCell}
          onSaveCell={maturityPreview.saveCell}
          onCancelEdit={maturityPreview.cancelEdit}
          onToggleConfirm={maturityPreview.toggleConfirmation}
          onCheckAllValid={maturityPreview.checkAllValid}
          onUncheckAll={maturityPreview.uncheckAll}
          confirmedCount={maturityPreview.confirmedCount}
          totalRows={maturityPreview.schedule.rows.length}
        />
      )}

      {/* CUSIP Preview */}
      {activeTab === 'cusip' && cusipPreview.schedule && (
        <CusipSchedulePreview
          schedule={cusipPreview.schedule}
          editingCell={cusipPreview.editingCell}
          onEditCell={cusipPreview.editCell}
          onSaveCell={cusipPreview.saveCell}
          onCancelEdit={cusipPreview.cancelEdit}
          onToggleConfirm={cusipPreview.toggleConfirmation}
          onCheckAllValid={cusipPreview.checkAllValid}
          onUncheckAll={cusipPreview.uncheckAll}
          confirmedCount={cusipPreview.confirmedCount}
          totalRows={cusipPreview.schedule.rows.length}
        />
      )}

      {/* Bottom Actions (always visible) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onContinue} disabled={!canContinue}>
          {canContinue ? `Continue to Final Review (${maturityValid} Bonds Ready)` : blockReason}
        </Button>
      </Box>
    </Box>
  );
}
