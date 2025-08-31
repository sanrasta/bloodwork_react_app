// Export all public components and hooks
export { default as QuestionnaireIntro } from './components/QuestionnaireIntro';
export { default as QuestionScreen } from './components/QuestionScreen';
export { default as AvatarDisplay } from './components/AvatarDisplay';

// Export hooks
export { useQuestionnaireFlow } from './hooks/use-questionnaire-flow';

// Export store and utilities
export { 
  useQuestionnaireStore,
  checkQuestionnaireCompletion,
  initializeQuestionnaireStore 
} from './store/use-questionnaire-store';

// Export types
export type * from './types/types';
