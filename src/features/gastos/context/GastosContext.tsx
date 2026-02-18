import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryClient';
import { Gasto } from '../../../core/types';
import {
  getGastos,
  createGasto,
  updateGasto,
  updateGastoEstado,
} from '../services/gastoService';
import { useModal } from '../../../shared/hooks/useModal';

/** ======================
 * TIPOS E INTERFACES
 * ====================== */

interface GastosContextValue {
  // Estado
  gastos: Gasto[];
  isLoading: boolean;
  gastoToEdit: Gasto | null;

  // Modal
  modalGasto: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };

  // Operaciones
  handleNuevoGasto: () => void;
  handleEditarGasto: (gasto: Gasto) => void;
  handleSubmitGasto: (costo: number, descripcion: string | null) => Promise<void>;
  handleToggleGastoEstado: (id_gasto: number, estadoActual: boolean, descripcion: string | null) => Promise<void>;
}

interface GastosProviderProps {
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

const GastosContext = createContext<GastosContextValue | undefined>(undefined);

export const useGastos = () => {
  const context = useContext(GastosContext);
  if (!context) {
    throw new Error('useGastos debe usarse dentro de GastosProvider');
  }
  return context;
};

/** ======================
 * PROVIDER
 * ====================== */

export const GastosProvider: React.FC<GastosProviderProps> = ({
  children,
  showSuccess,
  showError,
  showConfirm,
}) => {
  const queryClient = useQueryClient();
  const modalGasto = useModal(false);
  const [gastoToEdit, setGastoToEdit] = React.useState<Gasto | null>(null);

  /** ======================
   * QUERIES
   * ====================== */

  const {
    data: gastos = [],
    isLoading,
  } = useQuery({
    queryKey: queryKeys.gastos,
    queryFn: getGastos,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  /** ======================
   * MUTATIONS
   * ====================== */

  const crearGastoMutation = useMutation({
    mutationFn: ({ costo, descripcion }: { costo: number; descripcion: string | null }) =>
      createGasto(costo, descripcion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
      showSuccess('Gasto creado correctamente');
      modalGasto.close();
      setGastoToEdit(null);
    },
    onError: () => {
      showError('Error al crear el gasto');
    },
  });

  const actualizarGastoMutation = useMutation({
    mutationFn: ({ id_gasto, costo, descripcion }: { id_gasto: number; costo: number; descripcion: string | null }) =>
      updateGasto(id_gasto, { costo, descripcion }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
      showSuccess('Gasto actualizado correctamente');
      modalGasto.close();
      setGastoToEdit(null);
    },
    onError: () => {
      showError('Error al actualizar el gasto');
    },
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id_gasto, nuevoEstado }: { id_gasto: number; nuevoEstado: boolean }) =>
      updateGastoEstado(id_gasto, nuevoEstado),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gastos });
      showSuccess(`Gasto ${variables.nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
    },
    onError: () => {
      showError('Error al cambiar el estado del gasto');
    },
  });

  /** ======================
   * HANDLERS
   * ====================== */

  const handleNuevoGasto = () => {
    setGastoToEdit(null);
    modalGasto.open();
  };

  const handleEditarGasto = (gasto: Gasto) => {
    setGastoToEdit(gasto);
    modalGasto.open();
  };

  const handleSubmitGasto = async (costo: number, descripcion: string | null) => {
    if (gastoToEdit) {
      await actualizarGastoMutation.mutateAsync({
        id_gasto: gastoToEdit.id_gasto,
        costo,
        descripcion,
      });
    } else {
      await crearGastoMutation.mutateAsync({ costo, descripcion });
    }
  };

  const handleToggleGastoEstado = async (
    id_gasto: number,
    estadoActual: boolean,
    descripcion: string | null
  ) => {
    const mensaje = estadoActual ? 'desactivar' : 'activar';
    const label = descripcion || `Gasto #${id_gasto}`;

    showConfirm(
      `¿${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)} gasto?`,
      `¿Estás seguro de ${mensaje} "${label}"?`,
      async () => {
        await toggleEstadoMutation.mutateAsync({
          id_gasto,
          nuevoEstado: !estadoActual,
        });
      },
      estadoActual ? 'danger' : 'info'
    );
  };

  /** ======================
   * VALOR DEL CONTEXTO
   * ====================== */

  const value: GastosContextValue = {
    gastos,
    isLoading,
    gastoToEdit,
    modalGasto,
    handleNuevoGasto,
    handleEditarGasto,
    handleSubmitGasto,
    handleToggleGastoEstado,
  };

  return <GastosContext.Provider value={value}>{children}</GastosContext.Provider>;
};
