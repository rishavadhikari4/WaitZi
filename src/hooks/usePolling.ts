import { useCallback, useEffect, useRef, useState } from 'react';

export default function usePolling<T>(fetchFn: () => Promise<T>, interval = 10000, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const fetchRef = useRef(fetchFn);

  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchRef.current());
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    void refresh();
    const timer = setInterval(() => void refresh(), interval);
    return () => clearInterval(timer);
  }, [refresh, interval, enabled]);

  return { data, isLoading, error, refresh };
}
