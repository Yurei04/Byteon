"use client"
import { useState, useEffect } from "react";
import { BlockerLayout } from "./blocker-layout";

export const MaintenanceBlocker = ({ isActive, estimatedTime }) => {
  if (!isActive) return null;

  return (
    <BlockerLayout
      icon={Clock}
      title="Scheduled Maintenance"
      message={`We're currently performing scheduled maintenance to improve your experience. ${estimatedTime ? `Expected completion: ${estimatedTime}` : 'We\'ll be back shortly.'}`}
      showRetry={false}
    />
  );
};