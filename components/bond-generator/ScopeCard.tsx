"use client";

import { Card } from "@/components/ui/Card";

interface ScopeItem {
  label: string;
  included: boolean;
}

const scopeItems: ScopeItem[] = [
  { label: "General Obligation bonds", included: true },
  { label: "One series", included: true },
  { label: "Serial maturities only", included: true },
  { label: "No multi-series", included: false },
  { label: "No closing integration", included: false },
  { label: "No email parsing", included: false },
];

export function ScopeCard() {
  return (
    <Card variant="feature" size="medium">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-900/50 border border-purple-700/50 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">
          v1 scope (locked)
        </h3>
      </div>
      
      <ul className="space-y-2.5">
        {scopeItems.map((item, index) => (
          <li key={index} className="flex items-start gap-3 group">
            <span className={`mt-1 flex-shrink-0 ${
              item.included ? 'text-cyan-400' : 'text-gray-600'
            }`}>
              {item.included ? '●' : '○'}
            </span>
            <span className={`text-sm leading-relaxed ${
              item.included 
                ? 'text-gray-300 group-hover:text-white transition-colors' 
                : 'text-gray-600'
            }`}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
