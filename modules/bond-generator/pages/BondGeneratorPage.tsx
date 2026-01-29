'use client';

/**
 * Bond Generator Page - COMPLETE FLOW
 *
 * ARCHITECTURE: Page Layer (Layer 1) - COMPOSITION
 * - Uses hook for ALL logic
 * - Composes components
 * - NO business logic
 * - Can be standalone (full-screen) or embedded
 *
 * ✅ PERFORMANCE: Dynamic imports for step-based components
 */

import { ArrowBack, ArrowForward, Home } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { BondInfoFormSection } from '../components/BondInfoFormSection';
import { FileUploadCard } from '../components/FileUploadCard';
import { LegalDisclaimerModal } from '../components/LegalDisclaimerModal';
import { StepIndicator } from '../components/StepIndicator';
import { TemplateUploadCard } from '../components/TemplateUploadCard';
import { useBondGenerator } from '../hooks/useBondGenerator';
import { useBondGeneratorNavigation } from '../hooks/useBondGeneratorNavigation';

// ✅ PERFORMANCE: Lazy load heavy components (only when user reaches that step)
const BlankSpaceTaggingPage = dynamic(
  () => import('./BlankSpaceTaggingPage').then((m) => ({ default: m.BlankSpaceTaggingPage })),
  { ssr: false }
);
const PreviewDataPage = dynamic(
  () => import('./PreviewDataPage').then((m) => ({ default: m.PreviewDataPage })),
  { ssr: false }
);
const AssemblyCheckScreen = dynamic(
  () =>
    import('../components/AssemblyCheckScreen').then((m) => ({ default: m.AssemblyCheckScreen })),
  { ssr: false }
);
const FinalityConfirmationModal = dynamic(
  () =>
    import('../components/FinalityConfirmationModal').then((m) => ({
      default: m.FinalityConfirmationModal,
    })),
  { ssr: false }
);

interface BondGeneratorPageProps {
  standalone?: boolean; // If true, show MuniFlow header and take full screen
}

