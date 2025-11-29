"use client"
import { useState, useEffect } from "react";
import { BlockerLayout } from "./blocker-layout";

export const ServerErrorBlocker = ({ isError, errorCode, onRetry }) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    if (onRetry) await onRetry();
    setIsChecking(false);
  };

  if (!isError) return null;

  return (
    <BlockerLayout
      icon={ServerCrash}
      title="Server Error"
      message={`The server encountered an error${errorCode ? ` (${errorCode})` : ''}. Our team has been notified. Please try again later.`}
      isChecking={isChecking}
      onRetry={handleRetry}
    />
  );
};
