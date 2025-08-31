import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuestionnaireStore, AvatarStage } from '../types/types';
import { getAvatarStageForStep } from '../lib/questions';

// Storage keys
const COMPLETION_KEY = 'questionnaire_completed';
const CURRENT_STEP_KEY = 'questionnaire_step';

// Initial state
const initialState = {
  currentStep: 0,
  answers: {},
  isCompleted: false,
  avatar: {
    stage: 'confused' as AvatarStage,
    isTransitioning: false,
  },
};

export const useQuestionnaireStore = create<QuestionnaireStore>((set, get) => ({
  ...initialState,

  // Functional updates following your preference
  setAnswer: (questionId: string, value: string) => 
    set((state) => ({
      answers: { ...state.answers, [questionId]: value }
    })),

  nextStep: () => 
    set((state) => {
      const newStep = state.currentStep + 1;
      const newStage = getAvatarStageForStep(newStep);
      const shouldTransition = newStage !== state.avatar.stage;
      
      // Persist step to AsyncStorage
      AsyncStorage.setItem(CURRENT_STEP_KEY, newStep.toString()).catch(console.error);
      
      return {
        currentStep: newStep,
        avatar: {
          stage: newStage,
          isTransitioning: shouldTransition,
        }
      };
    }),

  previousStep: () => 
    set((state) => {
      if (state.currentStep <= 0) return state;
      
      const newStep = state.currentStep - 1;
      const newStage = getAvatarStageForStep(newStep);
      const shouldTransition = newStage !== state.avatar.stage;
      
      // Persist step to AsyncStorage
      AsyncStorage.setItem(CURRENT_STEP_KEY, newStep.toString()).catch(console.error);
      
      return {
        currentStep: newStep,
        avatar: {
          stage: newStage,
          isTransitioning: shouldTransition,
        }
      };
    }),

  completeQuestionnaire: () => 
    set((state) => {
      // Persist completion flag
      AsyncStorage.setItem(COMPLETION_KEY, 'true').catch(console.error);
      AsyncStorage.removeItem(CURRENT_STEP_KEY).catch(console.error); // Clean up step tracking
      
      return {
        isCompleted: true,
        avatar: {
          stage: 'confident' as AvatarStage,
          isTransitioning: true,
        }
      };
    }),

  resetQuestionnaire: () => 
    set(() => {
      // Clear AsyncStorage
      AsyncStorage.multiRemove([COMPLETION_KEY, CURRENT_STEP_KEY]).catch(console.error);
      
      return initialState;
    }),
}));

// Helper functions for persistence
export const checkQuestionnaireCompletion = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(COMPLETION_KEY);
    return completed === 'true';
  } catch {
    return false;
  }
};

export const restoreQuestionnaireStep = async (): Promise<number> => {
  try {
    const step = await AsyncStorage.getItem(CURRENT_STEP_KEY);
    return step ? parseInt(step, 10) : 0;
  } catch {
    return 0;
  }
};

// Initialize store from AsyncStorage on app start
export const initializeQuestionnaireStore = async () => {
  const isCompleted = await checkQuestionnaireCompletion();
  const currentStep = await restoreQuestionnaireStep();
  
  if (isCompleted) {
    useQuestionnaireStore.setState({ isCompleted: true });
  } else if (currentStep > 0) {
    const stage = getAvatarStageForStep(currentStep);
    useQuestionnaireStore.setState({ 
      currentStep,
      avatar: { stage, isTransitioning: false }
    });
  }
};
