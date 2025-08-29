import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useBloodworkStore } from '../store/use-bloodwork-store';
import { useAnalysisJob } from '../hooks/use-analysis-job';

export default function AnalysisProgress() {
  const { 
    step, 
    jobId, 
    setStep, 
    setResultId, 
    setError, 
    resetFlow 
  } = useBloodworkStore();
  
  const { data: job, isLoading, isError, error } = useAnalysisJob(jobId);

  // Update store based on job status
  useEffect(() => {
    if (job) {
      switch (job.status) {
        case 'completed':
          if (job.resultId) {
            setResultId(job.resultId);
            setStep('completed');
          }
          break;
        case 'failed':
          setError(job.errorMessage || 'Analysis failed');
          setStep('failed');
          break;
        // 'queued' and 'running' states are handled by the polling
      }
    }
  }, [job, setStep, setResultId, setError]);

  // Handle error from query
  useEffect(() => {
    if (isError && error) {
      setError(error.message || 'Failed to fetch job status');
      setStep('failed');
    }
  }, [isError, error, setError, setStep]);

  if (step === 'uploaded') {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.progressCard}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.title}>Uploading File...</Text>
          <Text style={styles.subtitle}>Preparing your bloodwork report for analysis</Text>
        </View>
      </View>
    );
  }

  if (step === 'analyzing') {
    const progress = job?.progress || 0;
    const statusText = job?.status === 'queued' ? 'Queued for Analysis' : 'Analyzing Results';
    const subtitleText = job?.status === 'queued' 
      ? 'Your report is in the analysis queue' 
      : 'AI is processing your bloodwork data';

    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.progressCard}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.title}>{statusText}</Text>
          <Text style={styles.subtitle}>{subtitleText}</Text>
          
          {progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}% complete</Text>
            </View>
          )}
          
          <Text style={styles.timeEstimate}>
            ⏱️ This usually takes 1-2 minutes
          </Text>
        </View>
      </View>
    );
  }

  if (step === 'failed') {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.title}>Analysis Failed</Text>
          <Text style={styles.errorMessage}>
            {useBloodworkStore.getState().error || 'Something went wrong during analysis'}
          </Text>
          
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={resetFlow}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeEstimate: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 32,
  },
  errorMessage: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
