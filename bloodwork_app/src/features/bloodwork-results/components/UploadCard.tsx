import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useBloodworkStore } from '../store/use-bloodwork-store';
import { useUploadMutation } from '../hooks/use-upload-mutation';
import { useStartAnalysis } from '../hooks/use-start-analysis';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadCard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    step, 
    pickedFile, 
    setStep, 
    setPickedFile, 
    setUploadId, 
    setJobId, 
    setError 
  } = useBloodworkStore();
  //subscribes to ALL store changes
  
  const uploadMutation = useUploadMutation();
  const startAnalysisMutation = useStartAnalysis();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        // Validate file size
        if (file.size && file.size > MAX_FILE_SIZE) {
          Alert.alert(
            'File Too Large',
            `Please select a PDF file smaller than ${formatFileSize(MAX_FILE_SIZE)}.`
          );
          return;
        }

        // Validate file type
        if (file.mimeType !== 'application/pdf') {
          Alert.alert(
            'Invalid File Type',
            'Please select a PDF file.'
          );
          return;
        }

        setPickedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
          size: file.size,
        });
        setStep('picked');
        setError(undefined);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const startAnalysisFlow = async () => {
    if (!pickedFile) return;

    setIsProcessing(true);
    setError(undefined);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: pickedFile.uri,
        type: pickedFile.type,
        name: pickedFile.name,
      } as any);

      // Upload the file
      setStep('uploaded');
      const uploadResponse = await uploadMutation.mutateAsync(formData);
      const uploadId = uploadResponse.data.uploadId;
      setUploadId(uploadId);

      // Start analysis
      setStep('analyzing');
      const analysisResponse = await startAnalysisMutation.mutateAsync(uploadId);
      const jobId = analysisResponse.data.jobId;
      setJobId(jobId);

    } catch (error: any) {
      console.error('Analysis flow failed:', error);
      setError(error.message || 'Failed to start analysis');
      setStep('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setPickedFile(undefined);
    setStep('idle');
    setError(undefined);
  };

  if (step === 'idle') {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.uploadArea}>
          <Text style={styles.title}>Upload Bloodwork Report</Text>
          <Text style={styles.subtitle}>
            Select a PDF file of your bloodwork results to get AI-powered insights
          </Text>
          
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={pickDocument}
            activeOpacity={0.7}
          >
            <Text style={styles.uploadButtonText}>📄 Select PDF File</Text>
          </TouchableOpacity>
          
          <Text style={styles.privacy}>
            🔒 Your data is processed securely and not stored permanently
          </Text>
        </View>
      </View>
    );
  }

  if (step === 'picked' && pickedFile) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.fileInfo}>
          <Text style={styles.title}>File Selected</Text>
          
          <View style={styles.fileDetails}>
            <Text style={styles.fileName}>📄 {pickedFile.name}</Text>
            {pickedFile.size && (
              <Text style={styles.fileSize}>{formatFileSize(pickedFile.size)}</Text>
            )}
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={resetUpload}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Change File</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryButton, isProcessing && styles.disabledButton]} 
              onPress={startAnalysisFlow}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>
                {isProcessing ? 'Starting...' : '🧠 Analyze'}
              </Text>
            </TouchableOpacity>
          </View>
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
  uploadArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  fileInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
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
  uploadButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  privacy: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  fileDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});
