// MVP Questionnaire Types - Minimal and focused

export interface QuestionOption {
  id: string;
  text: string;
  value: string;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: 'multiple-choice' | 'scale';
  options: QuestionOption[];
  required: boolean;
}

// 3 Avatar Stages Only - MVP
export type AvatarStage = 'confused' | 'curious' | 'confident';

export interface AvatarState {
  stage: AvatarStage;
  isTransitioning: boolean;
}

// Minimal questionnaire state
export interface QuestionnaireState {
  currentStep: number;
  answers: Record<string, string>; // questionId -> selectedValue
  isCompleted: boolean;
  avatar: AvatarState;
}

// Store actions interface
export interface QuestionnaireActions {
  setAnswer: (questionId: string, value: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeQuestionnaire: () => void;
  resetQuestionnaire: () => void;
}

export interface QuestionnaireStore extends QuestionnaireState, QuestionnaireActions {}

// Computed values (derived in hooks, not stored)
export interface QuestionnaireComputed {
  progress: number; // 0-100
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentQuestion: Question | null;
}
