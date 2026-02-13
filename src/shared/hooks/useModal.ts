import { useCallback, useState } from 'react';

/**
 * useModal
 * Small convenience hook to manage boolean modal open/close state.
 */
export function useModal(initial = false) {
  const [isOpen, setIsOpen] = useState<boolean>(initial);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  return { isOpen, open, close, toggle, setIsOpen } as const;
}

export default useModal;
