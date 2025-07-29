'use client';
import { useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export default function useIdleLogout() {
  const { signOut } = useAuthenticator();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(signOut, IDLE_TIMEOUT);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [signOut]);
}