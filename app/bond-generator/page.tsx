"use client";

import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function BondGeneratorPage() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Header */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Bond Generator
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Upload your bond template and schedules. Generate executed certificates.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-24 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* What You Need */}
            <Card variant="feature" size="large">
              <h2 className="text-2xl font-semibold text-white mb-6">
                What you&apos;ll need
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Bond Template</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Your final bond form in .docx format
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Maturity Schedule</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Dates, principal amounts, rates (.xlsx or .csv)
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">CUSIP Numbers</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Validated CUSIP assignments (.xlsx or .csv)
                  </p>
                </div>
              </div>
            </Card>

            {/* How It Works */}
            <Card variant="feature" size="large">
              <h2 className="text-2xl font-semibold text-white mb-6">
                How it works
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-semibold text-cyan-400">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Upload & Tag</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Upload your bond template and mark where data should be inserted (maturity date, principal, CUSIP, etc.)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-semibold text-cyan-400">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Schedules</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Upload your maturity schedule and CUSIP file. The tool validates each row independently.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-semibold text-cyan-400">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Review & Generate</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Preview assembled bonds, verify accuracy, and download your certificates as a ZIP file.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Legal Disclaimer (Collapsible) */}
            <Card variant="feature" size="large">
              <button
                onClick={() => setShowDisclaimer(!showDisclaimer)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="text-lg font-semibold text-white">
                  Legal Disclaimer
                </h2>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showDisclaimer ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDisclaimer && (
                <div className="mt-6 pt-6 border-t border-gray-800 space-y-4">
                  <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                    <p>
                      <strong className="text-gray-300">This tool performs mechanical assembly only.</strong> It does not draft bond terms, recommend structures, infer missing data, or replace legal judgment.
                    </p>
                    <p>
                      User is responsible for reviewing all generated documents for accuracy before execution. This tool does not provide legal advice.
                    </p>
                    <p>
                      <strong className="text-gray-300">Current scope:</strong> General obligation bonds, one series, serial maturities only. Does not support multi-series transactions or term bonds.
                    </p>
                    <p className="text-xs text-gray-500 pt-3 border-t border-gray-800">
                      Uploaded files are processed in your session and not shared. Retention is session-based unless explicitly stated otherwise.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Start CTA */}
            <div className="pt-8 text-center">
              <Link href="/bond-generator/workbench">
                <Button variant="primary" size="large" className="px-12">
                  Start Bond Generator
                </Button>
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Questions? <Link href="/contact?demo=true" className="text-cyan-400 hover:underline">Get help</Link>
              </p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
