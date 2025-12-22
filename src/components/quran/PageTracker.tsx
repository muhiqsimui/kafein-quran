'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface PageTrackerProps {
  pageId: number;
}

export function PageTracker({ pageId }: PageTrackerProps) {
  const { setLastRead } = useSettingsStore();

  useEffect(() => {
    setLastRead({ pageId });
  }, [pageId, setLastRead]);

  return null;
}
