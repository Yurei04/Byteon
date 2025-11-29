"use client"
import { useState, useEffect } from "react";
import { BlockerLayout } from "./blocker-layout";

export const GenericErrorBlocker = ({ isError, title, message, onRetry }) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    if (onRetry) await onRetry();
    setIsChecking(false);
  };

  if (!isError) return null;

  return (
    <BlockerLayout
      icon={AlertTriangle}
      title={title || "Something Went Wrong"}
      message={message || "An unexpected error occurred. Please try again."}
      isChecking={isChecking}
      onRetry={handleRetry}
    />
  );
};