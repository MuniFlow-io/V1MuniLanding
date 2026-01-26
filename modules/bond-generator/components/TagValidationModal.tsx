/**
 * Tag Validation Modal Component
 * Blocks user from proceeding if required tags are missing
 * Shows clear error message with what's needed
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - NO hooks, NO business logic
 * - Pure UI modal for validation errors
 */

import { Warning } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { getTagDisplayName } from '../types/tagConstants';

interface TagValidationModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** List of missing required tag names */
  missingTags: string[];
  /** Callback when user clicks OK to go back and finish */
  onClose: () => void;
}

/**
 * Modal that appears when user tries to proceed without all required tags
 * Prevents them from moving forward until tags are complete
 */
export function TagValidationModal({ isOpen, missingTags, onClose }: TagValidationModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        <span>Cannot Proceed - Missing Required Tags</span>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          You must assign all{' '}
          <strong>
            {missingTags.length} required tag{missingTags.length !== 1 ? 's' : ''}
          </strong>{' '}
          before continuing.
        </Typography>

        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'warning.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'warning.200',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Missing Required Tags:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3 }}>
            {missingTags.map((tag) => (
              <li key={tag}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {getTagDisplayName(tag)}
                </Typography>
              </li>
            ))}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Why are these required?</strong>
          <br />
          These tags are essential for generating bond certificates. When you upload your maturity
          schedule and CUSIP files in the next step, we'll use these tags to know where to insert
          each piece of information in the final bond documents.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>How to complete:</strong>
          <br />
          1. Select text in the document (like underscores or field names)
          <br />
          2. Choose the appropriate tag from the popup
          <br />
          3. Repeat until all required tags are assigned
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onClose} autoFocus>
          OK, I'll Complete the Tags
        </Button>
      </DialogActions>
    </Dialog>
  );
}
