"use client";

import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export const RadioGroup = ({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  error,
}: RadioGroupProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-cyan-400 ml-1">*</span>}
      </label>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg cursor-pointer",
                "border-2 transition-all duration-200",
                "hover:bg-gray-800/50",
                isSelected
                  ? "border-cyan-400 bg-gray-800/30 shadow-lg shadow-cyan-400/20"
                  : "border-gray-700 bg-gray-900/50"
              )}
            >
              {/* Custom Radio Button */}
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  className="sr-only"
                  aria-required={required}
                />
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all duration-200",
                    "flex items-center justify-center",
                    isSelected
                      ? "border-cyan-400 bg-cyan-400"
                      : "border-gray-500 bg-transparent"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </div>
              </div>

              {/* Label */}
              <div className="flex-1">
                <div
                  className={cn(
                    "font-medium transition-colors duration-200",
                    isSelected ? "text-cyan-400" : "text-white"
                  )}
                >
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-sm text-gray-400 mt-1">
                    {option.description}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

