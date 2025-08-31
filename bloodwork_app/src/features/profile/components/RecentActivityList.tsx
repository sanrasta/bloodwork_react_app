import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type ActivityItem = {
  id: string;
  date: string;
  testsCount: number;
  normalCount: number;
  abnormalCount: number;
  criticalCount: number;
  status: 'good' | 'attention' | 'critical';
};

export default function RecentActivityList() {
  // Mock data - will be replaced with real data from bloodwork store
  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      date: 'Dec 15, 2024',
      testsCount: 12,
      normalCount: 10,
      abnormalCount: 2,
      criticalCount: 0,
      status: 'attention',
    },
    {
      id: '2',
      date: 'Nov 20, 2024',
      testsCount: 8,
      normalCount: 8,
      abnormalCount: 0,
      criticalCount: 0,
      status: 'good',
    },
    {
      id: '3',
      date: 'Oct 18, 2024',
      testsCount: 15,
      normalCount: 12,
      abnormalCount: 2,
      criticalCount: 1,
      status: 'critical',
    },
  ];

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'good': return '#1E40AF';
      case 'attention': return '#F59E0B';
      case 'critical': return '#DC2626';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status: ActivityItem['status']) => {
    switch (status) {
      case 'good': return 'All Normal';
      case 'attention': return 'Needs Attention';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Activity</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityList}>
        {recentActivity.map((item) => (
          <TouchableOpacity key={item.id} style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Text style={styles.activityDate}>{item.date}</Text>
              <Text style={styles.activityTests}>{item.testsCount} tests analyzed</Text>
            </View>
            
            <View style={styles.activityStats}>
              <View style={styles.miniStats}>
                <Text style={styles.miniStatText}>{item.normalCount}N</Text>
                {item.abnormalCount > 0 && (
                  <Text style={[styles.miniStatText, { color: '#F59E0B' }]}>
                    {item.abnormalCount}A
                  </Text>
                )}
                {item.criticalCount > 0 && (
                  <Text style={[styles.miniStatText, { color: '#DC2626' }]}>
                    {item.criticalCount}C
                  </Text>
                )}
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E5E5E5',
  },
  viewAllText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  activityInfo: {
    flex: 1,
  },
  activityDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E5',
    marginBottom: 4,
  },
  activityTests: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityStats: {
    alignItems: 'flex-end',
    gap: 6,
  },
  miniStats: {
    flexDirection: 'row',
    gap: 8,
  },
  miniStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
});
