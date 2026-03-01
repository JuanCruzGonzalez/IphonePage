import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useAsync
 * Helper ligero para ejecutar funciones asíncronas con estados de carga/error/valor y
 * protección automática contra configurar estado en componentes desmontados.
 *
 * Ejemplo:
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
        setLoading(true);
        setError(null);
        try {
            const res = await fn();

            if (!mountedRef.current) return res;

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
