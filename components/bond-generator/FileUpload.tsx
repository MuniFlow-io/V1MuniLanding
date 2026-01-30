"use client";

import { useState, useRef } from "react";
import { UploadedFileDisplay } from "./UploadedFileDisplay";
import { UploadRequirements } from "./UploadRequirements";
import { UploadErrorDisplay } from "./UploadErrorDisplay";
import { UploadDropZone } from "./UploadDropZone";

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  isLoading?: boolean;
  error?: string | null;
  existingFile?: File | null;
  title?: string;
  requirements?: string[];
}

export function FileUpload({ 
  onUpload, 
  accept = ".docx",
  maxSizeMB = 10,
  isLoading = false,
  error = null,
  existingFile = null,
  title = "Upload bond form template",
  requirements,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const validateFile = (file: File): string | null => {
    const validExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      return `Invalid file type. Accepted: ${accept}`;
    }
    
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File too large (max ${maxSizeMB}MB)`;
    }
    
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setValidationError(error);
      return;
    }
    
    setValidationError(null);
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

  if (existingFile && !isLoading) {
    return (
      <UploadedFileDisplay
        file={existingFile}
        fileInputRef={fileInputRef}
        accept={accept}
        onFileSelect={handleFileSelect}
      />
    );
  }

  return (
    <div className="space-y-6">
      <UploadDropZone
        isDragging={isDragging}
        isLoading={isLoading}
        title={title}
        accept={accept}
        fileInputRef={fileInputRef}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onFileSelect={handleFileSelect}
      />
      <UploadErrorDisplay error={error} validationError={validationError} />
      <UploadRequirements maxSizeMB={maxSizeMB} requirements={requirements} />
    </div>
  );
}
