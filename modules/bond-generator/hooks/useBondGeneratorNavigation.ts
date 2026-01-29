'use client';

/**
 * Bond Generator Navigation Hook
 *
 * Handles step navigation logic, validation, and forward/back controls
 * Extracted from BondGeneratorPage to follow architecture standards
 */

import { useMemo } from 'react';
import type { BondGeneratorStep } from '../types';

interface NavigationState {
  templateFile: File | null;
  maturityFile: File | null;
  cusipFile: File | null;
  bonds: unknown[] | null;
  isFinalized: boolean;
  isLoading: boolean;
}

export interface UseBondGeneratorNavigationReturn {
  stepOrder: BondGeneratorStep[];
  currentStepIndex: number;
  canGoForward: boolean;
  canGoBack: boolean;
  showBackButton: boolean;
}

export function useBondGeneratorNavigation(
  step: BondGeneratorStep,
  state: NavigationState
): UseBondGeneratorNavigationReturn {
  const { templateFile, maturityFile, cusipFile, bonds, isFinalized, isLoading } = state;

  const stepOrder: BondGeneratorStep[] = useMemo(
    () => [
      'upload-template',
      'tagging',
      'upload-data',
      'preview-data',
      'assembly-check',
      'generating',
      'complete',
    ],
    []
  );

  const currentStepIndex = stepOrder.indexOf(step);

  // Validate prerequisites before allowing forward navigation
  const canGoForward = useMemo(() => {
    if (currentStepIndex >= stepOrder.length - 1 || step === 'generating' || isLoading) {
      return false;
    }

    const nextStep = stepOrder[currentStepIndex + 1];

    switch (nextStep) {
      case 'tagging':
        return !!templateFile;
      case 'upload-data':
        return !!templateFile; // Tagged template
      case 'preview-data':
        return !!maturityFile && !!cusipFile;
      case 'assembly-check':
        return !!bonds;
      case 'generating':
        return !!bonds && !!isFinalized;
      default:
        return true;
    }
  }, [
    currentStepIndex,
    stepOrder,
    step,
    isLoading,
    templateFile,
    maturityFile,
    cusipFile,
    bonds,
    isFinalized,
  ]);

  const canGoBack = currentStepIndex > 0 && step !== 'generating' && !isLoading;
  const showBackButton = step !== 'upload-template' && step !== 'complete';

  return {
    stepOrder,
    currentStepIndex,
    canGoForward,
    canGoBack,
    showBackButton,
  };
}
