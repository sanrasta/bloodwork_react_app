import React from 'react';
import { View, StyleSheet } from 'react-native';

// Simple skeleton component for loading states
const SkeletonBox = ({ width, height }: { width: number | string; height: number }) => (
  <View style={[styles.skeleton, { width, height }]} />
);

export default function BloodworkListSkeleton() {
  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.itemContainer}>
          <View style={styles.header}>
            <SkeletonBox width="60%" height={20} />
            <SkeletonBox width={60} height={24} />
          </View>
          <SkeletonBox width="40%" height={16} />
          <View style={styles.footer}>
            <SkeletonBox width="30%" height={14} />
            <SkeletonBox width={80} height={20} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  itemContainer: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  skeleton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
});
