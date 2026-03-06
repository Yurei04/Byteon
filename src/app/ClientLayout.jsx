"use client"
import { DatabaseErrorBlocker } from "@/components/errorHandling/database-error-blocker";
import { MaintenanceBlocker } from "@/components/errorHandling/maintenance-blocker";
import { OfflineBlocker } from "@/components/errorHandling/offline-blocker";
import { ServerErrorBlocker } from "@/components/errorHandling/server-error-blocker";
import { DbErrorBoundary } from "@/components/errorHandling/error-boundary-db-blocker";
import { ThemeProvider } from "@/components/theme-provider";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export default function ClientLayout({ children }) {
  const [dbError, setDbError] = useState(false);

  const checkDbConnection = async () => {
    if (!supabase) {
      setDbError(true);
      return false;
    }
    try {
      const [{ error: orgError }, { error: userError }] = await Promise.all([
        supabase.from('organizations').select('count').limit(1),
        supabase.from('users').select('count').limit(1),
      ]);

      if (orgError || userError) {
        console.error('Supabase error:', orgError || userError);
        setDbError(true);
        return false;
      }

      setDbError(false);
      return true;
    } catch (err) {
      console.error('Connection error:', err);
      setDbError(true);
      return false;
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkDbConnection();
  }, []);

  const handleRetry = async () => {
    await checkDbConnection();
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <DbErrorBoundary>
        {children}
      </DbErrorBoundary>
      
      <OfflineBlocker />
      <DatabaseErrorBlocker 
        isError={dbError}
        onRetry={handleRetry}
      />
      <ServerErrorBlocker isError={false} />
      <MaintenanceBlocker isActive={false} />
    </ThemeProvider>
  );
}