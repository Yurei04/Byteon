"use client"
import { useState, useEffect } from "react";
import { BlockerLayout } from "./blocker-layout";

export const DatabaseErrorBlocker = ({ isError, onRetry }) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    if (onRetry) await onRetry();
    setIsChecking(false);
  };

  if (!isError) return null;

  return (
    <BlockerLayout
      icon={Database}
      title="Database Connection Failed"
      message="We're unable to connect to the database. This may be a temporary issue. Please try again in a moment."
      isChecking={isChecking}
      onRetry={handleRetry}
    />
  );
};
