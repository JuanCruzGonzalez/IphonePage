import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryClient';
import { Categoria } from '../../../core/types';
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  updateCategoriaEstado,
} from '../services/categoriaService';
import { useModal } from '../../../shared/hooks/useModal';

/** ======================
 * TIPOS E INTERFACES
 * ====================== */

interface CategoriasContextValue {
  // Estado
  categorias: Categoria[];
  isLoading: boolean;
  categoriaToEdit: Categoria | null;

  // Modal
  modalCategoria: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };

  // Operaciones
  handleNuevaCategoria: () => void;
  handleEditarCategoria: (categoria: Categoria) => void;
  handleSubmitCategoria: (nombre: string, id_categoria_padre?: number | null) => Promise<void>;
  handleToggleCategoriaEstado: (id_categoria: number, estadoActual: boolean, nombre: string) => Promise<void>;
}

interface CategoriasProviderProps {
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

const CategoriasContext = createContext<CategoriasContextValue | undefined>(undefined);

export const useCategorias = () => {
  const context = useContext(CategoriasContext);
  if (!context) {
    throw new Error('useCategorias debe usarse dentro de CategoriasProvider');
  }
  return context;
};

/** ======================
 * PROVIDER
 * ====================== */

export const CategoriasProvider: React.FC<CategoriasProviderProps> = ({
  children,
  showSuccess,
  showError,
  showConfirm,
}) => {
  const queryClient = useQueryClient();
  const modalCategoria = useModal(false);
  const [categoriaToEdit, setCategoriaToEdit] = React.useState<Categoria | null>(null);

  /** ======================
   * QUERIES
   * ====================== */

  const {
    data: categorias = [],
    isLoading,
  } = useQuery({
    queryKey: queryKeys.categorias,
    queryFn: getCategorias,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  /** ======================
   * MUTATIONS
   * ====================== */

  const crearCategoriaMutation = useMutation({
    mutationFn: ({ nombre, id_categoria_padre }: { nombre: string; id_categoria_padre?: number | null }) =>
      createCategoria(nombre, id_categoria_padre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      showSuccess('Categoría creada correctamente');
      modalCategoria.close();
      setCategoriaToEdit(null);
    },
    onError: () => {
      showError('Error al crear la categoría');
    },
  });

  const actualizarCategoriaMutation = useMutation({
    mutationFn: ({ id_categoria, nombre, id_categoria_padre }: { id_categoria: number; nombre: string; id_categoria_padre?: number | null }) =>
      updateCategoria(id_categoria, { nombre, id_categoria_padre }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      showSuccess('Categoría actualizada correctamente');
      modalCategoria.close();
      setCategoriaToEdit(null);
    },
    onError: () => {
      showError('Error al actualizar la categoría');
    },
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id_categoria, nuevoEstado }: { id_categoria: number; nuevoEstado: boolean }) =>
      updateCategoriaEstado(id_categoria, nuevoEstado),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      showSuccess(`Categoría ${variables.nuevoEstado ? 'activada' : 'desactivada'} correctamente`);
    },
    onError: () => {
      showError('Error al cambiar el estado de la categoría');
    },
  });

  /** ======================
   * HANDLERS
   * ====================== */

  const handleNuevaCategoria = () => {
    setCategoriaToEdit(null);
    modalCategoria.open();
  };

  const handleEditarCategoria = (categoria: Categoria) => {
    setCategoriaToEdit(categoria);
    modalCategoria.open();
  };

  const handleSubmitCategoria = async (nombre: string, id_categoria_padre?: number | null) => {
    if (categoriaToEdit) {
      await actualizarCategoriaMutation.mutateAsync({
        id_categoria: categoriaToEdit.id_categoria,
        nombre,
        id_categoria_padre,
      });
    } else {
      await crearCategoriaMutation.mutateAsync({ nombre, id_categoria_padre });
    }
  };

  const handleToggleCategoriaEstado = async (
    id_categoria: number,
    estadoActual: boolean,
    nombre: string
  ) => {
    const mensaje = estadoActual ? 'desactivar' : 'activar';

    showConfirm(
      `¿${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)} categoría?`,
      `¿Estás seguro de ${mensaje} "${nombre}"?`,
      async () => {
        await toggleEstadoMutation.mutateAsync({
          id_categoria,
          nuevoEstado: !estadoActual,
        });
      },
      estadoActual ? 'danger' : 'info'
    );
  };

  /** ======================
   * VALOR DEL CONTEXTO
   * ====================== */

  const value: CategoriasContextValue = {
    categorias,
    isLoading,
    categoriaToEdit,
    modalCategoria,
    handleNuevaCategoria,
    handleEditarCategoria,
    handleSubmitCategoria,
    handleToggleCategoriaEstado,
  };

  return <CategoriasContext.Provider value={value}>{children}</CategoriasContext.Provider>;
};
