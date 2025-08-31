import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import AvatarDisplay from './AvatarDisplay';

interface QuestionnaireIntroProps {
  onStart: () => void;
}

export default function QuestionnaireIntro({ onStart }: QuestionnaireIntroProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Avatar */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.avatarSection}
        >
          <AvatarDisplay
            stage="confused"
            isTransitioning={false}
            size="large"
          />
        </Animated.View>

        {/* Main content */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(600)}
          style={styles.textSection}
        >
          <Text style={styles.title}>
            Before we begin...
          </Text>
          <Text style={styles.subtitle}>
            Help us understand your relationship with your health data. This will take just 2 minutes.
          </Text>
          
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎯</Text>
              <Text style={styles.benefitText}>Personalized experience</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Text style={styles.benefitText}>Better recommendations</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🔒</Text>
              <Text style={styles.benefitText}>Completely private</Text>
            </View>
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(600)}
          style={styles.ctaSection}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={onStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Let's Start</Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            4 quick questions • No sign-up required yet
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: -40,
  },
  textSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    maxWidth: 320,
  },
  benefitsContainer: {
    gap: 16,
    alignItems: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    fontSize: 20,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  ctaSection: {
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
});
