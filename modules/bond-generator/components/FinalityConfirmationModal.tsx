'use client';

/**
 * Finality Confirmation Modal
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - NO hooks (except local UI state for checkboxes)
 * - NO business logic
 * - Just renders modal UI
 * - Passes user action to parent via callback
 */

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export interface BondInfo {
  issuerName: string;
  bondTitle: string;
  interestDates: {
    firstDate: Date | null;
    secondDate: Date | null;
  };
}

interface FinalityConfirmationModalProps {
  open: boolean;
  bondInfo: BondInfo;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FinalityConfirmationModal(props: FinalityConfirmationModalProps) {
  const { open, bondInfo, onConfirm, onCancel } = props;

  // Local UI state (not business logic - just checkbox states)
  const [checked, setChecked] = useState({
    template: false,
    bondInfo: false,
    maturity: false,
    cusip: false,
  });

  const allChecked = checked.template && checked.bondInfo && checked.maturity && checked.cusip;

  // Format interest dates for display
  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return 'Not selected';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleConfirm = () => {
    onConfirm();
    // Reset checkboxes for next time
    setChecked({ template: false, bondInfo: false, maturity: false, cusip: false });
  };

  const handleCancel = () => {
    onCancel();
    // Reset checkboxes
    setChecked({ template: false, bondInfo: false, maturity: false, cusip: false });
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Finality</DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          This action locks all inputs. Changes will require re-uploading files.
        </Alert>

        {/* Bond Information Review - Only show provided fields */}
        {(bondInfo.issuerName ||
          bondInfo.bondTitle ||
          bondInfo.interestDates.firstDate ||
          bondInfo.interestDates.secondDate) && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              fontWeight="600"
              gutterBottom
              sx={{ color: 'text.secondary' }}
            >
              Bond Information:
            </Typography>
            <Box sx={{ pl: 0, mt: 1 }}>
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
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Interest Dates:</strong>{' '}
                  {formatDateForDisplay(bondInfo.interestDates.firstDate)}
                  {bondInfo.interestDates.secondDate &&
                    ` and ${formatDateForDisplay(bondInfo.interestDates.secondDate)}`}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2, color: 'text.secondary' }}>
          Please confirm:
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked.template}
                onChange={(e) => setChecked({ ...checked, template: e.target.checked })}
              />
            }
            label="Template approved by counsel"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checked.bondInfo}
                onChange={(e) => setChecked({ ...checked, bondInfo: e.target.checked })}
              />
            }
            label="Bond information verified"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checked.maturity}
                onChange={(e) => setChecked({ ...checked, maturity: e.target.checked })}
              />
            }
            label="Maturity schedule verified"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checked.cusip}
                onChange={(e) => setChecked({ ...checked, cusip: e.target.checked })}
              />
            }
            label="CUSIP file verified"
          />
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={!allChecked} variant="contained" color="primary">
          Confirm & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
