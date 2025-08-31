import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { 
  QuestionnaireIntro, 
  QuestionScreen, 
  checkQuestionnaireCompletion,
  initializeQuestionnaireStore,
  useQuestionnaireStore 
} from '../features/questionnaire';
import { SignInScreen } from '../features/auth';

interface QuestionnaireGateProps {
  children: React.ReactNode; // The main app content
}

export default function QuestionnaireGate({ children }: QuestionnaireGateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  
  const isCompleted = useQuestionnaireStore(state => state.isCompleted);
  const currentStep = useQuestionnaireStore(state => state.currentStep);

  // Initialize questionnaire state on mount
  useEffect(() => {
    const initializeState = async () => {
      try {
        await initializeQuestionnaireStore();
        const completed = await checkQuestionnaireCompletion();
        
        if (!completed) {
          setShowQuestionnaire(true);
          // If user was in progress, go directly to questions
          if (currentStep > 0) {
            setShowQuestions(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize questionnaire:', error);
        // On error, skip questionnaire and go to main app
      } finally {
        setIsLoading(false);
      }
    };

    initializeState();
  }, [currentStep]);

  // Handle questionnaire completion
  const handleQuestionnaireComplete = () => {
    setShowQuestionnaire(false);
    setShowQuestions(false);
  };

  // Handle starting questionnaire
  const handleStartQuestionnaire = () => {
    setShowQuestions(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Could add a loading spinner here */}
      </View>
    );
  }

  // Show questionnaire for signed-out users who haven't completed it
  return (
    <>
      <SignedOut>
        {showQuestionnaire && !isCompleted ? (
          showQuestions ? (
            <QuestionScreen onComplete={handleQuestionnaireComplete} />
          ) : (
            <QuestionnaireIntro onStart={handleStartQuestionnaire} />
          )
        ) : (
          <SignInScreen />
        )}
      </SignedOut>
      
      <SignedIn>
        {children}
      </SignedIn>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
