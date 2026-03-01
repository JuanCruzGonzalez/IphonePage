import { useCallback, useState } from 'react';

/**
 * useModal
 * hook para el manejo de modales, con estado de abierto/cerrado y funciones para abrir, cerrar y alternar.
 */
export function useModal(initial = false) {
  const [isOpen, setIsOpen] = useState<boolean>(initial);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  return { isOpen, open, close, toggle, setIsOpen } as const;
}

export default useModal;
