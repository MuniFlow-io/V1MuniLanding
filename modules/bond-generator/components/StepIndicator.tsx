/**
 * StepIndicator Component
 *
 * ARCHITECTURE: Component Layer (Layer 1)
 * - Pure UI component (dumb)
 * - NO hooks
 * - Shows current step in workflow
 * - ✅ FIX: Shows completion status based on actual data, not just current step
 */

import { Check as CheckIcon } from '@mui/icons-material';
import { Box, Step, StepLabel, Stepper } from '@mui/material';
import type { BondGeneratorStep } from '../types';

interface StepIndicatorProps {
  currentStep: BondGeneratorStep;
  // ✅ FIX: Pass actual completion state, not just current step
  hasTemplate?: boolean;
  hasTaggedTemplate?: boolean;
  hasDataFiles?: boolean;
  hasReviewedData?: boolean;
  isFinalized?: boolean;
  hasBonds?: boolean;
  isComplete?: boolean;
}

const steps = [
  { id: 'upload-template', label: '1. Upload Template' },
  { id: 'tagging', label: '2. Tag Template' },
  { id: 'upload-data', label: '3. Upload Data' },
  { id: 'preview-data', label: '4. Preview & Confirm' },
  { id: 'assembly-check', label: '5. Final Review' },
  { id: 'generating', label: '6. Generating' },
  { id: 'complete', label: '7. Complete' },
];

export function StepIndicator({
  currentStep,
  hasTemplate,
  hasTaggedTemplate,
  hasDataFiles,
  hasReviewedData,
  isFinalized,
  hasBonds,
  isComplete,
}: StepIndicatorProps) {
  const activeIndex = steps.findIndex((s) => s.id === currentStep);

  // ✅ FIX: Determine which steps are actually completed based on data
  const isStepCompleted = (stepId: string): boolean => {
    switch (stepId) {
      case 'upload-template':
        return !!hasTemplate;
      case 'tagging':
        return !!hasTaggedTemplate;
      case 'upload-data':
        return !!hasDataFiles;
      case 'preview-data':
        return !!hasReviewedData;
      case 'assembly-check':
        return !!isFinalized; // Completed when finality confirmed
      case 'generating':
        return !!isComplete;
      case 'complete':
        return !!isComplete;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper activeStep={activeIndex}>
        {steps.map((step, index) => {
          const completed = index < activeIndex && isStepCompleted(step.id);
          return (
            <Step key={step.id} completed={completed}>
              <StepLabel StepIconComponent={(props) => <CustomStepIcon {...props} />}>
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}

interface CustomStepIconProps {
  active?: boolean;
  completed?: boolean;
}

function CustomStepIcon(props: CustomStepIconProps) {
  const { active, completed } = props;

  if (completed) {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: 'success.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        bgcolor: active ? 'primary.main' : 'grey.300',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
}