export function BondGeneratorPage({ standalone = false }: BondGeneratorPageProps) {
  const router = useRouter();
  const {
    step,
    templateFile,
    maturityFile,
    cusipFile,
    tagMap,
    bonds,
    bondInfo,
    isLoading,
    error,
    isFinalized,
    showLegalDisclaimer,
    setTemplateFile,
    setMaturityFile,
    setCusipFile,
    setBondInfo,
    uploadTemplate,
    previewParsedData,
    proceedFromPreview,
    generateBonds,
    completeTagging,
    cancelTagging,
    goToStep,
    reset,
    acceptLegalDisclaimer,
  } = useBondGenerator();

  const handleBackToHome = () => {
    router.push('/bond-generator');
  };

  // Navigation logic (delegated to hook)
  const navigation = useBondGeneratorNavigation(step, {
    templateFile,
    maturityFile,
    cusipFile,
    bonds,
    isFinalized,
    isLoading,
  });

  // Can preview when on upload-data step and have both data files
  const canPreview = maturityFile && cusipFile;

  const handleTemplateChange = (file: File | null) => {
    setTemplateFile(file);
    if (file) {
      uploadTemplate(file);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack) {
      goToStep(navigation.stepOrder[navigation.currentStepIndex - 1]);
    }
  };

  const handleForward = () => {
    if (navigation.canGoForward) {
      goToStep(navigation.stepOrder[navigation.currentStepIndex + 1]);
    }
  };

  const wizardContent = (
    <>
      {/* Legal Disclaimer - Shows on first load */}
      <LegalDisclaimerModal open={showLegalDisclaimer} onAccept={acceptLegalDisclaimer} />

      {/* Header with Navigation */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!standalone && (
              <Tooltip title="Save & Exit to Home">
                <IconButton
                  onClick={handleBackToHome}
                  size="medium"
                  disabled={step === 'complete'}
                  sx={{ color: 'text.secondary' }}
                >
                  <Home />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={navigation.canGoBack ? 'Go back' : 'Cannot go back'}>
              <span>
                <IconButton
                  onClick={handleBack}
                  size="medium"
                  disabled={!navigation.canGoBack}
                  sx={{ color: navigation.canGoBack ? 'primary.main' : 'action.disabled' }}
                >
                  <ArrowBack />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={navigation.canGoForward ? 'Go forward' : 'Cannot go forward'}>
              <span>
                <IconButton
                  onClick={handleForward}
                  size="medium"
                  disabled={!navigation.canGoForward}
                  sx={{ color: navigation.canGoForward ? 'primary.main' : 'action.disabled' }}
                >
                  <ArrowForward />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 } }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Bond Certificate Generator
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Upload bond form template and Excel files to generate individual bond certificates
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={step}
        hasTemplate={!!templateFile}
        hasTaggedTemplate={!!templateFile && !!tagMap}
        hasDataFiles={!!maturityFile && !!cusipFile}
        hasReviewedData={!!bonds}
        isFinalized={isFinalized}
        hasBonds={!!bonds}
        isComplete={step === 'complete'}
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* STEP 1: Upload Bond Form Template */}
      {step === 'upload-template' && (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Upload Bond Form Template
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            DOCX file with blank spaces to be tagged in next step.
          </Typography>

          <TemplateUploadCard
            file={templateFile}
            onFileSelect={handleTemplateChange}
            disabled={isLoading}
            tags={tagMap?.tags.map((t) => t.tag)}
            isLoading={isLoading}
          />
        </Box>
      )}

      {/* STEP 3: Upload Data */}
      {step === 'upload-data' && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            Upload Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter bond information and upload your maturity schedule and CUSIP file.
          </Typography>

          {/* Bond Information Form */}
          <BondInfoFormSection
            value={bondInfo}
            onChange={setBondInfo}
            disabled={isLoading || isFinalized}
          />

          {/* Data Files Section */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Data Files
          </Typography>

          {(!maturityFile || !cusipFile) && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Please upload both files to continue: Maturity Schedule and CUSIP File.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            {/* Maturity Schedule */}
            <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
              <FileUploadCard
                title="Maturity Schedule"
                description="Excel (.xlsx) or CSV file with maturity dates, principal amounts, coupon rates"
                file={maturityFile}
                onFileSelect={setMaturityFile}
                accept=".xlsx,.xls,.csv"
                disabled={isLoading}
              />
            </Box>

            {/* CUSIP File */}
            <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
              <FileUploadCard
                title="CUSIP File"
                description="Excel (.xlsx) or CSV file with CUSIP Numbers matched to maturity dates"
                file={cusipFile}
                onFileSelect={setCusipFile}
                accept=".xlsx,.xls,.csv"
                disabled={isLoading}
              />
            </Box>
          </Box>

          {/* Preview Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={previewParsedData}
              disabled={!canPreview || isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  Processing...
                </>
              ) : (
                'Review Parsed Data'
              )}
            </Button>
          </Box>
        </Box>
      )}

      {/* STEP 2: Blank Space Tagging (Simplest Approach) */}
      {step === 'tagging' && (
        <>
          {!templateFile ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              No template file uploaded. Please go back to Step 1 and upload a bond form template.
            </Alert>
          ) : (
            <BlankSpaceTaggingPage
              templateFile={templateFile}
              onComplete={completeTagging}
              onCancel={cancelTagging}
              existingTagMap={tagMap}
            />
          )}
        </>
      )}

      {/* STEP 4: Preview Parsed Data (NEW!) */}
      {step === 'preview-data' && (
        <>
          {!maturityFile || !cusipFile ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              Missing data files. Please go back to Step 3 and upload both maturity schedule and
              CUSIP file.
            </Alert>
          ) : (
            <PreviewDataPage
              maturityFile={maturityFile}
              cusipFile={cusipFile}
              onContinue={proceedFromPreview}
              onCancel={reset}
            />
          )}
        </>
      )}

      {/* STEP 5: Assembly Check Screen (Finality modal now shows here) */}
      {step === 'assembly-check' && (
        <>
          {!bonds ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              No bond data available. Please complete previous steps first.
            </Alert>
          ) : (
            <AssemblyCheckScreen
              bonds={bonds}
              datedDate={bonds[0]?.dated_date || ''}
              bondInfo={bondInfo}
              onGenerate={generateBonds}
              onGoBack={reset}
              isGenerating={isLoading}
            />
          )}
        </>
      )}

      {/* STEP 5: Generating State */}
      {step === 'generating' && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Generating Bond Certificates...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filling templates and creating ZIP file. This may take a moment.
          </Typography>
        </Box>
      )}

      {/* STEP 6: Complete */}
      {step === 'complete' && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" gutterBottom color="success.main">
            Bonds Generated Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your bond certificates ZIP file has been downloaded. Check your downloads folder.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={handleBackToHome} size="large">
              Back to Home
            </Button>
            <Button variant="contained" onClick={reset} size="large">
              Generate More Bonds
            </Button>
          </Box>
        </Box>
      )}
    </>
  );

  // Standalone mode: full-screen with MuniFlow header
  if (standalone) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
        {/* MuniFlow Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#47006C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              MuniFlow
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Bond Certificate Generator
            </Typography>
          </Box>
          <Tooltip title="Return to Home">
            <IconButton onClick={handleBackToHome} sx={{ color: 'white' }}>
              <Home />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Wizard Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, height: '100%' }}>
            <Paper sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 2, minHeight: '100%' }}>
              {wizardContent}
            </Paper>
          </Container>
        </Box>
      </Box>
    );
  }

  // Embedded mode: normal page layout
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 2 }}>{wizardContent}</Paper>
      </Container>
    </Box>
  );
}
