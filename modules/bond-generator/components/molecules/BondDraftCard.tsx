/**
 * Bond Draft Card Component
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Shows single draft with metadata
 * - Resume and Delete buttons
 * - <150 lines (molecule)
 */

import { DeleteOutline, PlayArrow } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import type { BondDraft } from '../../types';

interface BondDraftCardProps {
  draft: BondDraft;
  onResume: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}

export function BondDraftCard(props: BondDraftCardProps) {
  const { draft, onResume, onDelete } = props;

  const getStepLabel = (step: string): string => {
    const labels: Record<string, string> = {
      'upload-template': 'Upload Template',
      tagging: 'Tagging Blanks',
      'upload-data': 'Upload Data',
      'preview-data': 'Preview Data',
      finality: 'Confirm Finality',
      'assembly-check': 'Assembly Check',
      generating: 'Generating',
      complete: 'Complete',
    };
    return labels[step] || step;
  };

  const getStepColor = (step: string) => {
    if (step === 'complete') return 'success';
    if (step === 'generating') return 'warning';
    return 'primary';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filesUploaded = [
    draft.template_file?.filename,
    draft.maturity_file?.filename,
    draft.cusip_file?.filename,
  ].filter(Boolean);

  return (
    <Card
      sx={{
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s',
        },
      }}
    >
      <CardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Box sx={{ flex: 1 }}>
            <Chip
              label={getStepLabel(draft.current_step)}
              color={getStepColor(draft.current_step)}
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Last saved: {formatDate(draft.updated_at)}
            </Typography>
          </Box>
          <Tooltip title="Delete draft">
            <IconButton
              size="small"
              onClick={() => onDelete(draft.id)}
              sx={{ color: 'error.main' }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {filesUploaded.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Files ({filesUploaded.length}/3):
            </Typography>
            {filesUploaded.map((filename, idx) => (
              <Typography
                key={idx}
                variant="caption"
                display="block"
                sx={{ ml: 1, color: 'text.primary' }}
              >
                • {filename}
              </Typography>
            ))}
          </Box>
        )}

        {draft.tag_map && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${draft.tag_map.tags.length} tags assigned`}
              size="small"
              variant="outlined"
              color="success"
            />
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          startIcon={<PlayArrow />}
          onClick={() => onResume(draft.id)}
        >
          Resume
        </Button>
      </CardContent>
    </Card>
  );
}
