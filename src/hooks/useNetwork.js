// src/hooks/useNetwork.js
// Monitors internet connectivity.
// Used to decide when to trigger sync.

import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export const useNetwork = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking,  setIsChecking]  = useState(true);

  const checkConnection = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(
        state.isConnected === true && state.isInternetReachable === true
      );
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkConnection();

    // Then check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isConnected, isChecking, checkConnection };
};