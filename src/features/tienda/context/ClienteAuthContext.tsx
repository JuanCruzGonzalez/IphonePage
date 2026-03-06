/**
 * ClienteAuthContext
 *
 * Provee el estado de autenticación del cliente de la tienda.
 * Se apoya en AuthContext (que ya escucha supabase.auth) para
 * evitar tener dos listeners de sesión simultáneos.
 *
 * Jerarquía en el árbol:
 *   AuthProvider          ← singleton, raíz
 *     ClienteAuthProvider ← este contexto, envuelve la tienda
 *       CarritoProvider
 *         TiendaLayout
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { Cliente, ClienteInput } from '../../../core/types';
import {
  signInCliente,
  signUpCliente,
  signOutCliente,
  getClientePerfil,
  updateClientePerfil,
} from '../services/clienteAuthService';

// =============================================
// TIPOS
// =============================================

interface ClienteAuthContextValue {
  /** Perfil de la tabla `clientes` (null si no está autenticado como cliente). */
  clientePerfil: Cliente | null;
  /** True mientras se carga el perfil inicial. */
  isLoading: boolean;
  /** El usuario tiene una cuenta de cliente activa en sesión. */
  isAuthenticated: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    telefono?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  /** Vuelve a leer el perfil desde la DB (útil después de editar datos). */
  refreshPerfil: () => Promise<void>;
  /** Actualiza datos del perfil y refresca desde DB. */
  updatePerfil: (input: ClienteInput) => Promise<void>;
}

// =============================================
// CONTEXTO
// =============================================

const ClienteAuthContext = createContext<ClienteAuthContextValue | undefined>(
  undefined,
);

// =============================================
// HOOK
// =============================================

export function useClienteAuth(): ClienteAuthContextValue {
  const ctx = useContext(ClienteAuthContext);
  if (!ctx) {
    throw new Error(
      'useClienteAuth debe usarse dentro de ClienteAuthProvider',
    );
  }
  return ctx;
}

// =============================================
// PROVIDER
// =============================================

export const ClienteAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth(); // sesión supabase ya resuelta por AuthContext
  const [clientePerfil, setClientePerfil] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cada vez que cambia el usuario (login / logout) recargamos el perfil de cliente
  useEffect(() => {
    let cancelled = false;

    const loadPerfil = async () => {
      setIsLoading(true);

      if (!user) {
        if (!cancelled) {
          setClientePerfil(null);
          setIsLoading(false);
        }
        return;
      }

      // Solo usuarios con role = 'cliente' en app_metadata tienen perfil en clientes.
      // Fallback: intentar igualmente (el trigger puede no haber seteado app_metadata aún).
      const role = (user.app_metadata as Record<string, string>)?.role;
      if (role && role !== 'cliente') {
        // Admin / empleado: no es un cliente de la tienda
        if (!cancelled) {
          setClientePerfil(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const perfil = await getClientePerfil(user.id);
        if (!cancelled) setClientePerfil(perfil);
      } catch {
        if (!cancelled) setClientePerfil(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPerfil();
    return () => { cancelled = true; };
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInCliente(email, password);
    // El useEffect de arriba se re-ejecuta al cambiar `user` vía AuthContext
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      nombre: string,
      apellido: string,
      telefono?: string,
    ) => {
      await signUpCliente(email, password, nombre, apellido, telefono);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await signOutCliente();
    setClientePerfil(null);
  }, []);

  const refreshPerfil = useCallback(async () => {
    if (!user) return;
    const perfil = await getClientePerfil(user.id);
    setClientePerfil(perfil);
  }, [user]);

  const updatePerfil = useCallback(
    async (input: ClienteInput) => {
      if (!user) return;
      const updated = await updateClientePerfil(user.id, input);
      setClientePerfil(updated);
    },
    [user],
  );

  const isAuthenticated = !!clientePerfil;

  return (
    <ClienteAuthContext.Provider
      value={{
        clientePerfil,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        refreshPerfil,
        updatePerfil,
      }}
    >
      {children}
    </ClienteAuthContext.Provider>
  );
};
