import { useCallback, useEffect, useState } from 'react';
import { markOnboardingSeen, shouldShowOnboarding } from '@/lib/onboarding';

export function useOnboarding() {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let active = true;
    shouldShowOnboarding().then((value) => {
      if (!active) return;
      setShow(value);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const finish = useCallback(() => {
    setShow(false);
    markOnboardingSeen();
  }, []);

  return { ready, show, finish };
}
