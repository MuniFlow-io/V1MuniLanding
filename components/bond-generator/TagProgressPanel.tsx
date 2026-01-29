"use client";

/**
 * Tag Progress Panel Component
 * 
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Shows list of required/optional tags
 * - Displays which tags have been assigned
 * - Shows visual progress indicator
 * - NO business logic
 * 
 * PROPS:
 * - assignedTags: Map of tag name to assigned status
 * - onTagClick: Optional callback when user clicks a tag
 */

import { Card } from "@/components/ui/Card";
import { 
  REQUIRED_TAGS, 
  OPTIONAL_TAGS, 
  getTagDisplayName,
  type BondTag 
} from "@/modules/bond-generator/types/tagConstants";

export interface AssignedTagStatus {
  tag: BondTag;
  assigned: boolean;
  text?: string;
}

interface TagProgressPanelProps {
  assignedTags: Map<BondTag, boolean>;
  onTagClick?: (tag: BondTag) => void;
}

export function TagProgressPanel({ 
  assignedTags,
  onTagClick 
}: TagProgressPanelProps) {
  // Calculate progress
  const totalRequired = REQUIRED_TAGS.length;
  const assignedRequired = REQUIRED_TAGS.filter(tag => assignedTags.get(tag)).length;
  const progressPercent = Math.round((assignedRequired / totalRequired) * 100);
  const isComplete = assignedRequired === totalRequired;

  return (
    <Card variant="feature" size="medium">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-white">Tag Assignment</h3>
          <p className="text-sm text-gray-400 mt-1">
            {assignedRequired} of {totalRequired} required tags assigned
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isComplete ? 'bg-green-500' : 'bg-purple-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">{progressPercent}%</p>
        </div>

        {/* Required Tags */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Required Fields
          </p>
          <div className="space-y-1">
            {REQUIRED_TAGS.map((tag) => {
              const isAssigned = assignedTags.get(tag) || false;
              return (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    isAssigned
                      ? 'bg-green-900/20 border border-green-700/40'
                      : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
                  }`}
                  disabled={!onTagClick}
                >
                  <span className={`text-sm ${isAssigned ? 'text-green-300' : 'text-gray-400'}`}>
                    {getTagDisplayName(tag)}
                  </span>
                  {isAssigned ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Tags */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Optional Fields
          </p>
          <div className="space-y-1">
            {OPTIONAL_TAGS.map((tag) => {
              const isAssigned = assignedTags.get(tag) || false;
              return (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    isAssigned
                      ? 'bg-cyan-900/20 border border-cyan-700/40'
                      : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
                  }`}
                  disabled={!onTagClick}
                >
                  <span className={`text-sm ${isAssigned ? 'text-cyan-300' : 'text-gray-500'}`}>
                    {getTagDisplayName(tag)}
                  </span>
                  {isAssigned && (
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Completion Status */}
        {isComplete && (
          <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-300">All Required Tags Assigned</p>
                <p className="text-xs text-green-200/80 mt-1">
                  You can now proceed to the next step
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
