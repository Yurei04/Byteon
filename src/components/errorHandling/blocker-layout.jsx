"use client"
"use client"
import { useState, useEffect } from "react";
import { RefreshCw } from 'lucide-react';

export const BlockerLayout = ({ 
  icon: Icon, 
  title, 
  message, 
  isChecking = false, 
  onRetry,
  buttonText = "Retry Connection",
  showRetry = true 
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-950 via-fuchsia-950 to-black backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/80"></div>
      
      <div className="relative max-w-md w-full mx-4 bg-gradient-to-br from-purple-900/90 to-fuchsia-900/90 backdrop-blur-xl rounded-2xl border border-fuchsia-500/30 shadow-2xl p-8">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 blur-2xl -z-10"></div>
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-fuchsia-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative rounded-full bg-gradient-to-br from-fuchsia-900 to-purple-900 p-6 border border-fuchsia-500/40">
              <Icon className="w-12 h-12 text-fuchsia-400" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-fuchsia-100 mb-3">
            {title}
          </h2>
          
          <p className="text-fuchsia-200/80 mb-6 leading-relaxed">
            {message}
          </p>

          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              disabled={isChecking}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-fuchsia-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : buttonText}
            </button>
          )}
        </div>

        <div className="absolute top-0 left-1/4 w-2 h-2 bg-fuchsia-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};