/**
 * Bond Drafts List Component
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Renders grid of draft cards
 * - Pure presentation
 * - <100 lines (organism)
 */

import { Box } from '@mui/material';
import type { BondDraft } from '../types';
import { BondDraftCard } from './molecules/BondDraftCard';

interface BondDraftsListProps {
  drafts: BondDraft[];
  onResume: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}

export function BondDraftsList(props: BondDraftsListProps) {
  const { drafts, onResume, onDelete } = props;

  return (
    <Box
      sx={{
        mt: 3,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
    >
      {drafts.map((draft) => (
        <BondDraftCard key={draft.id} draft={draft} onResume={onResume} onDelete={onDelete} />
      ))}
    </Box>
  );
}
