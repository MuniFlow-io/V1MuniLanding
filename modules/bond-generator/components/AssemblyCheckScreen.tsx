'use client';

/**
 * Assembly Check Screen Component
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - NO hooks
 * - NO business logic
 * - Just displays assembly metadata before generation
 * - Read-only preview per spec Section 11
 */

import { Alert, Box, Button, Divider, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import type { AssembledBond } from '../types';
import { BondsPreviewTable } from './BondsPreviewTable';
import { FinalityConfirmationModal } from './FinalityConfirmationModal';
import { formatGroupingMethod } from '../utils/displayHelpers';

export interface BondInfo {
  issuerName: string;
  bondTitle: string;
  interestDates: {
    firstDate: Date | null;
    secondDate: Date | null;
  };
}

interface AssemblyCheckScreenProps {
  bonds: AssembledBond[];
  datedDate: string;
  bondInfo: BondInfo;
  onGenerate: () => void;
  onGoBack: () => void;
  isGenerating?: boolean;
}

export function AssemblyCheckScreen(props: AssemblyCheckScreenProps) {
  const { bonds, datedDate, bondInfo, onGenerate, onGoBack, isGenerating } = props;

  // State for finality modal (shows on first load)
  const [showFinalityModal, setShowFinalityModal] = useState(true);
  const [finalityConfirmed, setFinalityConfirmed] = useState(false);

  // Calculate metadata
  const seriesDetected = [...new Set(bonds.map((b) => b.series).filter(Boolean))];
  const joinRule = seriesDetected.length > 1 ? 'maturity_date + series' : 'maturity_date';

  // Show first 3 + last 3 for spot check (per spec Section 11)
  const spotCheckBonds = bonds.length > 6 ? [...bonds.slice(0, 3), ...bonds.slice(-3)] : bonds;

  // Format interest dates for display
  const formatInterestDatesDisplay = (): string => {
    if (!bondInfo.interestDates.firstDate || !bondInfo.interestDates.secondDate) {
      return 'Not specified';
    }
    const first = bondInfo.interestDates.firstDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
    const second = bondInfo.interestDates.secondDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
    return `${first} and ${second}`;
  };

  return (
    <Box>
      {/* Finality Modal - Shows on first load */}
      <FinalityConfirmationModal
        open={showFinalityModal && !finalityConfirmed}
        bondInfo={bondInfo}
        onConfirm={() => {
          setFinalityConfirmed(true);
          setShowFinalityModal(false);
        }}
        onCancel={() => {
          // Go back to preview
          onGoBack();
        }}
      />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Final Review
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Review all bond information below before generating certificates.
        </Typography>
        <Alert severity="info" sx={{ mb: 0 }}>
          <strong>Important:</strong> Once you click "Generate Bonds", these documents will be final
          and cannot be changed.
        </Alert>
      </Box>

      {/* Metadata Display - Per spec Section 11 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Bond Information Summary
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
          <Box sx={{ flex: '1 1 120px', minWidth: 100 }}>
            <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
              Total Bonds
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {bonds.length > 0 ? bonds.length : '—'}
            </Typography>
          </Box>

          <Box sx={{ flex: '1 1 120px', minWidth: 100 }}>
            <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
              Series
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {seriesDetected.length > 0 ? seriesDetected.join(', ') : '—'}
            </Typography>
          </Box>

          <Box sx={{ flex: '1 1 120px', minWidth: 100 }}>
            <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
              Issue Date
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {datedDate || '—'}
            </Typography>
          </Box>

          <Box sx={{ flex: '1 1 120px', minWidth: 100 }}>
            <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
              Matched By
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatGroupingMethod(joinRule)}
            </Typography>
          </Box>
        </Box>

        {/* Only show Bond Information section if at least one field has a value */}
        {(bondInfo.issuerName ||
          bondInfo.bondTitle ||
          bondInfo.interestDates.firstDate ||
          bondInfo.interestDates.secondDate) && (
          <>
            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              Optional Information
            </Typography>
            <Box sx={{ pl: 2 }}>
              {bondInfo.issuerName && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Issuer:</strong> {bondInfo.issuerName}
                </Typography>
              )}
              {bondInfo.bondTitle && (
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Bond Title:</strong> {bondInfo.bondTitle}
                </Typography>
              )}
              {(bondInfo.interestDates.firstDate || bondInfo.interestDates.secondDate) && (
                <Typography variant="body2">
                  <strong>Interest Payment Dates:</strong> {formatInterestDatesDisplay()}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Paper>

      {/* Spot Check Table - Per spec Section 11 */}
      <Typography variant="h6" gutterBottom>
        Spot Check {bonds.length > 6 && '(First 3 + Last 3)'}
      </Typography>
      <BondsPreviewTable bonds={spotCheckBonds} />

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onGoBack} disabled={isGenerating}>
          Go Back
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={onGenerate}
          disabled={isGenerating}
          color="primary"
        >
          {isGenerating ? 'Generating...' : 'Looks Good - Generate Bonds'}
        </Button>
      </Box>
    </Box>
  );
}
