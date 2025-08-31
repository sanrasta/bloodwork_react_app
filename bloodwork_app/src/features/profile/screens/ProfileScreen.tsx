import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IdentityCard from '@/src/features/profile/components/IdentityCard';
import RecentActivityList from '@/src/features/profile/components/RecentActivityList';
import QuickActions from '@/src/features/profile/components/QuickActions';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* User Identity & Stats */}
        <IdentityCard />
        
        {/* Recent Activity */}
        <RecentActivityList />
        
        {/* Quick Actions */}
        <QuickActions />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 20,
  },
});
