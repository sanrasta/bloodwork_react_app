/**
 * React Native Integration for React Query
 * 
 * Wires React Native's AppState and Network connectivity to React Query's
 * focus manager and online manager for optimal mobile behavior.
 * 
 * Benefits:
 * - Stop polling/refetching when app is backgrounded (battery optimization)
 * - Resume queries when app comes to foreground
 * - Pause queries during network outages
 * - Resume when connection is restored
 * - Proper mobile app lifecycle handling
 */

import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { reactQueryLogger } from '../shared/utils/logger';

// Guard to prevent multiple initializations
let isInitialized = false;
let cleanupFunctions: (() => void)[] = [];

/**
 * Initialize React Native integration with React Query
 * Call this once at app startup (in App.tsx or _layout.tsx)
 * 
 * Features:
 * - Initialization guard prevents duplicate setup
 * - Cleanup functions tracked for proper teardown
 * - Idempotent - safe to call multiple times
 */
export const initializeReactQueryRNIntegration = () => {
  if (isInitialized) {
    reactQueryLogger.cache('React Query RN integration already initialized, skipping');
    return;
  }
  
  reactQueryLogger.cache('Initializing React Query RN integration...');
  
  // Wire React Native AppState to React Query focus manager
  const appStateCleanup = setupAppStateFocusManager();
  cleanupFunctions.push(appStateCleanup);
  
  // Wire React Native NetInfo to React Query online manager
  const networkCleanup = setupNetworkOnlineManager();
  cleanupFunctions.push(networkCleanup);
  
  isInitialized = true;
  reactQueryLogger.cache('React Query RN integration initialized successfully');
};

/**
 * Cleanup React Native integration
 * Call this when shutting down the app (if needed)
 */
export const cleanupReactQueryRNIntegration = () => {
  if (!isInitialized) {
    return;
  }
  
  reactQueryLogger.cache('Cleaning up React Query RN integration...');
  
  // Call all cleanup functions
  cleanupFunctions.forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      reactQueryLogger.error('Error during RN integration cleanup:', error);
    }
  });
  
  // Reset state
  cleanupFunctions = [];
  isInitialized = false;
  
  reactQueryLogger.cache('React Query RN integration cleaned up');
};

/**
 * Setup AppState integration for focus management
 * 
 * Maps React Native app states to React Query focus states:
 * - 'active' → focused (queries resume)
 * - 'background'/'inactive' → unfocused (queries pause)
 * 
 * @returns cleanup function to remove event listeners
 */
const setupAppStateFocusManager = (): (() => void) => {
  focusManager.setEventListener((handleFocus) => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const isFocused = nextAppState === 'active';
      
      reactQueryLogger.cache(
        `App state changed to: ${nextAppState}, focus: ${isFocused ? 'focused' : 'unfocused'}`
      );
      
      handleFocus(isFocused);
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Return cleanup function
    return () => {
      subscription?.remove();
      reactQueryLogger.cache('AppState focus manager subscription cleanup');
    };
  });
  
  // Return a cleanup function that resets the event listener
  return () => {
    focusManager.setEventListener(() => () => {});
    reactQueryLogger.cache('AppState focus manager reset');
  };
};

/**
 * Setup NetInfo integration for online management
 * 
 * Maps network connectivity to React Query online state:
 * - Connected → online (queries resume)
 * - Disconnected → offline (queries pause, will retry when back online)
 * 
 * @returns cleanup function to remove event listeners
 */
const setupNetworkOnlineManager = (): (() => void) => {
  onlineManager.setEventListener((setOnline) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = !!state.isConnected;
      
      reactQueryLogger.cache(
        `Network state changed: ${state.type}, connected: ${isOnline}, details:`,
        state
      );
      
      setOnline(isOnline);
    });

    // Return cleanup function
    return () => {
      unsubscribe();
      reactQueryLogger.cache('NetInfo online manager subscription cleanup');
    };
  });
  
  // Return a cleanup function that resets the event listener
  return () => {
    onlineManager.setEventListener(() => () => {});
    reactQueryLogger.cache('NetInfo online manager reset');
  };
};

/**
 * Get current network info (useful for debugging)
 */
export const getCurrentNetworkInfo = async () => {
  const state = await NetInfo.fetch();
  reactQueryLogger.cache('Current network state:', state);
  return state;
};

/**
 * Get current app state (useful for debugging)
 */
export const getCurrentAppState = () => {
  const currentState = AppState.currentState;
  reactQueryLogger.cache('Current app state:', currentState);
  return currentState;
};
