"use client";

import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  id: string;
  type?: "text" | "email" | "textarea";
  placeholder?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export const FormField = ({
  label,
  id,
  type = "text",
  placeholder,
  required = false,
  error,
  value,
  onChange,
  rows = 4,
}: FormFieldProps) => {
  const baseInputClasses = cn(
    "w-full rounded-lg px-4 py-3",
    "bg-gray-800 border-2",
    "text-white placeholder:text-gray-400",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black",
    error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-gray-600 focus:border-cyan-400 focus:ring-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20"
  );

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-cyan-400 ml-1">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(baseInputClasses, "resize-y")}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseInputClasses}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-400 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

