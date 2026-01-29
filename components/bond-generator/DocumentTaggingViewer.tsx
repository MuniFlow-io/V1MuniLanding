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

import { useEffect, useRef, useState } from "react";
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

export function DocumentTaggingViewer({
  previewHtml,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  taggedPositions: _taggedPositions, // Kept for interface compliance, not currently used in display
  onTagAssigned,
  onTagRemoved,
  isLoading = false,
}: DocumentTaggingViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [selectedText, setSelectedText] = useState<string>("");
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [pendingTagId, setPendingTagId] = useState<string>("");

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

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-cyan-900/20 border border-cyan-700/40 rounded-lg p-4">
        <div className="flex items-start gap-3">
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
}
