'use client';

/**
 * Blank Tagging Hook - V2 CLEAN ARCHITECTURE
 *
 * USER FLOW:
 * 1. Sidebar shows 7 required tags
 * 2. User clicks tag → enters "selection mode" for that tag
 * 3. User highlights text in document
 * 4. Text gets assigned to that tag
 * 5. Tag turns green in sidebar
 * 6. Repeat until all 7 tags assigned
 *
 * STATE MODEL:
 * - activeTag: Which tag user is currently assigning (or null)
 * - assignments: Map<tagName, {text, position}>
 * - No duplicates possible (each tag = one slot)
 */

import { useCallback, useState } from 'react';
import { applyTagsToTemplate } from '../api/blankTaggingApi';
import { REQUIRED_TAGS } from '../types/tagConstants';

interface TagAssignment {
  text: string;
  position?: number; // Optional: for position-based approach
}

interface UseBlankTaggingResult {
  // Selection state
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;

  // Assignments
  assignments: Map<string, TagAssignment>;
  assignText: (tagName: string, text: string, position?: number) => void;
  unassign: (tagName: string) => void;
  clearAll: () => void;

  // Validation
  isValid: boolean;
  missingTags: string[];

  // Save
  isSaving: boolean;
  saveError: string | null;
  save: (templateFile: File) => Promise<File | null>;
}

export function useBlankTagging(
  initialAssignments?: Map<string, TagAssignment>
): UseBlankTaggingResult {
  // Which tag is user currently selecting for?
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // What's assigned to each tag
  // ✅ NEW: Initialize with provided assignments if resuming
  const [assignments, setAssignments] = useState<Map<string, TagAssignment>>(
    initialAssignments ?? new Map()
  );

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Validation
  const missingTags = REQUIRED_TAGS.filter((tag) => !assignments.has(tag));
  const isValid = missingTags.length === 0;

  // Assign text to a tag
  const assignText = useCallback((tagName: string, text: string, position?: number) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      next.set(tagName, { text, position });
      return next;
    });
    setActiveTag(null); // Clear selection mode
  }, []);

  // Remove assignment
  const unassign = useCallback((tagName: string) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      next.delete(tagName);
      return next;
    });
  }, []);

  // Clear everything
  const clearAll = useCallback(() => {
    setAssignments(new Map());
    setActiveTag(null);
    setSaveError(null);
  }, []);

  // Save to DOCX
  const save = useCallback(
    async (templateFile: File): Promise<File | null> => {
      setIsSaving(true);
      setSaveError(null);

      try {
        // Convert to API format
        const assignmentsArray = Array.from(assignments.entries()).map(([tag, { text }]) => ({
          blankId: `tag-${tag}`,
          blankText: text,
          tagName: tag,
        }));

        const result = await applyTagsToTemplate(templateFile, assignmentsArray);

        setIsSaving(false);
        return result;
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Failed to save');
        setIsSaving(false);
        return null;
      }
    },
    [assignments]
  );

  return {
    activeTag,
    setActiveTag,
    assignments,
    assignText,
    unassign,
    clearAll,
    isValid,
    missingTags,
    isSaving,
    saveError,
    save,
  };
}
