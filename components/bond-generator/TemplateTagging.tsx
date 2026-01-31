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

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DocumentTaggingViewer, type TagPosition } from "./DocumentTaggingViewer";
import { TagProgressPanel } from "./TagProgressPanel";
import { REQUIRED_TAGS, type BondTag, type TagMap } from "@/modules/bond-generator/types";

interface TemplateTaggingProps {
  templateFile: File | null;
  onComplete: (taggedFile: File, tagMap?: TagMap) => void;
  onCancel: () => void;
  isLoading?: boolean;
  restoredTagMap?: TagMap | null; // ✅ NEW: Restored from draft
}

export function TemplateTagging({ 
  templateFile, 
  onComplete, 
  onCancel,
  isLoading = false,
  restoredTagMap = null // ✅ NEW: Accept restored tags
}: TemplateTaggingProps) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [taggedPositions, setTaggedPositions] = useState<TagPosition[]>([]);
  const [assignedTags, setAssignedTags] = useState<Map<BondTag, boolean>>(new Map());
  const [shouldLoadPreview, setShouldLoadPreview] = useState(false); // ✅ PERFORMANCE: Defer preview load
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Function to restore visual tags in iframe after HTML loads
  const restoreVisualTags = () => {
    if (!iframeRef.current?.contentWindow || !restoredTagMap?.taggedHtml) return;
    
    // Parse the saved HTML to extract tagged spans
    const parser = new DOMParser();
    const doc = parser.parseFromString(restoredTagMap.taggedHtml, 'text/html');
    const taggedSpans = doc.querySelectorAll('.tagged-text');
    
    // Send each tag to the iframe to recreate visual tags
    taggedSpans.forEach((span) => {
      const tagId = span.getAttribute('data-tag-id');
      const tag = span.getAttribute('data-tag');
      const text = span.textContent;
      
      if (tagId && tag && text) {
        // Tell iframe to find and tag this text
        iframeRef.current?.contentWindow?.postMessage({
          type: 'RESTORE_TAG',
          tagId,
          tag,
          text,
        }, '*');
      }
    });
  };
  
  // ✅ PERFORMANCE: Defer preview loading - don't block initial render
  // Load preview after 1.5 seconds or when user is likely ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadPreview(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // ✅ Restore tag positions from draft on mount
  useEffect(() => {
    if (restoredTagMap?.tags) {
      const positions: TagPosition[] = restoredTagMap.tags.map((t, idx) => ({
        id: `restored-${idx}`,
        tag: t.tag as BondTag,
        text: '',
        position: t.position,
      }));
      setTaggedPositions(positions);
      
      // Mark tags as assigned in progress tracker
      const tags = new Map<BondTag, boolean>();
      restoredTagMap.tags.forEach(t => tags.set(t.tag as BondTag, true));
      setAssignedTags(tags);
    }
  }, [restoredTagMap]);

  // Fetch preview HTML when template file changes (DEFERRED)
  useEffect(() => {
    if (!templateFile || !shouldLoadPreview) return;

    async function loadPreview() {
      setIsLoadingPreview(true);
      try {
        const formData = new FormData();
        formData.append('template', templateFile as File);

        const response = await fetch('/api/bond-generator/template/preview', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to load template preview');
        }

        const data = await response.json();
        setPreviewHtml(data.html);
        
        // ✅ After HTML loads, restore visual tags in iframe
        if (restoredTagMap?.tags && restoredTagMap.tags.length > 0) {
          // Wait for iframe to fully load
          setTimeout(() => {
            restoreVisualTags();
          }, 500);
        }
      } catch {
        // Preview error - could show error message to user
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
  const handleContinue = async () => {
    if (!allRequiredTagsAssigned) {
      alert('Please assign all required tags before continuing');
      return;
    }

    if (!templateFile) {
      return;
    }

    setIsSaving(true);

    try {
      // Step 1: Build tag assignments from tagged positions
      const assignments = taggedPositions.map(t => ({
        blankId: `tag-${t.tag}`,
        blankText: t.text,
        tagName: t.tag,
      }));

      // Step 2: Call backend to insert {{TAGS}} into DOCX
      const formData = new FormData();
      formData.append('template', templateFile);
      formData.append('assignments', JSON.stringify(assignments));

      const response = await fetch('/api/bond-generator/template/apply-tags', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to apply tags to template');
      }

      // Step 3: Get the tagged DOCX file from backend
      const blob = await response.blob();
      const taggedFile = new File([blob], templateFile.name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Step 4: Build TagMap for persistence
      const tagMap: TagMap = {
        templateId: templateFile.name,
        templateHash: '',
        tags: taggedPositions.map(t => ({
          tag: t.tag,
          position: t.position,
        })),
        filename: templateFile.name,
        size: taggedFile.size,
        taggedHtml: iframeRef.current?.contentDocument?.documentElement.outerHTML || '',
      };

      // Step 5: Pass TAGGED file to hook (not original!)
      onComplete(taggedFile, tagMap);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save tags');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Document Viewer (2/3 width) */}
        <div className="lg:col-span-2">
          <DocumentTaggingViewer
            ref={iframeRef}
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
            disabled={isLoading || isSaving || !allRequiredTagsAssigned}
          >
            {isLoading || isSaving ? 'Processing...' : 'Continue →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
