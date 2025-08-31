import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../../src/shared/components';
import { UploadCard, AnalysisProgress, ResultSummary, useBloodworkStore } from '../../src/features/bloodwork-results';
import QuestionnaireGate from '../../src/components/QuestionnaireGate';

export default function HomeScreen() {
  const step = useBloodworkStore((state) => state.step);
  
  const renderCurrentStep = () => {
    switch (step) {
      case 'idle':
      case 'picked':
        return <UploadCard />;
      case 'uploaded':
      case 'analyzing':
      case 'failed':
        return <AnalysisProgress />;
      case 'completed':
        return <ResultSummary />;
      default:
        return <UploadCard />;
    }
  };

  return (
    <QuestionnaireGate>
      <ThemedView style={styles.container}>
        {renderCurrentStep()}
      </ThemedView>
    </QuestionnaireGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
