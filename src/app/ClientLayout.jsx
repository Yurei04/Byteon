"use client"
import { DatabaseErrorBlocker } from "@/components/errorHandling/database-error-blocker";
import { MaintenanceBlocker } from "@/components/errorHandling/maintenance-blocker";
import { OfflineBlocker } from "@/components/errorHandling/offline-blocker";
import { ServerErrorBlocker } from "@/components/errorHandling/server-error-blocker";
import { ThemeProvider } from "@/components/theme-provider";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export default function ClientLayout({ children }) {
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { error } = await supabase
          .from('organizations')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('Supabase error:', error);
          setDbError(true);
        } else {
          setDbError(false);
        }
      } catch (err) {
        console.error('Connection error:', err);
        setDbError(true);
      }
    };

    checkSupabase();
  }, []);

  const handleRetry = async () => {
    try {
      const { error } = await supabase
        .from('organization')
        .select('count')
        .limit(1);
      
      if (!error) {
        setDbError(false);
      }
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      
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