import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useQuestionnaireFlow } from '../hooks/use-questionnaire-flow';
import AvatarDisplay from './AvatarDisplay';
import type { Question } from '../types/types';

interface QuestionScreenProps {
  onComplete: () => void;
}

export default function QuestionScreen({ onComplete }: QuestionScreenProps) {
  const {
    currentStep,
    currentQuestion,
    answers,
    progress,
    canGoNext,
    canGoPrevious,
    isLastStep,
    avatarStage,
    isAvatarTransitioning,
    setAnswer,
    nextStep,
    previousStep,
    completeQuestionnaire,
  } = useQuestionnaireFlow();

  const handleAnswerSelect = useCallback((questionId: string, value: string) => {
    setAnswer(questionId, value);
  }, [setAnswer]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      completeQuestionnaire();
      onComplete();
    } else {
      nextStep();
    }
  }, [isLastStep, completeQuestionnaire, nextStep, onComplete]);

  const handleAvatarTransitionComplete = useCallback(() => {
    // Avatar transition completed - could trigger additional effects here
  }, []);

  if (!currentQuestion) {
    return null;
  }

  const renderQuestion = (question: Question) => {
    const selectedValue = answers[question.id];

    return (
      <Animated.View 
        key={question.id}
        entering={FadeInRight.duration(300)}
        exiting={FadeOutLeft.duration(300)}
        style={styles.questionContainer}
      >
        <Text style={styles.questionTitle}>{question.title}</Text>
        {question.subtitle && (
          <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
        )}

        <View style={styles.optionsContainer}>
          {question.options.map((option) => {
            const isSelected = selectedValue === option.value;
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => handleAnswerSelect(question.id, option.value)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={option.text}
                accessibilityState={{ selected: isSelected }}
                accessibilityHint={`Select this answer for: ${question.title}`}
              >
                <Text 
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                  accessible={false} // Handled by parent TouchableOpacity
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of 4
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <AvatarDisplay
            stage={avatarStage}
            isTransitioning={isAvatarTransitioning}
            size="large"
            onTransitionComplete={handleAvatarTransitionComplete}
          />
        </View>

        {/* Question */}
        {renderQuestion(currentQuestion)}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.backButton,
            !canGoPrevious && styles.navButtonDisabled,
          ]}
          onPress={previousStep}
          disabled={!canGoPrevious}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.navButtonText,
            !canGoPrevious && styles.navButtonTextDisabled,
          ]}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            !canGoNext && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canGoNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Get Started!' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  questionContainer: {
    marginTop: 20,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionTextSelected: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
