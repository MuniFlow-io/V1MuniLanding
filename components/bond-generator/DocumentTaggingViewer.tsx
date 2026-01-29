"use client";

/**
 * Document Tagging Viewer Component
 * 
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Displays DOCX template as HTML in iframe
 * - Allows user to select text and assign tags
 * - Communicates with iframe via postMessage
 * - NO business logic (just UI and event handlers)
 * 
 * PROPS:
 * - templateFile: File to preview
 * - taggedPositions: Already assigned tags
 * - onTagAssigned: Callback when user assigns a tag
 * - onTagRemoved: Callback when user removes a tag
 * - isLoading: Preview loading state
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { TAG_OPTIONS, type BondTag } from "@/modules/bond-generator/types/tagConstants";

export interface TagPosition {
  id: string;
  tag: BondTag;
  text: string;
  position: number;
}

interface DocumentTaggingViewerProps {
  previewHtml: string | null;
  taggedPositions: TagPosition[]; // Note: currently not used for display, but kept for future enhancements
  onTagAssigned: (tagId: string, tag: BondTag, text: string) => void;
  onTagRemoved: (tagId: string) => void;
  isLoading?: boolean;
}

export const DocumentTaggingViewer = forwardRef<HTMLIFrameElement, DocumentTaggingViewerProps>(
  function DocumentTaggingViewer({
    previewHtml,
    taggedPositions,
    onTagAssigned,
    onTagRemoved,
    isLoading = false,
  }, forwardedRef) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Expose the iframe ref to parent
  useImperativeHandle(forwardedRef, () => iframeRef.current as HTMLIFrameElement);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [selectedText, setSelectedText] = useState<string>("");
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [pendingTagId, setPendingTagId] = useState<string>("");
  const [tagsVisible, setTagsVisible] = useState(true); // ✅ NEW: Toggle tag visibility

  // Listen for messages from iframe (text selection, tag clicks)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data.type === 'TEXT_SELECTED') {
        // User selected text in the document
        const tagId = `tag-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setPendingTagId(tagId);
        setSelectedText(event.data.text);
        setMenuPosition({ x: event.data.position.x, y: event.data.position.y });
        setShowTagMenu(true);
      } else if (event.data.type === 'TAG_CLICKED') {
        // User clicked existing tag (to change/remove)
        // Show confirmation or tag menu
        if (confirm(`Remove tag "${event.data.currentTag}"?`)) {
          onTagRemoved(event.data.tagId);
          
          // Tell iframe to remove the tag visually
          iframeRef.current?.contentWindow?.postMessage({
            type: 'REMOVE_TAG',
            tagId: event.data.tagId,
          }, '*');
        }
      } else if (event.data.type === 'TAG_APPLIED') {
        // Iframe successfully applied tag
        setShowTagMenu(false);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onTagRemoved]);

  // Handle tag selection from menu
  const handleTagSelect = (tag: BondTag) => {
    if (!tag || !pendingTagId) return;
    
    // Tell iframe to visually apply the tag
    iframeRef.current?.contentWindow?.postMessage({
      type: 'ASSIGN_TAG',
      tagId: pendingTagId,
      tag: tag,
    }, '*');

    // Notify parent component
    onTagAssigned(pendingTagId, tag, selectedText);
    
    // Reset state
    setShowTagMenu(false);
    setSelectedText("");
    setPendingTagId("");
  };

  // ✅ NEW: Toggle tag visibility in iframe
  const toggleTagVisibility = () => {
    const newVisibility = !tagsVisible;
    setTagsVisible(newVisibility);
    
    // Tell iframe to show/hide all tags
    iframeRef.current?.contentWindow?.postMessage({
      type: 'TOGGLE_TAGS',
      visible: newVisibility,
    }, '*');
  };

  return (
    <div className="space-y-4">
      {/* Instructions + Controls */}
      <div className="bg-cyan-900/20 border border-cyan-700/40 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-cyan-300">How to Tag</p>
              <p className="text-xs text-cyan-200/80 mt-1">
                Select blank spaces or placeholder text in the document below, then choose which field it represents (CUSIP, Principal, etc.). Click tagged text to remove or change tags.
              </p>
            </div>
          </div>
          
          {/* ✅ NEW: Show/Hide Tags Toggle */}
          {taggedPositions.length > 0 && (
            <button
              onClick={toggleTagVisibility}
              className="flex items-center gap-2 px-3 py-2 bg-purple-900/40 hover:bg-purple-800/50 border border-purple-600/40 rounded-lg text-xs font-medium text-purple-200 transition-colors whitespace-nowrap"
            >
              {tagsVisible ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide Tags
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Show Tags
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Document Preview */}
      <Card variant="feature" size="large">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-950/80 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-400">Loading document...</p>
              </div>
            </div>
          )}

          {!previewHtml && !isLoading && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-700/30 mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400">No document loaded</p>
            </div>
          )}

          {previewHtml && (
            <div className="bg-white rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                ref={iframeRef}
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts"
                title="Bond Template Preview"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Tag Selection Menu (Popup) */}
      {showTagMenu && (
        <div
          className="fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-2 min-w-[250px]"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y + 20}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="space-y-1">
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-xs font-medium text-gray-400">ASSIGN TAG</p>
              <p className="text-sm text-white mt-1 truncate max-w-[200px]">&quot;{selectedText}&quot;</p>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {TAG_OPTIONS.filter(opt => opt.value !== '').map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTagSelect(option.value as BondTag)}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-800 rounded transition-colors flex items-center justify-between group"
                >
                  <span>{option.displayName}</span>
                  {option.required && (
                    <span className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Required
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-1">
              <button
                onClick={() => setShowTagMenu(false)}
                className="w-full px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showTagMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTagMenu(false)}
        />
      )}
    </div>
  );
});
