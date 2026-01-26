"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

interface GenerationCompleteProps {
  bondCount: number;
  onReset: () => void;
}

export function GenerationComplete({ bondCount, onReset }: GenerationCompleteProps) {
  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              Bonds Generated Successfully!
            </h3>
            <p className="text-sm text-green-200/80">
              Your {bondCount} bond certificate{bondCount !== 1 ? 's have' : ' has'} been downloaded as a ZIP file
            </p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <Card variant="feature" size="large">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">What's Next?</h4>
            <p className="text-sm text-gray-400">
              Your bond certificates are ready. Here are the recommended next steps:
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-cyan-400">1</span>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white">Unzip the File</h5>
                <p className="text-xs text-gray-500 mt-1">
                  Extract the ZIP file to access individual bond certificates
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-purple-900/30 border border-purple-700/40 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-400">2</span>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white">Review with Legal Counsel</h5>
                <p className="text-xs text-gray-500 mt-1">
                  Have qualified bond counsel review all documents before execution
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-green-900/30 border border-green-700/40 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-green-400">3</span>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white">Execute & File</h5>
                <p className="text-xs text-gray-500 mt-1">
                  After review and approval, execute and file the certificates
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4 pt-4">
        <Link href="/bond-generator" className="block">
          <Button variant="glass" size="large" className="w-full">
            ← Back to Overview
          </Button>
        </Link>
        
        <Button 
          variant="primary" 
          size="large"
          onClick={onReset}
          className="w-full"
        >
          Generate More Bonds
        </Button>
      </div>

      {/* Help */}
      <div className="text-center pt-4">
        <p className="text-xs text-gray-600">
          Questions? <Link href="/contact?demo=true" className="text-cyan-400 hover:underline">Request a walkthrough</Link>
        </p>
      </div>
    </div>
  );
}
