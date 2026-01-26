"use client";

import { Card } from "@/components/ui/Card";
import { useState } from "react";

interface Capability {
  action: string;
  description: string;
  tooltip?: string;
}

const capabilities: Capability[] = [
  { 
    action: "Upload", 
    description: "final bond form, maturity schedule, and CUSIPs",
    tooltip: "Accepts .docx templates and .xlsx/.csv schedules"
  },
  { 
    action: "Tag", 
    description: "template variables without editing bond language",
    tooltip: "Identify where data should be inserted (e.g., {{CUSIP}}, {{MATURITY_DATE}})"
  },
  { 
    action: "Validate", 
    description: "each maturity row independently",
    tooltip: "Checks for missing data, format errors, and inconsistencies"
  },
  { 
    action: "Assemble", 
    description: "certificates mechanically",
    tooltip: "Merges validated data with tagged template"
  },
  { 
    action: "Generate", 
    description: "deterministic outputs (same inputs → same output)",
    tooltip: "Downloads ZIP file with all bond certificates"
  },
];

export function CapabilitiesCard() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Card variant="feature" size="medium">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-900/50 border border-cyan-700/50 flex items-center justify-center">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">
          What this tool does
        </h3>
      </div>
      
      <ul className="space-y-3">
        {capabilities.map((item, index) => (
          <li 
            key={index} 
            className="flex items-start gap-3 group relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className="text-cyan-400 mt-0.5 flex-shrink-0 font-semibold">
              •
            </span>
            <div className="flex-1">
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                <span className="font-medium text-white">{item.action}</span> {item.description}
              </span>
              
              {/* Tooltip on hover */}
              {hoveredIndex === index && item.tooltip && (
                <div className="absolute left-0 top-full mt-2 z-10 w-full">
                  <div className="bg-gray-800 border border-cyan-700/30 rounded-lg px-3 py-2 text-xs text-gray-300 shadow-xl">
                    <div className="flex items-start gap-2">
                      <svg className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{item.tooltip}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
