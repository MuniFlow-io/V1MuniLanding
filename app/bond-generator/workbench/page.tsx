"use client";

import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WorkbenchStepper } from "@/components/bond-generator/WorkbenchStepper";
import { FileUpload } from "@/components/bond-generator/FileUpload";
import { LegalDisclaimerModal } from "@/components/bond-generator/LegalDisclaimerModal";
import { TemplateTagging } from "@/components/bond-generator/TemplateTagging";
import { DataUpload } from "@/components/bond-generator/DataUpload";
import { DataPreview } from "@/components/bond-generator/DataPreview";
import { AssemblyGeneration } from "@/components/bond-generator/AssemblyGeneration";
import { GenerationComplete } from "@/components/bond-generator/GenerationComplete";
import { useBondGenerator } from "@/modules/bond-generator/hooks/useBondGenerator";
import Link from "next/link";

export default function BondGeneratorWorkbenchPage() {
  // ✅ CORRECT: Use existing hook (Layer 2)
  // Hook handles: state management, API calls, error handling
  const {
    step,
    templateFile,
    maturityFile,
    cusipFile,
    bonds,
    uploadTemplate,
    completeTagging,
    cancelTagging,
    setMaturityFile,
    setCusipFile,
    previewParsedData,
    proceedFromPreview,
    generateBonds,
    goToStep,
    reset,
    isLoading,
    error,
    showLegalDisclaimer,
    acceptLegalDisclaimer,
  } = useBondGenerator();

  // Get current step number for stepper
  const stepNumbers: Record<string, number> = {
    'upload-template': 1,
    'tagging': 2,
    'upload-data': 3,
    'preview-data': 4,
    'assembly-check': 5,
    'generating': 5,
    'complete': 5,
  };

  return (
    <div className="bg-black">
      <Navigation />
      
      {/* Legal Disclaimer Modal */}
      {showLegalDisclaimer && (
        <LegalDisclaimerModal 
          onAccept={acceptLegalDisclaimer}
        />
      )}
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Header Section */}
        <section className="pt-32 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2">
                  Bond Generator
                </h1>
                <p className="text-gray-400">
                  {step === 'upload-template' && 'Step 1 of 5: Upload bond form template'}
                  {step === 'tagging' && 'Step 2 of 5: Tag template variables'}
                  {step === 'upload-data' && 'Step 3 of 5: Upload schedules'}
                  {step === 'preview-data' && 'Step 4 of 5: Review data'}
                  {step === 'assembly-check' && 'Step 5 of 5: Generate certificates'}
                </p>
              </div>
              <Link href="/bond-generator/guide">
                <Button variant="glass" size="medium">
                  View Guide
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Workbench Area */}
        <section className="pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            <Card variant="feature" size="large">
              <WorkbenchStepper currentStep={stepNumbers[step] || 1} />

              {/* Step 1: Upload Template */}
              {step === 'upload-template' && (
                <div className="mt-8">
                  <FileUpload
                    onUpload={uploadTemplate}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              )}

              {/* Step 2: Tagging */}
              {step === 'tagging' && (
                <div className="mt-8">
                  <TemplateTagging
                    templateFile={templateFile}
                    onComplete={completeTagging}
                    onCancel={cancelTagging}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {/* Step 3: Upload Data Files */}
              {step === 'upload-data' && (
                <div className="mt-8">
                  <DataUpload
                    maturityFile={maturityFile}
                    cusipFile={cusipFile}
                    onMaturityUpload={setMaturityFile}
                    onCusipUpload={setCusipFile}
                    onContinue={previewParsedData}
                    onBack={() => goToStep('tagging')}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              )}

              {/* Step 4: Preview Data */}
              {step === 'preview-data' && (
                <div className="mt-8">
                  <DataPreview
                    maturityFile={maturityFile}
                    cusipFile={cusipFile}
                    onContinue={proceedFromPreview}
                    onBack={() => goToStep('upload-data')}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {/* Step 5: Assembly Check & Generate */}
              {(step === 'assembly-check' || step === 'generating') && (
                <div className="mt-8">
                  <AssemblyGeneration
                    bonds={bonds}
                    onGenerate={generateBonds}
                    onBack={() => goToStep('preview-data')}
                    isGenerating={step === 'generating' || isLoading}
                  />
                </div>
              )}

              {/* Step 6: Complete */}
              {step === 'complete' && (
                <div className="mt-8">
                  <GenerationComplete
                    bondCount={bonds?.length || 0}
                    onReset={reset}
                  />
                </div>
              )}
            </Card>

            {/* Help Cards */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Card variant="feature" size="medium">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-700/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Need a sample template?</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Download our example bond certificate template to see how the tool works.
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="feature" size="medium">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Questions?</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Review the <Link href="/bond-generator/guide" className="text-cyan-400 hover:underline">guide</Link> or <Link href="/contact?demo=true" className="text-cyan-400 hover:underline">request a walkthrough</Link>.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
