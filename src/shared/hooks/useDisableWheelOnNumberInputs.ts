import { useEffect } from 'react';

/**
 * Hook global para deshabilitar que la rueda del mouse cambie inputs de tipo number
 * - Añade un listener 'wheel' en window y hace preventDefault cuando el elemento activo es
 *   un input y su type es 'number'.
 * - El listener se añade con { passive: false } para permitir preventDefault().
 */
export function useDisableWheelOnNumberInputs() {
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      try {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return;
        if (el.tagName === 'INPUT') {
          const input = el as HTMLInputElement;

          if (input.type === 'number') {
            e.preventDefault();
          }
        }
      } catch (err) {
        console.error('useDisableWheelOnNumberInputs error:', err);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);
}
