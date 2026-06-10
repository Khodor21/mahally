'use client';

import { useEffect } from 'react';
import { getOrCreateVisitorId } from '@/lib/visitorId';

const SESSION_TRACKED_KEY = 'mahally_session_tracked';

export function useTrackVisitor(storeId: string) {
  useEffect(() => {
    if (!storeId || typeof window === 'undefined') return;

    // Check if already tracked in this session
    const sessionId = sessionStorage.getItem(SESSION_TRACKED_KEY);
    const currentSessionId = getOrCreateVisitorId();

    if (sessionId === currentSessionId) {
      return; // Already tracked this session
    }

    const trackVisitor = async () => {
      try {
        await fetch('/api/track-visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId,
            visitorId: currentSessionId,
          }),
        });

        // Mark as tracked for this session
        sessionStorage.setItem(SESSION_TRACKED_KEY, currentSessionId);
      } catch (error) {
        console.error('Failed to track visitor:', error);
      }
    };

    trackVisitor();
  }, [storeId]);
}