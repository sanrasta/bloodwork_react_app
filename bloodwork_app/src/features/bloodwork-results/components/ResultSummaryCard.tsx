import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { STATUS_THEME, TestResult } from '../types';

type Props = { 
  test: TestResult;
  isExpanded?: boolean;
  onToggle?: () => void;
};

export default function ResultSummaryCard({ test, isExpanded = false, onToggle }: Props) {
  const theme = STATUS_THEME[test.status] ?? STATUS_THEME['optimal'];
  const insight = test.insight;
  const blink = useRef(new Animated.Value(1)).current;
  const expandAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);

  useEffect(() => {
    Animated.timing(expandAnimation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnimation]);

  const handlePress = () => {
    onToggle?.();
  };

  return (
    <Animated.View 
      style={[
        styles.root,
        {
          minHeight: expandAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 500], // Expand from 300 to 500 when expanded
          }),
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.touchable} 
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{test.title}</Text>
            <View style={[styles.badge, { backgroundColor: theme.bg }]}>
              <Text style={[styles.badgeText, { color: theme.fg }]}>{String(test.status).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Value Display */}
        <View style={styles.valueRow}>
          <Text style={styles.value}>{test.value ?? '—'}</Text>
          {test.unit && <Text style={styles.unit}>{test.unit}</Text>}
        </View>

        {/* Expandable Content */}
        <Animated.View style={[
          styles.expandableContent,
          {
            maxHeight: expandAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 400],
            }),
            opacity: expandAnimation,
          }
        ]}>
          {insight ? (
            <View>
              <Text style={styles.explanation}>{insight.explanation}</Text>

              {insight.recommendations?.supplements && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Supplements</Text>
                  {insight.recommendations.supplements.map((item, idx) => (
                    <Text key={idx} style={styles.item}>• {item}</Text>
                  ))}
                </View>
              )}

              {insight.recommendations?.foods && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Foods</Text>
                  {insight.recommendations.foods.map((item, idx) => (
                    <Text key={idx} style={styles.item}>• {item}</Text>
                  ))}
                </View>
              )}

              {insight.recommendations?.lifestyle && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Lifestyle</Text>
                  {insight.recommendations.lifestyle.map((item, idx) => (
                    <Text key={idx} style={styles.item}>• {item}</Text>
                  ))}
                </View>
              )}

              {insight.symptoms && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>How you might feel</Text>
                  {insight.symptoms.map((item, idx) => (
                    <Text key={idx} style={styles.item}>• {item}</Text>
                  ))}
                </View>
              )}

              {insight.whenToSeeDoctor && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>When to see a doctor</Text>
                  <Text style={styles.item}>{insight.whenToSeeDoctor}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.empty}>Insight coming soon.</Text>
          )}
        </Animated.View>

        {/* Hint */}
        <View style={styles.hintWrap} pointerEvents="none">
          <Animated.Text
            style={[styles.hint, { opacity: blink }]}
            accessibilityLabel={isExpanded ? "Tap to collapse" : "Tap to expand"}
          >
            {isExpanded ? "Tap to collapse" : "Tap to expand"}
          </Animated.Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1,
    padding: 16,
  },
  touchable: {
    flex: 1,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#E5E5E5', 
    textAlign: 'center' 
  },
  badge: { 
    borderRadius: 999, 
    paddingHorizontal: 10, 
    paddingVertical: 4 
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: '700' 
  },
  valueRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'flex-end', 
    marginBottom: 16 
  },
  value: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#E5E5E5' 
  },
  unit: { 
    marginLeft: 8, 
    fontSize: 14, 
    color: '#9CA3AF' 
  },
  expandableContent: {
    overflow: 'hidden',
    marginBottom: 16,
  },
  explanation: { 
    marginBottom: 12, 
    color: '#E5E5E5', 
    lineHeight: 20 
  },
  section: { 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontWeight: '700', 
    color: '#E5E5E5', 
    marginBottom: 6 
  },
  item: { 
    color: '#9CA3AF', 
    marginBottom: 4 
  },
  empty: { 
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  hintWrap: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    bottom: 10, 
    alignItems: 'center' 
  },
  hint: { 
    textAlign: 'center', 
    color: '#1E40AF', 
    fontWeight: '600',
    fontSize: 12,
  },
});


