'use client';

import React from 'react';
import { OfflineStatus } from '@/components/pwa/offline-status';
import { UpdatePrompt } from '@/components/pwa/update-prompt';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  return (
    <>
      {children}
      <OfflineStatus />
      <UpdatePrompt />
    </>
  );
}