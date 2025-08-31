import React, { useEffect } from 'react';
import { View, StyleSheet, Text, AccessibilityInfo } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  runOnJS,
  ReduceMotion
} from 'react-native-reanimated';
import type { AvatarStage } from '../types/types';

interface AvatarDisplayProps {
  stage: AvatarStage;
  isTransitioning: boolean;
  size?: 'small' | 'medium' | 'large';
  onTransitionComplete?: () => void;
}

// Avatar configuration for each stage
const AVATAR_CONFIG = {
  confused: {
    emoji: '😕',
    color: '#9CA3AF', // Gray
    scale: 0.9,
    message: "Let's figure this out together...",
  },
  curious: {
    emoji: '🤔',
    color: '#3B82F6', // Blue
    scale: 1.0,
    message: "I'm learning about you!",
  },
  confident: {
    emoji: '✨',
    color: '#10B981', // Green
    scale: 1.1,
    message: "Ready to take control!",
  },
} as const;

const SIZE_CONFIG = {
  small: { container: 60, emoji: 32, message: 12 },
  medium: { container: 100, emoji: 48, message: 14 },
  large: { container: 140, emoji: 64, message: 16 },
} as const;

export default function AvatarDisplay({ 
  stage, 
  isTransitioning, 
  size = 'medium',
  onTransitionComplete 
}: AvatarDisplayProps) {
  const config = AVATAR_CONFIG[stage];
  const sizeConfig = SIZE_CONFIG[size];
  
  // Animated values
  const scale = useSharedValue<number>(config.scale);
  const colorProgress = useSharedValue(stage === 'confused' ? 0 : stage === 'curious' ? 0.5 : 1);
  const messageOpacity = useSharedValue(0);
  
  // Handle stage transitions
  useEffect(() => {
    if (isTransitioning) {
      // Scale animation with bounce (respects reduce motion)
      scale.value = withSequence(
        withSpring(config.scale * 1.2, { 
          damping: 8,
          reduceMotion: ReduceMotion.System 
        }),
        withSpring(config.scale, { 
          damping: 12,
          reduceMotion: ReduceMotion.System 
        })
      );
      
      // Color transition
      const targetProgress = stage === 'confused' ? 0 : stage === 'curious' ? 0.5 : 1;
      colorProgress.value = withTiming(targetProgress, { 
        duration: 600,
        reduceMotion: ReduceMotion.System 
      });
      
      // Show message briefly
      messageOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 2000 }), // Hold for 2 seconds
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished && onTransitionComplete) {
            runOnJS(onTransitionComplete)();
          }
        })
      );
    }
  }, [stage, isTransitioning, config.scale, onTransitionComplete]);
  
  // Animated styles
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 0.5, 1],
      ['#F3F4F6', '#DBEAFE', '#D1FAE5'] // Light gray -> Light blue -> Light green
    ),
  }));
  
  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));
  
  return (
    <View 
      style={[styles.container, { height: sizeConfig.container + 40 }]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={`Avatar showing ${stage} state: ${config.message}`}
      accessibilityHint="Visual representation of your progress through the questionnaire"
    >
      <Animated.View 
        style={[
          styles.avatarContainer, 
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
          },
          avatarStyle
        ]}
      >
        <Text 
          style={[styles.emoji, { fontSize: sizeConfig.emoji }]}
          accessible={false} // Handled by parent
        >
          {config.emoji}
        </Text>
      </Animated.View>
      
      {/* Transition message */}
      <Animated.View 
        style={[styles.messageContainer, messageStyle]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
      >
        <Text 
          style={[styles.message, { fontSize: sizeConfig.message }]}
          accessible={false} // Handled by parent
        >
          {config.message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    borderRadius: 50,
    justifyContent: 'center',
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
  emoji: {
    textAlign: 'center',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: 200,
  },
  message: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
});
