"use client";

interface UploadErrorDisplayProps {
  error: string | null;
  validationError?: string | null;
}

export function UploadErrorDisplay({ 
  error, 
  validationError 
}: UploadErrorDisplayProps) {
  if (!error && !validationError) return null;

  return (
    <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-400">Upload failed</p>
          <p className="text-xs text-red-300 mt-1">{error || validationError}</p>
        </div>
      </div>
    </div>
  );
}
