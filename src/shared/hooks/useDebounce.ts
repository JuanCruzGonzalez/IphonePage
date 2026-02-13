import { useEffect, useState } from 'react';

/**
 * useDebounce
 * Returns a debounced value that updates after `delay` ms once `value` stops changing.
 * Useful for debouncing user input (e.g. search) before triggering requests.
 */
export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
