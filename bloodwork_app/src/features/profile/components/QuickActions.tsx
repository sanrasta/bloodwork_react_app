import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type ActionItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
};

export default function QuickActions() {
  const actions: ActionItem[] = [
    {
      id: 'upload',
      title: 'Upload New Analysis',
      subtitle: 'Add your latest bloodwork',
      icon: '📄',
      color: '#DC2626',
      onPress: () => {
        // TODO: Navigate to upload screen
        console.log('Navigate to upload');
      },
    },
    {
      id: 'history',
      title: 'View Full History',
      subtitle: 'See all your analyses',
      icon: '📊',
      color: '#1E40AF',
      onPress: () => {
        // TODO: Navigate to history screen
        console.log('Navigate to history');
      },
    },
    {
      id: 'export',
      title: 'Export Data',
      subtitle: 'Download your health data',
      icon: '💾',
      color: '#059669',
      onPress: () => {
        // TODO: Start export process
        console.log('Start export');
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Manage preferences',
      icon: '⚙️',
      color: '#9CA3AF',
      onPress: () => {
        // TODO: Navigate to settings
        console.log('Navigate to settings');
      },
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity 
            key={action.id} 
            style={styles.actionItem}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
              <Text style={styles.icon}>{action.icon}</Text>
            </View>
            
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            
            <Text style={[styles.arrow, { color: action.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E5E5E5',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E5',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '600',
  },
});
