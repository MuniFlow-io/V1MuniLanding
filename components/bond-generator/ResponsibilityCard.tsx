"use client";

import { Card } from "@/components/ui/Card";

const disclaimers = [
  "User is responsible for review and accuracy.",
  "Tool does not replace legal judgment.",
  "Final documents should be reviewed before execution.",
];

export function ResponsibilityCard() {
  return (
    <Card variant="feature" size="medium">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-900/30 border border-amber-700/40 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">
          Responsibility & privacy
        </h3>
      </div>
      
      <div className="space-y-3">
        {disclaimers.map((text, index) => (
          <p key={index} className="text-sm text-gray-400 leading-relaxed">
            {text}
          </p>
        ))}
        
        <div className="pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 leading-relaxed">
            Uploaded files are not shared. Retention is session-based unless stated otherwise.
          </p>
        </div>
      </div>
    </Card>
  );
}
