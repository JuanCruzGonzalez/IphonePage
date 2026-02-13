import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useAsync
 * Lightweight helper to execute async functions with loading/error/value state and
 * automatic safety against setting state on unmounted components.
 *
 * Example:
 * const { execute, loading, error, value } = useAsync<MyType>();
 * const result = await execute(() => fetchSomething());
 */
export function useAsync<T>() {
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [value, setValue] = useState<T | null>(null);

    const execute = useCallback(async (fn: () => Promise<T>) => {
        setError(null);
        try {
            const res = await fn();
            // If the component unmounted while awaiting, just return the result.
            if (!mountedRef.current) return res;
            // Only store a value when the function returns something (avoid storing `undefined` for fire-and-forget tasks)
            if (typeof res !== 'undefined') setValue(res);
            setLoading(false);
            return res;
        } catch (err) {
            if (!mountedRef.current) throw err;
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            setLoading(false);
            throw err;
        }
    }, []);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setValue(null);
    }, []);

    return { execute, loading, error, value, reset } as const;
}

export default useAsync;
