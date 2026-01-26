"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface LegalDisclaimerModalProps {
  onAccept: () => void;
}

export function LegalDisclaimerModal({ onAccept }: LegalDisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-cyan-700/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-b border-cyan-700/30 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Important Legal Notice</h2>
              <p className="text-sm text-gray-400 mt-1">Please read and accept before proceeding</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Warning Banner */}
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4">
            <p className="text-sm text-yellow-200 font-medium">
              ⚠️ You must accept these terms to use the bond generator
            </p>
          </div>

          {/* Disclaimers */}
          <div className="space-y-5">
            {/* 1. User Responsibility */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center text-xs text-cyan-400">1</span>
                User Responsibility
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed pl-8">
                This tool generates bond certificates based on your uploaded data.{" "}
                <strong className="text-gray-300">
                  You are solely responsible for the accuracy and completeness of all inputs.
                </strong>{" "}
                The tool performs no validation beyond format checking.
              </p>
            </div>

            {/* 2. Not Legal Advice */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center text-xs text-cyan-400">2</span>
                Not Legal Advice
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed pl-8">
                This tool <strong className="text-gray-300">does not provide legal advice</strong> and does not replace the
                judgment of qualified bond counsel. All outputs must be reviewed by appropriate legal
                professionals before use.
              </p>
            </div>

            {/* 3. Review Required */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center text-xs text-cyan-400">3</span>
                Review Before Execution
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed pl-8">
                <strong className="text-gray-300">All generated documents must be thoroughly reviewed</strong> by qualified
                legal counsel before execution or filing. The tool makes no representations regarding
                compliance with applicable laws or regulations.
              </p>
            </div>

            {/* 4. Data Privacy */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center text-xs text-cyan-400">4</span>
                Data Processing
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed pl-8">
                Uploaded files are processed in memory and not permanently stored on our servers.
                Generated documents are your responsibility to secure. We retain no copies after
                download.
              </p>
            </div>
          </div>

          {/* Acceptance Checkbox */}
          <div 
            className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-cyan-700/50 transition-colors"
            onClick={() => setAccepted(!accepted)}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-0.5">
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                  ${accepted 
                    ? 'bg-cyan-500 border-cyan-500' 
                    : 'border-gray-600 hover:border-cyan-600'
                  }
                `}>
                  {accepted && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300 leading-relaxed">
                  I understand and accept these terms. I am responsible for reviewing all outputs before use.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-950 border-t border-cyan-700/30 px-8 py-6">
          <Button 
            onClick={onAccept}
            disabled={!accepted}
            variant="primary"
            size="large"
            className="w-full"
          >
            {accepted ? 'Accept & Continue' : 'Please accept to continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
