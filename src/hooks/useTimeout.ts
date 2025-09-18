import { useEffect, useRef } from 'react';

export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);

    return () => clearTimeout(id);
  }, [delay]);
};

export const useRetryWithBackoff = (
  operation: () => Promise<any>,
  maxRetries: number = 3,
  initialDelay: number = 1000
) => {
  const retryCount = useRef(0);
  const currentDelay = useRef(initialDelay);

  const retry = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const result = await operation();
      retryCount.current = 0;
      currentDelay.current = initialDelay;
      return { success: true, data: result };
    } catch (error: any) {
      retryCount.current++;
      
      if (retryCount.current >= maxRetries) {
        return { success: false, error: `Max retries (${maxRetries}) exceeded: ${error.message}` };
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, currentDelay.current));
      currentDelay.current *= 2;

      // Recursive retry
      return retry();
    }
  };

  const reset = () => {
    retryCount.current = 0;
    currentDelay.current = initialDelay;
  };

  return { retry, reset, retryCount: retryCount.current };
};