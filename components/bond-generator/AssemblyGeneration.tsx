"use client";

/**
 * Assembly Generation Component
 * 
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Just renders UI
 * - NO business logic
 * - NO auth checking
 * - NO API calls
 * - ALL logic is in useAssemblyGeneration hook
 * 
 * ELITE STANDARDS:
 * - Component has no imports of logger, auth, or services
 * - Component calls hook and renders based on hook state
 * - <300 lines (just UI)
 */

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AccountGateModal } from "./AccountGateModal";
import { PreviewLimitBanner } from "./PreviewLimitBanner";
import { useAssemblyGeneration } from "@/modules/bond-generator/hooks/useAssemblyGeneration";
import type { AssembledBond } from "@/modules/bond-generator/types";

interface AssemblyGenerationProps {
  bonds: AssembledBond[] | null;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating?: boolean;
  templateFile?: File | null;
}

export function AssemblyGeneration({ 
  bonds,
  onGenerate,
  onBack,
  isGenerating = false,
  templateFile = null
}: AssemblyGenerationProps) {
  // ✅ DUMB COMPONENT: Just call the hook
  const {
    showPreviewModal,
    previewHtml,
    isLoadingPreview,
    previewsRemaining,
    showAccountGate,
    accountGateReason,
    handlePreviewFirst,
    handleGenerateClick,
    closePreviewModal,
    closeAccountGate,
  } = useAssemblyGeneration({
    bonds,
    templateFile,
    onGenerate,
  });

  if (!bonds || bonds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bonds to generate</p>
        <Button variant="glass" size="medium" onClick={onBack} className="mt-4">
          ← Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Limit Banner */}
      <PreviewLimitBanner 
        previewsRemaining={previewsRemaining}
        show={!isGenerating}
      />

      {/* Info Banner */}
      <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-300">Ready to Generate</p>
            <p className="text-xs text-purple-200/80 mt-1">
              Review the summary below and click generate to create your bond certificates
            </p>
          </div>
        </div>
      </div>

      {/* Assembly Summary */}
      <Card variant="feature" size="large">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Generation Summary</h3>
            <p className="text-sm text-gray-400">
              {bonds.length} bond certificate{bonds.length !== 1 ? 's' : ''} ready to generate
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-950 border border-cyan-700/30 rounded-lg p-4">
              <p className="text-3xl font-bold text-cyan-400">{bonds.length}</p>
              <p className="text-xs text-gray-500 mt-1">Total Bonds</p>
            </div>
            <div className="bg-gray-950 border border-green-700/30 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-400">
                {bonds[0]?.dated_date ? new Date(bonds[0].dated_date).getFullYear() : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Issue Year</p>
            </div>
            <div className="bg-gray-950 border border-purple-700/30 rounded-lg p-4">
              <p className="text-3xl font-bold text-purple-400">
                {bonds.filter(b => b.series).length > 0 ? 'Multi' : 'Single'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Series</p>
            </div>
            <div className="bg-gray-950 border border-yellow-700/30 rounded-lg p-4">
              <p className="text-3xl font-bold text-yellow-400">
                {bonds.reduce((sum, b) => sum + (b.principal_amount || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Principal</p>
            </div>
          </div>

          {/* Bond Preview (First 3) */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Sample Bonds (First 3)</h4>
            <div className="space-y-2">
              {bonds.slice(0, 3).map((bond, idx) => (
                <div 
                  key={idx}
                  className="bg-gray-950 border border-gray-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border border-cyan-700/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-cyan-400">#{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {bond.maturity_date ? new Date(bond.maturity_date).toLocaleDateString() : 'No date'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {bond.cusip_no || 'No CUSIP'} • {bond.coupon_rate || '0'}% • 
                        {bond.principal_amount ? ` $${bond.principal_amount.toLocaleString()}` : ' $0'}
                      </p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ))}
              {bonds.length > 3 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  + {bonds.length - 3} more bond{bonds.length - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Final Warning */}
      <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-300">Final Check</p>
            <p className="text-xs text-yellow-200/80 mt-1">
              Once you generate, bond data is finalized. Make sure everything is correct before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <Button 
          variant="glass" 
          size="medium"
          onClick={onBack}
          disabled={isGenerating}
        >
          ← Back
        </Button>
        
        <div className="flex items-center gap-3">
          {templateFile && (
            <Button 
              variant="glass" 
              size="medium"
              onClick={handlePreviewFirst}
              disabled={isGenerating || isLoadingPreview}
            >
              {isLoadingPreview ? 'Loading...' : '👁️ Preview Sample'}
            </Button>
          )}
          
          <Button 
            variant="primary" 
            size="large"
            onClick={handleGenerateClick}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              `Generate ${bonds.length} Bond${bonds.length !== 1 ? 's' : ''} →`
            )}
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-gray-900 border border-cyan-700/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-b border-cyan-700/30 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Bond Preview</h3>
                <p className="text-sm text-gray-400">Sample of first bond certificate</p>
              </div>
              <button
                onClick={closePreviewModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingPreview && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Generating preview...</p>
                </div>
              )}
              
              {!isLoadingPreview && previewHtml && (
                <div className="bg-white rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[600px] border-0"
                    title="Bond Preview"
                  />
                </div>
              )}

              {!isLoadingPreview && !previewHtml && (
                <div className="text-center py-12">
                  <p className="text-gray-400">Preview not available</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800 px-6 py-4">
              <Button 
                variant="glass"
                size="medium"
                onClick={closePreviewModal}
                className="w-full"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Account Gate Modal */}
      <AccountGateModal
        isOpen={showAccountGate}
        reason={accountGateReason}
        bondCount={bonds?.length || 0}
        previewsUsed={3 - previewsRemaining}
        onClose={closeAccountGate}
        onAuthSuccess={onGenerate}
      />
    </div>
  );
}
