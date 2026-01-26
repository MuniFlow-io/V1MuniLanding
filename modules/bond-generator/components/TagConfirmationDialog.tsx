/**
 * Tag Confirmation Dialog Component
 * Confirms user wants to proceed after tagging
 * Shows summary of what was tagged
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - NO hooks, NO business logic
 * - Pure UI confirmation dialog
 */

import { Check } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { getTagDisplayName } from '../types/tagConstants';

interface AssignedTag {
  id: string;
  tag: string;
  text: string;
}

interface TagConfirmationDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;
  /** All assigned tags */
  assignedTags: AssignedTag[];
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
}

/**
 * Dialog that appears when user clicks "Save & Continue"
 * Shows summary of tags and confirms they want to proceed
 */
export function TagConfirmationDialog({
  isOpen,
  assignedTags,
  onConfirm,
  onCancel,
}: TagConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Check color="success" />
        <span>Confirm Tag Assignments</span>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          You've assigned <strong>{assignedTags.length} tags</strong> to your bond form template.
        </Typography>

        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'success.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'success.200',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Assigned Tags:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {assignedTags.map((at) => (
              <Chip key={at.id} label={getTagDisplayName(at.tag)} size="small" color="success" />
            ))}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>What happens next?</strong>
          <br />
          In the next step, you'll upload your:
        </Typography>
        <Box component="ul" sx={{ mt: 1, mb: 2, pl: 3 }}>
          <li>
            <Typography variant="body2" color="text.secondary">
              <strong>Maturity Schedule</strong> (Excel file with dates, amounts, rates)
            </Typography>
          </li>
          <li>
            <Typography variant="body2" color="text.secondary">
              <strong>CUSIP File</strong> (Excel file with CUSIP Numbers)
            </Typography>
          </li>
        </Box>

        <Typography variant="body2" color="text.secondary">
          We'll use these files to fill in the tagged sections of your bond form and generate
          individual bond certificates for each maturity.
        </Typography>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: 'info.50',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'info.main',
          }}
        >
          <Typography variant="caption" color="info.dark">
            <strong>Note:</strong> After confirming, you won't be able to edit these tag
            assignments. Make sure everything is correct before proceeding.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Go Back & Review</Button>
        <Button variant="contained" onClick={onConfirm} color="success" autoFocus>
          Confirm & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
