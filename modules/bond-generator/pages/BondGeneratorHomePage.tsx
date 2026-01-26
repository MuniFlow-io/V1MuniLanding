/**
 * Bond Generator Home Page
 *
 * ARCHITECTURE: Page (Layer 1) - COMPOSITION
 * - Entry point for bond generator
 * - Shows drafts list OR empty state
 * - Uses hook for all logic
 * - <150 lines
 */

import { Add, Description } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Container, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { EmptyState } from '../components/atoms/EmptyState';
import { BondDraftsList } from '../components/BondDraftsList';
import { useBondDrafts } from '../hooks/useBondDrafts';

export function BondGeneratorHomePage() {
  const router = useRouter();
  const { drafts, isLoading, error, deleteDraft } = useBondDrafts();

  const handleStartNew = () => {
    router.push('/bond-generator/wizard?new=true');
  };

  const handleResume = (draftId: string) => {
    router.push(`/bond-generator/wizard?draftId=${draftId}`);
  };

  const handleDelete = async (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft? This cannot be undone.')) {
      try {
        await deleteDraft(draftId);
      } catch {
        // Error already set in hook
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 2 }}>
          {/* Header */}
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                Bond Certificate Generator
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create professional bond certificates from your templates
              </Typography>
            </Box>
            <Button variant="contained" size="large" startIcon={<Add />} onClick={handleStartNew}>
              Start New
            </Button>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Empty State */}
          {!isLoading && drafts.length === 0 && (
            <EmptyState
              icon={<Description sx={{ fontSize: 80 }} />}
              title="No bond certificates yet"
              description="Get started by creating your first bond certificate. Upload your template and data files to begin."
              actionLabel="Start New Certificate"
              onAction={handleStartNew}
            />
          )}

          {/* Drafts List */}
          {!isLoading && drafts.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Your Drafts ({drafts.length})
              </Typography>
              <BondDraftsList drafts={drafts} onResume={handleResume} onDelete={handleDelete} />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
