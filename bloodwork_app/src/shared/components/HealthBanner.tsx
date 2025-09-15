import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApiHealth } from '../hooks/use-api-health';

type Props = {
  onRetry?: () => void;
  onlyWhenUnhealthy?: boolean;
};

export default function HealthBanner({ onRetry, onlyWhenUnhealthy = false }: Props) {
  const { isLoading, isError, isHealthy, baseUrl, refetch } = useApiHealth(15000);

  const statusText = isLoading ? 'Checking API…' : isHealthy ? 'API reachable' : 'Cannot reach API';
  const statusColor = isHealthy ? '#065f46' : isLoading ? '#92400e' : '#991b1b';
  const bgColor = isHealthy ? '#d1fae5' : isLoading ? '#fef3c7' : '#fee2e2';

  const handleRetry = () => {
    refetch();
    onRetry?.();
  };

  // Hide entirely if requested to show only when unhealthy
  if (onlyWhenUnhealthy && (isLoading || isHealthy)) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor: statusColor }]}>
      <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
      <Text style={styles.url} numberOfLines={1}>Target: {baseUrl}</Text>
      {(isError || !isHealthy) && (
        <TouchableOpacity style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  status: {
    fontWeight: '600',
    marginBottom: 4,
  },
  url: {
    color: '#374151',
    fontSize: 12,
  },
  button: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});


