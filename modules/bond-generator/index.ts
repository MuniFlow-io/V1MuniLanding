/**
 * Bond Generator Module
 * Barrel exports for the bond generator feature
 */

// Types - from types/index.ts (includes MaturitySchedulePreview type)
export type {
  AssembledBond,
  BondGeneratorState,
  BondGeneratorStep,
  CellEditState,
  EditableField,
  MaturitySchedulePreview,
  ParsedMaturityRow,
  RowStatus,
  TagMap,
  TagPosition,
} from './types';

// Types - from types/cusipPreview.ts (includes CusipSchedulePreview type)
export type {
  CusipRowStatus,
  CusipSchedulePreview,
  EditableCusipField,
  ParsedCusipRow,
} from './types/cusipPreview';

// Types - from types/assemblyPreview.ts
export type { AssemblyPreview, EditableAssemblyField, MergeResult } from './types/assemblyPreview';

// Components (same names as types, but they're in different namespaces - types vs values)
export { AssemblyCheckScreen } from './components/AssemblyCheckScreen';
export { EditableCell } from './components/atoms/EditableCell';
export { StatusBadge } from './components/atoms/StatusBadge';
export { BondsPreviewTable } from './components/BondsPreviewTable';
export { FileUploadCard } from './components/FileUploadCard';
export { FinalityConfirmationModal } from './components/FinalityConfirmationModal';
export { CusipRowPreview } from './components/molecules/CusipRowPreview';
export { MaturityRowPreview } from './components/molecules/MaturityRowPreview';
export { StepIndicator } from './components/StepIndicator';
export { TagAssignmentPopup } from './components/TagAssignmentPopup';
export { TagConfirmationDialog } from './components/TagConfirmationDialog';
export { TagProgressPanel } from './components/TagProgressPanel';
export { TagValidationModal } from './components/TagValidationModal';
export { TemplateUploadCard } from './components/TemplateUploadCard';

// Hooks
export { useBlankTagging } from './hooks/useBlankTagging';
export { useBondGenerator } from './hooks/useBondGenerator';
export type { UseBondGeneratorResult } from './hooks/useBondGenerator';
export { useCusipPreview } from './hooks/useCusipPreview';
export type { UseCusipPreviewReturn } from './hooks/useCusipPreview';
export { useMaturityPreview } from './hooks/useMaturityPreview';
export type { UseMaturityPreviewReturn } from './hooks/useMaturityPreview';

// API
export { applyTagsToTemplate } from './api/blankTaggingApi';
export {
  assembleBondsApi,
  generateBondsApi,
  parseCusipApi,
  parseMaturityApi,
  uploadTemplateApi,
} from './api/bondGeneratorApi';

// Pages
export { BlankSpaceTaggingPage } from './pages/BlankSpaceTaggingPage';
export { BondGeneratorPage } from './pages/BondGeneratorPage';
export { PreviewDataPage } from './pages/PreviewDataPage';

// Utilities
export { formatDateForDisplay, formatDateShort } from './utils/formatDate';
