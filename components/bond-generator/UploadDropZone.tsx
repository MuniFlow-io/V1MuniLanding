"use client";

import { RefObject } from "react";

interface UploadDropZoneProps {
  isDragging: boolean;
  isLoading: boolean;
  title: string;
  accept: string;
  fileInputRef: RefObject<HTMLInputElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadDropZone({
  isDragging,
  isLoading,
  title,
  accept,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onFileSelect,
}: UploadDropZoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`
        relative border-2 border-dashed rounded-2xl p-12
        transition-all duration-200 cursor-pointer
        ${isDragging 
          ? 'border-cyan-500 bg-cyan-900/20 scale-105' 
          : 'border-gray-700 hover:border-cyan-700 hover:bg-cyan-900/10'
        }
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      <div className="text-center space-y-4">
        {/* Icon */}
        <div className={`
          w-20 h-20 rounded-2xl mx-auto flex items-center justify-center
          transition-all duration-200
          ${isDragging 
            ? 'bg-cyan-500/20 border-2 border-cyan-500' 
            : 'bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-2 border-cyan-700/30'
          }
        `}>
          {isLoading ? (
            <svg className="w-10 h-10 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            {isDragging ? 'Drop file here' : title}
          </h3>
          <p className="text-sm text-gray-400">
            Drag and drop your file, or click to browse
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <p className="text-sm text-cyan-400">
            Uploading template...
          </p>
        )}
      </div>
    </div>
  );
}
