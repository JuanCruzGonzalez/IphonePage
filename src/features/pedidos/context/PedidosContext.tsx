import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryClient';
import { PedidoConDetalles, EstadoPedido } from '../../../core/types';
import {
  getPedidos,
  buscarPedidos,
  updateEstadoPedido,
  getContadorPedidosPendientes,
  autoCancelarPedidosVencidos,
  getMetricasPedidosHoy,
} from '../services/pedidoService';
import { useModal } from '../../../shared/hooks/useModal';

/** ======================
 * TIPOS E INTERFACES
 * ====================== */

interface PedidosContextValue {
  // Estado
  pedidos: PedidoConDetalles[];
  isLoading: boolean;
  pedidoSeleccionado: PedidoConDetalles | null;
  contadorPendientes: number;
  metricasHoy: {
    total: number;
    entregados: number;
    cancelados: number;
    pendientes: number;
    totalVentas: number;
    tasaConversion: number;
  } | undefined;

  // Modal
  modalDetallePedido: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };

  // Operaciones
  handleVerPedido: (pedido: PedidoConDetalles) => void;
  handleCambiarEstado: (id_pedido: number, nuevoEstado: EstadoPedido) => Promise<void>;
  handleBuscarPedidos: (query: string) => Promise<PedidoConDetalles[]>;
  handleAutoCancelar: () => Promise<void>;
  refetchPedidos: () => void;
}

interface PedidosProviderProps {
  children: ReactNode;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    type?: 'danger' | 'warning' | 'info'
  ) => void;
}

/** ======================
 * CONTEXTO
 * ====================== */

const PedidosContext = createContext<PedidosContextValue | undefined>(undefined);

export const usePedidos = () => {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidos debe usarse dentro de PedidosProvider');
  }
  return context;
};

/** ======================
 * PROVIDER
 * ====================== */

export const PedidosProvider: React.FC<PedidosProviderProps> = ({
  children,
  showSuccess,
  showError,
  showConfirm,
}) => {
  const queryClient = useQueryClient();
  const modalDetallePedido = useModal(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = React.useState<PedidoConDetalles | null>(null);

  /** ======================
   * QUERIES
   * ====================== */

  const {
    data: pedidos = [],
    isLoading,
    refetch: refetchPedidos,
  } = useQuery({
    queryKey: queryKeys.pedidos,
    queryFn: getPedidos,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Actualizar cada minuto automáticamente
    refetchOnMount: 'always', // Siempre refetch al montar para capturar pedidos nuevos
  });

  const { data: contadorPendientes = 0 } = useQuery({
    queryKey: queryKeys.pedidosPendientes,
    queryFn: getContadorPedidosPendientes,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Actualizar cada minuto
  });

  const { data: metricasHoy } = useQuery({
    queryKey: queryKeys.pedidosMetricas,
    queryFn: getMetricasPedidosHoy,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  /** ======================
   * MUTATIONS
   * ====================== */

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id_pedido, nuevoEstado }: { id_pedido: number; nuevoEstado: EstadoPedido }) =>
      updateEstadoPedido(id_pedido, nuevoEstado),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidos });
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidosPendientes });
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidosMetricas });
      queryClient.invalidateQueries({ queryKey: queryKeys.ventas }); // Si se creó venta
      
      const estadoTexto = {
        RECIBIDO: 'recibido',
        ACEPTADO: 'aceptado',
        ENTREGADO: 'entregado',
        CANCELADO: 'cancelado',
      }[variables.nuevoEstado];
      
      showSuccess(`Pedido marcado como ${estadoTexto}`);
      modalDetallePedido.close();
    },
    onError: () => {
      showError('Error al cambiar el estado del pedido');
    },
  });

  const autoCancelarMutation = useMutation({
    mutationFn: autoCancelarPedidosVencidos,
    onSuccess: (cantidad) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidos });
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidosPendientes });
      
      if (cantidad > 0) {
        showSuccess(`Se cancelaron ${cantidad} pedido(s) vencido(s)`);
      } else {
        showSuccess('No hay pedidos vencidos');
      }
    },
    onError: () => {
      showError('Error al auto-cancelar pedidos');
    },
  });

  /** ======================
   * HANDLERS
   * ====================== */

  const handleVerPedido = (pedido: PedidoConDetalles) => {
    setPedidoSeleccionado(pedido);
    modalDetallePedido.open();
  };

  const handleCambiarEstado = async (id_pedido: number, nuevoEstado: EstadoPedido) => {
    const pedido = pedidos.find(p => p.id_pedido === id_pedido);
    if (!pedido) return;

    // Validar transiciones de estado
    const transicionesValidas: Record<EstadoPedido, EstadoPedido[]> = {
      RECIBIDO: ['ACEPTADO', 'CANCELADO'],
      ACEPTADO: ['ENTREGADO', 'CANCELADO'],
      ENTREGADO: [], // Estado final
      CANCELADO: [], // Estado final
    };

    if (!transicionesValidas[pedido.estado].includes(nuevoEstado)) {
      showError('Transición de estado no permitida');
      return;
    }

    // Confirmación para ACEPTAR pedido
    if (nuevoEstado === 'ACEPTADO') {
      showConfirm(
        '¿Aceptar pedido?',
        `¿Confirmar que se acepta el pedido de ${pedido.cliente_nombre}?`,
        async () => {
          await cambiarEstadoMutation.mutateAsync({ id_pedido, nuevoEstado });
        },
        'info'
      );
      return;
    }

    // Confirmación para ENTREGADO
    if (nuevoEstado === 'ENTREGADO') {
      showConfirm(
        '¿Marcar como entregado?',
        'Esto creará automáticamente una venta y descontará el stock. ¿Continuar?',
        async () => {
          await cambiarEstadoMutation.mutateAsync({ id_pedido, nuevoEstado });
        },
        'info'
      );
      return;
    }

    // Confirmación para CANCELADO
    if (nuevoEstado === 'CANCELADO') {
      const mensaje = pedido.id_venta
        ? 'Este pedido tiene una venta asociada que se dará de baja. ¿Continuar?'
        : `¿Confirmar la cancelación del pedido de ${pedido.cliente_nombre}?`;
      
      showConfirm(
        '¿Cancelar pedido?',
        mensaje,
        async () => {
          await cambiarEstadoMutation.mutateAsync({ id_pedido, nuevoEstado });
        },
        'danger'
      );
      return;
    }

    // Fallback - no debería llegar aquí
    await cambiarEstadoMutation.mutateAsync({ id_pedido, nuevoEstado });
  };

  const handleBuscarPedidos = async (query: string): Promise<PedidoConDetalles[]> => {
    if (!query.trim()) return pedidos;
    return await buscarPedidos(query);
  };

  const handleAutoCancelar = async () => {
    showConfirm(
      'Auto-cancelar pedidos vencidos',
      '¿Cancelar todos los pedidos en estado RECIBIDO con más de 24 horas?',
      async () => {
        await autoCancelarMutation.mutateAsync();
      },
      'warning'
    );
  };

  /** ======================
   * VALOR DEL CONTEXTO
   * ====================== */

  const value: PedidosContextValue = {
    pedidos,
    isLoading,
    pedidoSeleccionado,
    contadorPendientes,
    metricasHoy,
    modalDetallePedido,
    handleVerPedido,
    handleCambiarEstado,
    handleBuscarPedidos,
    handleAutoCancelar,
    refetchPedidos,
  };

  return <PedidosContext.Provider value={value}>{children}</PedidosContext.Provider>;
};
