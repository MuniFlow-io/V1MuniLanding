/**
 * Empty State Component
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Pure presentation, no logic
 * - Shows "nothing here" message with icon
 * - <50 lines (atom)
 */

import { Box, Button, Typography } from '@mui/material';
import { Description } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState(props: EmptyStateProps) {
  const { icon, title, description, actionLabel, onAction } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box sx={{ mb: 2, color: 'text.secondary', opacity: 0.5 }}>
        {icon || <Description sx={{ fontSize: 80 }} />}
      </Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" size="large" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
