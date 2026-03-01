import { useEffect, useState } from 'react';

/**
 * useDebounce
 * Retorna un valor rebotado que se actualiza después de `delay` ms una vez que `value` deja de cambiar.
 * Útil para rebotear entrada del usuario (ej: búsqueda) antes de activar solicitudes.
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
