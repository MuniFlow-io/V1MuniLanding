"use client";

import { Card } from "@/components/ui/Card";

const limitations = [
  "Draft bond terms",
  "Recommend structures",
  "Infer missing data",
  "Replace legal judgment",
];

export function LimitationsCard() {
  return (
    <Card variant="feature" size="medium">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">
          What this tool does not do
        </h3>
      </div>
      
      <ul className="space-y-2.5">
        {limitations.map((item, index) => (
          <li key={index} className="flex items-start gap-3 group">
            <span className="text-gray-600 mt-1 flex-shrink-0">×</span>
            <span className="text-sm text-gray-500 leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
      
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 leading-relaxed">
          This tool performs mechanical assembly only. It does not provide legal advice or replace professional judgment.
        </p>
      </div>
    </Card>
  );
}
