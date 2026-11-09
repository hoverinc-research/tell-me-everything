import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Whether the device currently has a network connection. Treats the initial
 * "unknown" state as online so we don't block the UI on app start.
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  return isOnline;
}
