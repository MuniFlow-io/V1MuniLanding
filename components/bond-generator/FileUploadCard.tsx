"use client";

import { FileUpload } from "./FileUpload";

interface FileUploadCardProps {
  number: string;
  title: string;
  subtitle: string;
  uploadedFile: File | null;
  onUpload: (file: File) => void;
  accept: string;
  maxSizeMB: number;
  isLoading: boolean;
  uploadTitle: string;
  requirements: string[];
  badgeColor: 'green' | 'blue';
}

export function FileUploadCard({
  number,
  title,
  subtitle,
  uploadedFile,
  onUpload,
  accept,
  maxSizeMB,
  isLoading,
  uploadTitle,
  requirements,
  badgeColor,
}: FileUploadCardProps) {
  const badgeStyles = badgeColor === 'green' 
    ? 'bg-green-900/30 border-green-700/40 text-green-400'
    : 'bg-blue-900/30 border-blue-700/40 text-blue-400';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${badgeStyles}`}>
          <span className="text-sm font-bold">{number}</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      
      <div className="relative">
        <FileUpload
          onUpload={onUpload}
          accept={accept}
          maxSizeMB={maxSizeMB}
          isLoading={isLoading}
          error={null}
          existingFile={uploadedFile}
          title={uploadTitle}
          requirements={requirements}
        />
        
        {uploadedFile && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
