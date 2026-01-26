/**
 * StatusBadge Component
 *
 * ARCHITECTURE: Atom Component
 * - Shows validation status with color coding
 * - NO logic, NO state
 * - Pure presentation
 */

import { CheckCircle, Error as ErrorIcon, Remove, Warning } from '@mui/icons-material';
import { Box } from '@mui/material';

type StatusType = 'valid' | 'warning' | 'error' | 'skipped';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
  errors?: string[];
  warnings?: string[];
}

export function StatusBadge({ status, size: _size = 'small' }: StatusBadgeProps): JSX.Element {
  // Icon-only design (cleaner, more professional)
  const iconConfig: Record<StatusType, { icon: JSX.Element; color: string }> = {
    valid: {
      icon: <CheckCircle />,
      color: 'success.main',
    },
    warning: {
      icon: <Warning />,
      color: 'warning.main',
    },
    error: {
      icon: <ErrorIcon />,
      color: 'error.main',
    },
    skipped: {
      icon: <Remove />,
      color: 'text.disabled',
    },
  };

  // Defensive: Use 'valid' as default if status is invalid/undefined
  const config = iconConfig[status] || iconConfig.valid;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: config.color,
      }}
    >
      {config.icon}
    </Box>
  );
}
