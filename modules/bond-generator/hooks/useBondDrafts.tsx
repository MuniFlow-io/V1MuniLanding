'use client';

/**
 * Hook: useBondDrafts
 *
 * ARCHITECTURE: Hook (Layer 2) - SMART
 * - Manages draft list state
 * - Calls frontend APIs
 * - NO logger, NO Supabase, NO console.log
 * - <200 lines (elite standard)
 */

import { useCallback, useEffect, useState } from 'react';
import { deleteDraftApi, getAllDraftsApi } from '../api/draftApi';
import type { BondDraft } from '../types';

interface UseBondDraftsResult {
  drafts: BondDraft[];
  isLoading: boolean;
  error: string | null;
  refreshDrafts: () => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
}

export function useBondDrafts(): UseBondDraftsResult {
  const [drafts, setDrafts] = useState<BondDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDrafts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allDrafts = await getAllDraftsApi();
      setDrafts(allDrafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDraft = useCallback(async (draftId: string) => {
    try {
      await deleteDraftApi(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete draft');
      throw err;
    }
  }, []);

  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  return {
    drafts,
    isLoading,
    error,
    refreshDrafts,
    deleteDraft,
  };
}
