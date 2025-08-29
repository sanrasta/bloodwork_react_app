import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useGetBloodworkResults } from '../hooks/use-bloodwork-queries';
import { useBloodworkStore } from '../store/use-bloodwork-store';
import BloodworkListItem from './bloodwork-list-item';
import BloodworkListSkeleton from './bloodwork-list-skeleton';
import type { BloodworkResult } from '../types/types';

interface BloodworkListProps {
  onSelectResult?: (result: BloodworkResult) => void;
}

export default function BloodworkList({ onSelectResult }: BloodworkListProps) {
  const filters = useBloodworkStore((state) => state.filters);
  
  // 1. Fetch Data
  const { data: results, isLoading, isError, error } = useGetBloodworkResults(filters);

  // 2. Handle Loading State
  if (isLoading) {
    return <BloodworkListSkeleton />;
  }

  // 3. Handle Error State
  if (isError || !results) {
    if (error) {
      console.error('Error fetching bloodwork results:', error);
    }
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load results</Text>
        <Text style={styles.errorMessage}>
          {error?.message || 'Something went wrong. Please try again.'}
        </Text>
      </View>
    );
  }

  // 4. Render Success State
  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptyMessage}>
          Try adjusting your filters or check back later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BloodworkListItem
            result={item}
            onPress={() => onSelectResult?.(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
