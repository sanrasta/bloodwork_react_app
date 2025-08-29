import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { BloodworkResult } from '../types/types';

interface BloodworkListItemProps {
  result: BloodworkResult;
  onPress?: () => void;
}

export default function BloodworkListItem({ result, onPress }: BloodworkListItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: BloodworkResult['status']) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'reviewed':
        return '#3B82F6';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getCriticalCount = () => {
    return result.results.filter(r => r.status === 'critical').length;
  };

  const getAbnormalCount = () => {
    return result.results.filter(r => r.status === 'high' || r.status === 'low').length;
  };

  const criticalCount = getCriticalCount();
  const abnormalCount = getAbnormalCount();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.testType}>{result.testType}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) }]}>
          <Text style={styles.statusText}>{result.status}</Text>
        </View>
      </View>
      
      <Text style={styles.date}>{formatDate(result.testDate)}</Text>
      
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsCount}>
          {result.results.length} test{result.results.length !== 1 ? 's' : ''}
        </Text>
        
        {criticalCount > 0 && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>{criticalCount} critical</Text>
          </View>
        )}
        
        {abnormalCount > 0 && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>{abnormalCount} abnormal</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  testType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resultsCount: {
    fontSize: 14,
    color: '#374151',
    marginRight: 12,
  },
  alertBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#DC2626',
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D97706',
  },
});
