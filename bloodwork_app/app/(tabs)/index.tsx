import React from 'react';
import { StyleSheet } from 'react-native';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { ThemedView } from '../../src/shared/components';
import { UploadCard, AnalysisProgress, ResultSummary, useBloodworkStore } from '../../src/features/bloodwork-results';
import { SignInScreen } from '../../src/features/auth';

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
    <ThemedView style={styles.container}>
      <SignedIn>
        {renderCurrentStep()}
      </SignedIn>
      <SignedOut>
        <SignInScreen />
      </SignedOut>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
