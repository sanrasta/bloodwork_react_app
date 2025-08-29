import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBloodworkStore } from '../store/use-bloodwork-store';
import { useResultQuery } from '../hooks/use-result-query';
import { TestResult } from '../types/types';

const { width: screenWidth } = Dimensions.get('window');

// Generate specific notes for each test type
const getDefaultNote = (testResult: TestResult & { note?: string }) => {
  const testName = testResult.testName.toLowerCase();
  const status = testResult.status;
  const value = testResult.value;
  
  if (testName.includes('cholesterol')) {
    if (testName.includes('total')) {
      return status === 'normal' 
        ? `Your total cholesterol of ${value} mg/dL is within the healthy range. Keep up your current lifestyle habits.`
        : `Total cholesterol is ${status}. Consider dietary adjustments and discuss with your doctor about lifestyle changes.`;
    } else if (testName.includes('hdl')) {
      return status === 'normal'
        ? `HDL cholesterol of ${value} mg/dL is good. This "good cholesterol" helps protect against heart disease.`
        : `HDL levels are ${status}. Regular exercise can help improve your "good cholesterol" levels.`;
    }
  }
  
  if (testName.includes('glucose') || testName.includes('blood sugar')) {
    return status === 'normal'
      ? `Blood glucose of ${value} mg/dL indicates good blood sugar control. Continue your healthy eating habits.`
      : `Blood glucose is ${status}. Monitor your carbohydrate intake and consider discussing with your doctor.`;
  }
  
  if (testName.includes('vitamin d')) {
    return status === 'normal'
      ? `Vitamin D levels are adequate. Continue getting sunlight exposure and maintain a balanced diet.`
      : `Vitamin D is ${status}. Consider supplements and more sunlight exposure after consulting your doctor.`;
  }
  
  if (testName.includes('hemoglobin') || testName.includes('a1c')) {
    return status === 'normal'
      ? `Hemoglobin A1C indicates excellent long-term blood sugar control over the past 2-3 months.`
      : `A1C levels suggest ${status} blood sugar control. Focus on consistent healthy eating and exercise.`;
  }
  
  // Default note for other tests
  return status === 'normal'
    ? `Your ${testResult.testName} level of ${value} ${testResult.unit} is within the healthy range.`
    : `${testResult.testName} is ${status}. Consult with your healthcare provider about next steps.`;
};

