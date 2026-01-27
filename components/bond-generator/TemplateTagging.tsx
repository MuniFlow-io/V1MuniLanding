"use client";

/**
 * Template Tagging Step Component
 * 
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Orchestrates document viewer and tag progress panel
 * - Fetches template preview HTML on mount
 * - Tracks tag assignments
 * - Validates all required tags before allowing proceed
 * 
 * Clean, <150 lines, single responsibility
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DocumentTaggingViewer, type TagPosition } from "./DocumentTaggingViewer";
import { TagProgressPanel } from "./TagProgressPanel";
import { REQUIRED_TAGS, type BondTag, type TagMap } from "@/modules/bond-generator/types";

interface TemplateTaggingProps {
  templateFile: File | null;
  onComplete: (taggedFile: File, tagMap?: TagMap) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TemplateTagging({ 
  templateFile, 
  onComplete, 
  onCancel,
  isLoading = false 
}: TemplateTaggingProps) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [taggedPositions, setTaggedPositions] = useState<TagPosition[]>([]);
  const [assignedTags, setAssignedTags] = useState<Map<BondTag, boolean>>(new Map());

  // Fetch preview HTML when template file changes
  useEffect(() => {
    if (!templateFile) return;

    async function loadPreview() {
      setIsLoadingPreview(true);
      try {
        const formData = new FormData();
        formData.append('template', templateFile);

        const response = await fetch('/api/bond-generator/template/preview', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to load template preview');
        }

        const data = await response.json();
        setPreviewHtml(data.html);
      } catch (error) {
        console.error('Preview error:', error);
        // TODO: Show error to user
      } finally {
        setIsLoadingPreview(false);
      }
    }

    loadPreview();
  }, [templateFile]);

  // Handle tag assignment
  const handleTagAssigned = (tagId: string, tag: BondTag, text: string) => {
    setTaggedPositions(prev => [...prev, { id: tagId, tag, text, position: 0 }]);
    setAssignedTags(prev => new Map(prev).set(tag, true));
  };

  // Handle tag removal
  const handleTagRemoved = (tagId: string) => {
    const removedTag = taggedPositions.find(t => t.id === tagId);
    if (removedTag) {
      setTaggedPositions(prev => prev.filter(t => t.id !== tagId));
      
      // Check if this was the last instance of this tag
      const stillHasTag = taggedPositions.some(t => t.tag === removedTag.tag && t.id !== tagId);
      if (!stillHasTag) {
        setAssignedTags(prev => {
          const updated = new Map(prev);
          updated.set(removedTag.tag, false);
          return updated;
        });
      }
    }
  };

  // Check if all required tags are assigned
  const allRequiredTagsAssigned = REQUIRED_TAGS.every(tag => assignedTags.get(tag));

  // Handle continue (validate and proceed)
  const handleContinue = () => {
    if (!allRequiredTagsAssigned) {
      alert('Please assign all required tags before continuing');
      return;
    }

    if (templateFile) {
      // Build TagMap from tagged positions
      const tagMap: TagMap = {
        templateId: templateFile.name,
        templateHash: '', // Optional - could calculate hash if needed
        tags: taggedPositions.map(t => ({
          tag: t.tag,
          position: t.position,
        })),
        filename: templateFile.name,
        size: templateFile.size,
      };
      
      // Pass BOTH file AND tagMap to hook
      onComplete(templateFile, tagMap);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Document Viewer (2/3 width) */}
        <div className="lg:col-span-2">
          <DocumentTaggingViewer
            previewHtml={previewHtml}
            taggedPositions={taggedPositions}
            onTagAssigned={handleTagAssigned}
            onTagRemoved={handleTagRemoved}
            isLoading={isLoadingPreview}
          />
        </div>

        {/* Tag Progress Panel (1/3 width) */}
        <div className="lg:col-span-1">
          <TagProgressPanel
            assignedTags={assignedTags}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button 
          variant="glass" 
          size="medium"
          onClick={onCancel}
          disabled={isLoading}
        >
          ← Back
        </Button>
        
        <div className="flex items-center gap-3">
          {!allRequiredTagsAssigned && (
            <span className="text-sm text-yellow-500">
              {REQUIRED_TAGS.length - REQUIRED_TAGS.filter(t => assignedTags.get(t)).length} required tags remaining
            </span>
          )}
          <Button 
            variant="primary" 
            size="medium"
            onClick={handleContinue}
            disabled={isLoading || !allRequiredTagsAssigned}
          >
            {isLoading ? 'Processing...' : 'Continue →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
