"use client"
import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Database, ServerCrash, Shield, AlertTriangle, Clock } from 'lucide-react';
import { BlockerLayout } from './blocker-layout';

export const OfflineBlocker = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      if (response.ok) setIsOffline(false);
    } catch (error) {
      setIsOffline(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOffline) return null;

  return (
    <BlockerLayout
      icon={WifiOff}
      title="No Internet Connection"
      message="Please check your internet connection and try again. The app requires an active connection to function."
      isChecking={isChecking}
      onRetry={handleRetry}
    />
  );
};
