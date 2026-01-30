"use client";

interface UploadRequirementsProps {
  maxSizeMB: number;
  requirements?: string[];
}

export function UploadRequirements({ 
  maxSizeMB, 
  requirements 
}: UploadRequirementsProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-medium text-gray-400">Requirements:</p>
          <ul className="text-xs text-gray-500 space-y-1">
            {requirements ? (
              requirements.map((req, index) => <li key={index}>• {req}</li>)
            ) : (
              <>
                <li>• Microsoft Word format (.docx)</li>
                <li>• Maximum file size: {maxSizeMB}MB</li>
                <li>• Should be in final form with blanks or placeholders for (1) Principal Amount, (2) Interest Rate, (3) Maturity Year, and (5) CUSIP Number. The bonds will be numbered consecutively by maturity.</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
