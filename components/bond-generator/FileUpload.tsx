"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  isLoading?: boolean;
  error?: string | null;
  existingFile?: File | null; // ✅ NEW: Show already uploaded file
}

export function FileUpload({ 
  onUpload, 
  accept = ".docx",
  maxSizeMB = 10,
  isLoading = false,
  error = null,
  existingFile = null, // ✅ NEW: Existing uploaded file
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(existingFile);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ✅ NEW: Sync with existing file from parent
  useEffect(() => {
    if (existingFile) {
      setSelectedFile(existingFile);
    }
  }, [existingFile]);

  const validateFile = (file: File): string | null => {
    // Check file type against accept prop
    const validExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      return `Invalid file type. Accepted: ${accept}`;
    }
    
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File too large (max ${maxSizeMB}MB)`;
    }
    
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      // Show validation error to user
      setValidationError(error);
      return;
    }
    
    // Clear any previous errors
    setValidationError(null);
    // ✅ FIXED: Just call onUpload - let parent (hook) manage state
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ✅ FIXED: Use existingFile from props (not local state)
  if (existingFile && !isLoading) {
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
                <p className="text-sm font-medium text-white">{existingFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(existingFile.size / 1024).toFixed(0)} KB • Already uploaded
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
          onChange={handleFileSelect}
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

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
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
          onChange={handleFileSelect}
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
              {isDragging ? 'Drop file here' : 'Upload bond form template'}
            </h3>
            <p className="text-sm text-gray-400">
              Drag and drop your .docx file, or click to browse
            </p>
          </div>

          {/* File Info - REMOVED: Don't show in upload zone, only in "already uploaded" state */}

          {/* Loading State */}
          {isLoading && (
            <p className="text-sm text-cyan-400">
              Uploading template...
            </p>
          )}
        </div>
      </div>

      {/* Error Display */}
      {(error || validationError) && (
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
      )}

      {/* Requirements */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-medium text-gray-400">Requirements:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Microsoft Word format (.docx)</li>
              <li>• Maximum file size: {maxSizeMB}MB</li>
              <li>• Should contain bond certificate language</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
