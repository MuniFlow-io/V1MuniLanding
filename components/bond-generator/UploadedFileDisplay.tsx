"use client";

import { RefObject } from "react";

interface UploadedFileDisplayProps {
  file: File;
  fileInputRef: RefObject<HTMLInputElement>;
  accept: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadedFileDisplay({
  file,
  fileInputRef,
  accept,
  onFileSelect,
}: UploadedFileDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Uploaded File Display */}
      <div className="border-2 border-green-700/40 bg-green-900/10 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-green-900/30 border border-green-700/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / 1024).toFixed(0)} KB • Already uploaded
              </p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            Replace File
          </button>
        </div>
      </div>

      {/* Hidden file input for replace */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onFileSelect}
        className="hidden"
      />

      {/* Info */}
      <div className="bg-cyan-900/20 border border-cyan-700/40 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-cyan-300">Template uploaded</p>
            <p className="text-xs text-cyan-200/80 mt-1">
              Click &quot;Replace File&quot; to upload a different template, or continue to tag this template.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
