"use client";

import { Button } from "@/components/ui/Button";
import { FileUpload } from "./FileUpload";

interface DataUploadProps {
  maturityFile: File | null;
  cusipFile: File | null;
  onMaturityUpload: (file: File) => void;
  onCusipUpload: (file: File) => void;
  onContinue: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function DataUpload({ 
  maturityFile,
  cusipFile,
  onMaturityUpload,
  onCusipUpload,
  onContinue,
  onBack,
  isLoading = false,
  error = null
}: DataUploadProps) {
  const canContinue = maturityFile && cusipFile;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-300">Upload Bond Data</p>
            <p className="text-xs text-purple-200/80 mt-1">
              Upload your maturity schedule and CUSIP files (Excel or CSV format)
            </p>
          </div>
        </div>
      </div>

      {/* File Uploads */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Maturity Schedule */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-900/30 border border-green-700/40 flex items-center justify-center">
              <span className="text-sm font-bold text-green-400">1</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Maturity Schedule</h3>
              <p className="text-xs text-gray-500">Principal amounts & dates</p>
            </div>
          </div>
          
          <div className="relative">
            <FileUpload
              onUpload={onMaturityUpload}
              accept=".xlsx,.xls,.csv"
              maxSizeMB={5}
              isLoading={isLoading}
              error={null}
            />
            
            {maturityFile && (
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* CUSIP File */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900/30 border border-blue-700/40 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-400">2</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">CUSIP Schedule</h3>
              <p className="text-xs text-gray-500">Security identifiers</p>
            </div>
          </div>
          
          <div className="relative">
            <FileUpload
              onUpload={onCusipUpload}
              accept=".xlsx,.xls,.csv"
              maxSizeMB={5}
              isLoading={isLoading}
              error={null}
            />
            
            {cusipFile && (
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Upload failed</p>
              <p className="text-xs text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <Button 
          variant="glass" 
          size="medium"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Back
        </Button>
        
        <Button 
          variant="primary" 
          size="medium"
          onClick={onContinue}
          disabled={!canContinue || isLoading}
        >
          {isLoading ? 'Processing...' : 'Preview Data →'}
        </Button>
      </div>
    </div>
  );
}
