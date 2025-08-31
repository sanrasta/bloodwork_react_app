import { useMemo } from 'react';
import { useQuestionnaireStore } from '../store/use-questionnaire-store';
import { QUESTIONNAIRE_QUESTIONS, TOTAL_QUESTIONS } from '../lib/questions';
import type { QuestionnaireComputed } from '../types/types';

/**
 * Custom hook for questionnaire flow - Tier 2 pattern
 * 
 * Features:
 * - Selective subscriptions (performance optimized)
 * - Computed values memoized
 * - Clean component API
 * - Follows established patterns from bloodwork-results
 */
export const useQuestionnaireFlow = (): QuestionnaireComputed & {
  // State selectors
  currentStep: number;
  answers: Record<string, string>;
  isCompleted: boolean;
  
  // Avatar state
  avatarStage: 'confused' | 'curious' | 'confident';
  isAvatarTransitioning: boolean;
  
  // Actions (stable references)
  setAnswer: (questionId: string, value: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeQuestionnaire: () => void;
} => {
  // ✅ Selective subscriptions - only re-render when these specific values change
  const currentStep = useQuestionnaireStore(state => state.currentStep);
  const answers = useQuestionnaireStore(state => state.answers);
  const isCompleted = useQuestionnaireStore(state => state.isCompleted);
  const avatarStage = useQuestionnaireStore(state => state.avatar.stage);
  const isAvatarTransitioning = useQuestionnaireStore(state => state.avatar.isTransitioning);
  
  // ✅ Actions are stable - won't cause re-renders when store updates
  const setAnswer = useQuestionnaireStore(state => state.setAnswer);
  const nextStep = useQuestionnaireStore(state => state.nextStep);
  const previousStep = useQuestionnaireStore(state => state.previousStep);
  const completeQuestionnaire = useQuestionnaireStore(state => state.completeQuestionnaire);
  
  // ✅ Computed values - memoized to prevent unnecessary recalculations
  const computed = useMemo((): QuestionnaireComputed => {
    const progress = (currentStep / TOTAL_QUESTIONS) * 100;
    const currentQuestion = QUESTIONNAIRE_QUESTIONS[currentStep] || null;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep >= TOTAL_QUESTIONS - 1;
    
    // Check if current question is answered (for canGoNext)
    const canGoNext = currentQuestion 
      ? !!answers[currentQuestion.id] 
      : false;
    
    const canGoPrevious = currentStep > 0;
    
    return {
      progress,
      canGoNext,
      canGoPrevious,
      isFirstStep,
      isLastStep,
      currentQuestion,
    };
  }, [currentStep, answers]);
  
  return {
    // State
    currentStep,
    answers,
    isCompleted,
    avatarStage,
    isAvatarTransitioning,
    
    // Actions
    setAnswer,
    nextStep,
    previousStep,
    completeQuestionnaire,
    
    // Computed values
    ...computed,
  };
};
