import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import { ThemedView } from '../../../shared/components/ThemedView';
import { ThemedText } from '../../../shared/components/ThemedText';

export default function SignInScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPressSignIn = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive?.({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, [startOAuthFlow]);

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.emoji}>🩸</Text>
        <Text style={styles.heroTitle}>
          Your bloodwork,{'\n'}finally understood.
        </Text>
        <Text style={styles.heroSubtitle}>
          Upload your lab PDF and get clean insights with plain-English explanations. No medical jargon. Just clarity.
        </Text>
        
        <TouchableOpacity style={styles.primaryButton} onPress={onPressSignIn}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresSection}>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>Fast summaries{'\n'}in seconds</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureTitle}>Completely{'\n'}private data</Text>
          </View>
        </View>
        
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureTitle}>PDF → Clear{'\n'}Insights</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureTitle}>Track trends{'\n'}over time</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Not medical advice. Always consult your doctor.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    lineHeight: 38,
    marginBottom: 20,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#a0a0a0',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  primaryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresSection: {
    paddingVertical: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#1a1a1a',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 13,
    color: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
});
