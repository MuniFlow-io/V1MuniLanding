"use client";

import { useState } from "react";

interface Step {
  id: number;
  label: string;
  description: string;
}

const steps: Step[] = [
  { id: 1, label: "Upload", description: "Upload bond form template" },
  { id: 2, label: "Tag", description: "Assign template variables" },
  { id: 3, label: "Validate", description: "Upload & validate schedules" },
  { id: 4, label: "Review", description: "Review assembled bonds" },
  { id: 5, label: "Generate", description: "Download certificates" },
];

interface WorkbenchStepperProps {
  currentStep?: number;
}

export function WorkbenchStepper({ currentStep = 1 }: WorkbenchStepperProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="pb-6 border-b border-gray-800">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isHovered = hoveredStep === step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div 
                className="flex flex-col items-center relative group"
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-200 relative z-10
                  ${isCompleted 
                    ? 'bg-cyan-400 text-black' 
                    : isActive 
                      ? 'bg-cyan-400 text-black ring-4 ring-cyan-400/20' 
                      : 'bg-gray-800 text-gray-500'
                  }
                  ${isHovered && !isActive && !isCompleted ? 'ring-2 ring-gray-700' : ''}
                `}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-3 text-center">
                  <div className={`
                    text-sm font-medium transition-colors
                    ${isActive ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    {step.label}
                  </div>
                  
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 whitespace-nowrap">
                      <div className="bg-gray-800 border border-cyan-700/30 rounded-lg px-3 py-2 text-xs text-gray-300 shadow-xl">
                        {step.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-px mx-2 transition-colors
                  ${step.id < currentStep ? 'bg-cyan-400' : 'bg-gray-800'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
