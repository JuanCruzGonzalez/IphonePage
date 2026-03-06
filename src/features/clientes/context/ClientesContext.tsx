import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Cliente } from '../../../core/types';
import { queryKeys } from '../../../lib/queryClient';
import { getClientes, buscarClientes, toggleEstadoCliente } from '../services/clienteService';
import { useModal } from '../../../shared/hooks/useModal';

// =============================================
// TIPOS
// =============================================

interface ClientesContextValue {
  clientes: Cliente[];
  isLoading: boolean;
  clienteSeleccionado: Cliente | null;
  modalDetalle: { isOpen: boolean; open: () => void; close: () => void };

  cargarClientes: (force?: boolean) => Promise<void>;
  handleBuscar: (query: string) => Promise<void>;
  handleVerCliente: (cliente: Cliente) => void;
  handleToggleEstado: (cliente: Cliente) => void;
}

interface ClientesProviderProps {
  children: ReactNode;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    type?: 'danger' | 'warning' | 'info',
  ) => void;
}

// =============================================
// CONTEXTO
// =============================================

const ClientesContext = createContext<ClientesContextValue | undefined>(undefined);

export function useClientes(): ClientesContextValue {
  const ctx = useContext(ClientesContext);
  if (!ctx) throw new Error('useClientes debe usarse dentro de ClientesProvider');
  return ctx;
}

// =============================================
// PROVIDER
// =============================================

export const ClientesProvider: React.FC<ClientesProviderProps> = ({
  children,
  showSuccess,
  showError,
  showConfirm,
}) => {
  const queryClient = useQueryClient();
  const [clientesBusqueda, setClientesBusqueda] = useState<Cliente[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const modalDetalle = useModal(false);

  const {
    data: clientesBase = [],
    isLoading: isLoadingClientes,
    isFetching: isFetchingClientes,
    refetch,
  } = useQuery({
    queryKey: queryKeys.clientes,
    queryFn: getClientes,
    staleTime: 1000 * 60 * 5,
  });

  const cargarClientes = useCallback(async (force = false) => {
    setClientesBusqueda(null);
    if (force) {
      await refetch();
    }
  }, [refetch]);

  const handleBuscar = useCallback(
    async (query: string) => {
      const q = query.trim();
      if (!q) {
        setClientesBusqueda(null);
        return;
      }

      setIsSearching(true);
      try {
        const data = await buscarClientes(q);
        setClientesBusqueda(data);
      } catch {
        showError('Error al buscar clientes');
      } finally {
        setIsSearching(false);
      }
    },
    [showError],
  );

  const handleVerCliente = useCallback(
    (cliente: Cliente) => {
      setClienteSeleccionado(cliente);
      modalDetalle.open();
    },
    [modalDetalle],
  );

  const handleToggleEstado = useCallback(
    (cliente: Cliente) => {
      const nuevoEstado = !cliente.estado;
      showConfirm(
        nuevoEstado ? 'Activar cliente' : 'Desactivar cliente',
        `¿Seguro que querés ${nuevoEstado ? 'activar' : 'desactivar'} a ${cliente.nombre ?? cliente.email}?`,
        async () => {
          try {
            await toggleEstadoCliente(cliente.id_cliente, nuevoEstado);

            queryClient.setQueryData<Cliente[]>(queryKeys.clientes, (prev = []) =>
              prev.map((c) =>
                c.id_cliente === cliente.id_cliente ? { ...c, estado: nuevoEstado } : c,
              ),
            );

            setClientesBusqueda((prev) =>
              prev
                ? prev.map((c) =>
                    c.id_cliente === cliente.id_cliente ? { ...c, estado: nuevoEstado } : c,
                  )
                : prev,
            );

            showSuccess(`Cliente ${nuevoEstado ? 'activado' : 'desactivado'}`);
            // Actualizar cliente seleccionado si está abierto en detalle
            setClienteSeleccionado((prev) =>
              prev?.id_cliente === cliente.id_cliente ? { ...prev, estado: nuevoEstado } : prev,
            );
          } catch {
            showError('Error al cambiar el estado del cliente');
          }
        },
        nuevoEstado ? 'info' : 'warning',
      );
    },
    [showConfirm, showSuccess, showError, queryClient],
  );

  const clientes = clientesBusqueda ?? clientesBase;
  const isLoading = isLoadingClientes || isFetchingClientes || isSearching;

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        isLoading,
        clienteSeleccionado,
        modalDetalle,
        cargarClientes,
        handleBuscar,
        handleVerCliente,
        handleToggleEstado,
      }}
    >
      {children}
    </ClientesContext.Provider>
  );
};
