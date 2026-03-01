import { createContext, ReactNode, useContext } from "react";
import { Empleado } from "../../../core/types";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import React from "react";
import { queryKeys } from "../../../lib/queryClient";
import useModal from "../../../shared/hooks/useModal";
import { createEmpleado, darDeBajaEmpleado, darDeAltaEmpleado, getEmpleados, updateEmpleado } from "../services/empleadoService";


interface EmpleadosProviderProps {
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

interface EmpleadosContextValue {
  empleados: Empleado[];
  isLoading: boolean;
  empleadoToEdit: Empleado | null;
  modalEmpleado: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };
  handleNuevoEmpleado: () => void;
  handleEditarEmpleado: (empleado: Empleado) => void;
  handleSubmitEmpleado: ({ empleado }: { empleado: Empleado }, password?: string) => Promise<void>;
  handleToggleEmpleadoEstado: (id_empleado: string, estadoActual: boolean, nombre: string) => Promise<void>;
}

const EmpleadosContext = createContext<EmpleadosContextValue | undefined>(undefined);

export const useEmpleado = () => {
  const context = useContext(EmpleadosContext);
  if (!context) {
    throw new Error('useEmpleado debe usarse dentro de EmpleadosProvider');
  }
  return context;
};

export const EmpleadosProvider: React.FC<EmpleadosProviderProps> = ({
  children,
  showSuccess,
  showError,
  showConfirm,
}) => {
  const queryClient = useQueryClient();
  const modalEmpleado = useModal(false);
  const [empleadoToEdit, setEmpleadoToEdit] = React.useState<Empleado | null>(null);

  const {
    data: empleados = [],
    isLoading,
  } = useQuery({
    queryKey: queryKeys.empleados,
    queryFn: getEmpleados,
    staleTime: 1000 * 60 * 5,
  });

  const crearEmpleadoMutation = useMutation({
    mutationFn: ({ email, password, nombre, apellido, fecha_nacimiento, dni, estado }: { email: string; password: string; nombre?: string; apellido?: string; fecha_nacimiento?: string; dni?: string; estado?: string }) =>
      createEmpleado({ email, password, nombre, apellido, fecha_nacimiento, dni, estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.empleados });
      showSuccess('Empleado creado correctamente');
      modalEmpleado.close();
      setEmpleadoToEdit(null);
    },
    onError: () => {
      showError('Error al crear el empleado');
    },
  });

  const actualizarEmpleadoMutation = useMutation({
    mutationFn: ({ id, nombre, apellido, fecha_nacimiento, dni, estado }: {
      id: string;
      nombre: string;
      apellido: string;
      fecha_nacimiento: string;
      dni: string;
      estado: string;
    }) => updateEmpleado(id, { nombre, apellido, fecha_nacimiento, dni, estado }),

    onSuccess: (empleadoActualizado) => {
      // Actualizar caché optimistamente con el dato retornado
      if (empleadoActualizado) {
        queryClient.setQueryData(queryKeys.empleados, (old: Empleado[] | undefined) => {
          if (!old) return old;
          return old.map(e =>
            e.user_id === empleadoActualizado.user_id ? empleadoActualizado : e
          );
        });
      }

      // Forzar refetch para asegurar consistencia
      queryClient.invalidateQueries({ queryKey: queryKeys.empleados });

      setEmpleadoToEdit(null);
      modalEmpleado.close();
      showSuccess('Empleado actualizado correctamente');
    },

    onError: () => {
      showError('Error al actualizar el empleado');
    },
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => {
      if (estado === 'activo') {
        return darDeBajaEmpleado(id);
      } else {
        return darDeAltaEmpleado(id);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.empleados });
      showSuccess(`Empleado ${variables.estado === 'activo' ? 'dado de baja' : 'dado de alta'} correctamente`);
    },
    onError: (_, variables) => {
      showError(`Error al ${variables.estado === 'activo' ? 'dar de baja' : 'dar de alta'} el empleado`);
    },
  });

  const handleNuevoEmpleado = () => {
    setEmpleadoToEdit(null);
    modalEmpleado.open();
  };

  const handleEditarEmpleado = (empleado: Empleado) => {
    setEmpleadoToEdit(empleado);
    modalEmpleado.open();
  };

  const handleSubmitEmpleado = React.useCallback(
    async ({ empleado }: { empleado: Empleado }, password?: string) => {
      if (empleadoToEdit) {
        await actualizarEmpleadoMutation.mutateAsync({
          id: empleadoToEdit.user_id,
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          fecha_nacimiento: empleado.fecha_nacimiento,
          dni: empleado.dni,
          estado: empleado.estado,
        });
      } else {
        await crearEmpleadoMutation.mutateAsync({ 
          email: empleado.email, 
          password: password!, 
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          fecha_nacimiento: empleado.fecha_nacimiento,
          dni: empleado.dni,
          estado: empleado.estado || 'activo',
        });
      }
    },
    [empleadoToEdit, actualizarEmpleadoMutation, crearEmpleadoMutation]
  );

  const handleToggleEmpleadoEstado = async (
    id_empleado: string,
    estadoActual: boolean,
    nombre: string
  ) => {
    const mensaje = estadoActual ? 'desactivar' : 'activar';

    showConfirm(
      `¿${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)} empleado?`,
      `¿Estás seguro de ${mensaje} "${nombre}"?`,
      async () => {
        await toggleEstadoMutation.mutateAsync({
          id: id_empleado,
          estado: estadoActual ? 'activo' : 'baja',
        });
      },
      estadoActual ? 'danger' : 'info'
    );
  };

  const value: EmpleadosContextValue = {
    empleados,
    isLoading,
    empleadoToEdit,
    modalEmpleado,
    handleNuevoEmpleado,
    handleEditarEmpleado,
    handleSubmitEmpleado,
    handleToggleEmpleadoEstado,
  };

  return <EmpleadosContext.Provider value={value}>{children}</EmpleadosContext.Provider>;
};