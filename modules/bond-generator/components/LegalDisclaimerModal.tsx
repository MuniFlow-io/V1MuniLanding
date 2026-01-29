'use client';

/**
 * Legal Disclaimer Modal
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Shows on first use to inform user of tool limitations
 * - User responsibility, no legal advice, review required
 * - Cannot dismiss (must accept)
 * - Complies with Elite Standards: <150 lines, typed props, no logic
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
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface LegalDisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export function LegalDisclaimerModal({ open, onAccept }: LegalDisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <Dialog
      open={open}
      maxWidth="md"
      disableEscapeKeyDown // Force user to accept - cannot dismiss
    >
      <DialogTitle sx={{ pb: 1 }}>Important Legal Notice</DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please read and accept before proceeding
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Disclaimer 1: User Responsibility */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              1. User Responsibility
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This tool generates bond certificates based on your uploaded data.{' '}
              <strong>
                You are solely responsible for the accuracy and completeness of all inputs.
              </strong>{' '}
              The tool performs no validation beyond format checking.
            </Typography>
          </Box>

          {/* Disclaimer 2: Not Legal Advice */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              2. Not Legal Advice
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This tool <strong>does not provide legal advice</strong> and does not replace the
              judgment of qualified bond counsel. All outputs must be reviewed by appropriate legal
              professionals before use.
            </Typography>
          </Box>

          {/* Disclaimer 3: Review Required */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              3. Review Before Execution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>All generated documents must be thoroughly reviewed</strong> by qualified
              legal counsel before execution or filing. The tool makes no representations regarding
              compliance with applicable laws or regulations.
            </Typography>
          </Box>

          {/* Disclaimer 4: Data Privacy */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              4. Data Processing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uploaded files are processed in memory and not permanently stored on our servers.
              Generated documents are your responsibility to secure. We retain no copies after
              download.
            </Typography>
          </Box>
        </Box>

        {/* Acceptance Checkbox */}
        <FormControlLabel
          sx={{ mt: 3 }}
          control={<Checkbox checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />}
          label={
            <Typography variant="body2">
              I understand and accept these terms. I am responsible for reviewing all outputs before
              use.
            </Typography>
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onAccept} disabled={!accepted} variant="contained" size="large">
          Accept & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