export default function ResultSummary() {
  const { resultId, resetFlow } = useBloodworkStore();
  const { data: result, isLoading, isError, error } = useResultQuery(resultId);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const animationValue = useRef(new Animated.Value(0)).current;
  const arrowBlinkAnimation = useRef(new Animated.Value(1)).current;

  // Hide welcome message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Start blinking arrow animation
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBlinkAnimation, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(arrowBlinkAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    blinkAnimation.start();
    return () => blinkAnimation.stop();
  }, []);

  // Animate card transitions
  const animateToCard = (newIndex: number) => {
    setCurrentCardIndex(newIndex);
    Animated.timing(animationValue, {
      toValue: newIndex,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handle loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.loadingCard}>
          <Text style={styles.title}>Loading Results...</Text>
          <Text style={styles.subtitle}>Preparing your analysis summary</Text>
        </View>
      </View>
    );
  }

  // Handle error state
  if (isError || !result) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.title}>Failed to Load Results</Text>
          <Text style={styles.errorMessage}>
            {error?.message || 'Unable to fetch your analysis results'}
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

  // Process and sort results - critical first, then abnormal, then normal
  const results = result?.results || [];
  const sortedResults = [...results].sort((a, b) => {
    const statusPriority = { critical: 0, high: 1, low: 1, normal: 2 };
    return statusPriority[a.status] - statusPriority[b.status];
  });

  const criticalCount = results.filter(r => r.status === 'critical').length;
  const abnormalCount = results.filter(r => r.status === 'high' || r.status === 'low').length;
  const normalCount = results.filter(r => r.status === 'normal').length;

  // Handle swipe gestures with PanResponder
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx } = gestureState;
      
      if (dx > 50 && currentCardIndex > 0) {
        // Swipe right - go to previous card
        animateToCard(currentCardIndex - 1);
      } else if (dx < -50 && currentCardIndex < sortedResults.length - 1) {
        // Swipe left - go to next card
        animateToCard(currentCardIndex + 1);
      }
    },
  });

  const renderTestCard = ({ item: testResult, index }: { item: TestResult & { note?: string }, index: number }) => {
    const animatedOffset = animationValue.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [-8, 0, 8],
      extrapolate: 'clamp',
    });
    
    const animatedScale = animationValue.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [0.93, 1, 0.93],
      extrapolate: 'clamp',
    });
    
    const animatedOpacity = animationValue.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const animatedTranslateY = animationValue.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: [4, 0, 4],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View 
        key={testResult.id}
        style={[
          styles.testCard,
          {
            transform: [
              { translateX: animatedOffset },
              { translateY: animatedTranslateY },
              { scale: animatedScale }
            ],
            opacity: animatedOpacity,
            zIndex: sortedResults.length - Math.abs(index - currentCardIndex),
          }
        ]}>
        <View style={styles.testCardHeader}>
          <Text style={styles.testName}>{testResult.testName}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: testResult.status === 'critical' ? '#FEE2E2' : 
                              testResult.status === 'high' || testResult.status === 'low' ? '#FEF3C7' : 
                              '#D1FAE5' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: testResult.status === 'critical' ? '#DC2626' : 
                       testResult.status === 'high' || testResult.status === 'low' ? '#D97706' : 
                       '#059669' }
            ]}>
              {testResult.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.testValueContainer}>
          <Text style={styles.testValue}>{testResult.value}</Text>
          <Text style={styles.testUnit}>{testResult.unit}</Text>
        </View>
        
        <Text style={styles.referenceRange}>
          Normal Range: {typeof testResult.referenceRange === 'string' ? testResult.referenceRange : `${testResult.referenceRange.min}-${testResult.referenceRange.max}`}
        </Text>
        
        {testResult.status !== 'normal' && (
          <View style={styles.interpretationContainer}>
            <Text style={styles.interpretationText}>
              {testResult.status === 'critical' ? '⚠️ Requires immediate attention' :
               testResult.status === 'high' ? '📈 Above normal range' :
               testResult.status === 'low' ? '📉 Below normal range' : ''}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {showWelcome ? (
          <>
            <Text style={styles.title}>Analysis Complete! 🎉</Text>
            <Text style={styles.subtitle}>Your bloodwork results are ready</Text>
          </>
        ) : (
          <Text style={styles.subtitle}>Swipe cards to view each test result</Text>
        )}
        
        {/* Overview Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{results.length}</Text>
            <Text style={styles.statLabel}>Tests</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{normalCount}</Text>
            <Text style={styles.statLabel}>Normal</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{abnormalCount}</Text>
            <Text style={styles.statLabel}>Abnormal</Text>
          </View>
          {criticalCount > 0 && (
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>{criticalCount}</Text>
              <Text style={styles.statLabel}>Critical</Text>
            </View>
          )}
        </View>
      </View>

      {/* Swipeable Test Cards */}
      <View style={styles.cardsSection}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        <View style={styles.deckContainer} {...panResponder.panHandlers}>
          {sortedResults.map((testResult, index) => renderTestCard({ item: testResult, index }))}
          
          {/* Left Arrow */}
          {currentCardIndex > 0 && (
            <TouchableOpacity 
              style={styles.leftArrow}
              onPress={() => animateToCard(currentCardIndex - 1)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ opacity: arrowBlinkAnimation }}>
                <Text style={styles.arrowText}>‹</Text>
              </Animated.View>
            </TouchableOpacity>
          )}
          
          {/* Right Arrow */}
          {currentCardIndex < sortedResults.length - 1 && (
            <TouchableOpacity 
              style={styles.rightArrow}
              onPress={() => animateToCard(currentCardIndex + 1)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ opacity: arrowBlinkAnimation }}>
                <Text style={styles.arrowText}>›</Text>
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Card Indicators */}
        <View style={styles.indicators}>
          {sortedResults.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { backgroundColor: index === currentCardIndex ? '#3B82F6' : '#E5E7EB' }
              ]}
            />
          ))}
        </View>
        

      </View>

      {/* Notes and Actions */}
      <View style={styles.footer}>
        {sortedResults.length > 0 && sortedResults[currentCardIndex] && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>📝 {sortedResults[currentCardIndex].testName} Insight</Text>
            <Text style={styles.notesText}>
              {(sortedResults[currentCardIndex] as TestResult & { note?: string }).note || getDefaultNote(sortedResults[currentCardIndex] as TestResult & { note?: string })}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={resetFlow}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>New Analysis</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  cardsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  deckContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  testCard: {
    position: 'absolute',
    width: screenWidth - 64,
    height: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    justifyContent: 'center',
  },

  testCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  testName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testValueContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  testValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
  },
  testUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  referenceRange: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  interpretationContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  interpretationText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 16,
  },
  notesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading and error states
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    margin: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Arrow styles
  leftArrow: {
    position: 'absolute',
    left: 10,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
    zIndex: 1000,
    elevation: 10,
  },
  rightArrow: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
    zIndex: 1000,
    elevation: 10,
  },
  arrowText: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 24,
    includeFontPadding: false,
  },
});