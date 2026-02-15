import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Promocion, PromocionConDetalles, PromocionDetalleInput } from '../../../core/types';
import {
  getPromociones,
  getPromocionesActivas,
  createPromocion,
  updatePromocion,
  deletePromocion,
  getDetallePromocion,
} from '../services/promocionService';
import { useAsync } from '../../../shared/hooks/useAsync';
import { useModal } from '../../../shared/hooks/useModal';

/** ======================
 * TIPOS E INTERFACES
 * ====================== */

interface PromocionPayload {
  name: string;
  precio: number | null;
  productos: PromocionDetalleInput[];
  estado: boolean;
}

interface PromocionesContextValue {
  // Estado
  promociones: Promocion[];
  promocionesActivas: Promocion[];
  promocionToEdit: PromocionConDetalles | null;
  promocionVista: Promocion | null;
  promocionVistaDetalles: any[];

  // Modales
  modalCrearPromocion: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };
  modalVerPromocion: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };

  // Operaciones de carga
  recargarPromociones: () => Promise<void>;

  // Operaciones CRUD
  handleCrearPromocion: (payload: PromocionPayload, imageFile?: File | null) => Promise<void>;
  handleEditarPromocion: (promocion: Promocion) => Promise<void>;
  handleChangePromocion: (id_promocion: number, estado: boolean) => void;
  handleVerPromocion: (promocion: Promocion) => Promise<void>;

  // Estados de loading (useAsync)
  crearPromocionAsync: ReturnType<typeof useAsync<any>>;
  editarPromocionAsync: ReturnType<typeof useAsync<any>>;
  eliminarPromocionAsync: ReturnType<typeof useAsync<any>>;
  verPromocionAsync: ReturnType<typeof useAsync<any>>;
}

const PromocionesContext = createContext<PromocionesContextValue | undefined>(undefined);

/** ======================
 * PROVIDER
 * ====================== */

interface PromocionesProviderProps {
  children: ReactNode;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  showWarning: (msg: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: 'danger' | 'warning' | 'info'
  ) => void;
}

export const PromocionesProvider: React.FC<PromocionesProviderProps> = ({
  children,
  showSuccess,
  showError,
  showConfirm,
}) => {
  // ============= ESTADO =============
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [promocionesActivas, setPromocionesActivas] = useState<Promocion[]>([]);
  const [promocionToEdit, setPromocionToEdit] = useState<PromocionConDetalles | null>(null);
  const [promocionVista, setPromocionVista] = useState<Promocion | null>(null);
  const [promocionVistaDetalles, setPromocionVistaDetalles] = useState<any[]>([]);

  // Modales
  const modalCrearPromocion = useModal(false);
  const modalVerPromocion = useModal(false);

  // useAsync hooks
  const crearPromocionAsync = useAsync<any>();
  const editarPromocionAsync = useAsync<any>();
  const eliminarPromocionAsync = useAsync<any>();
  const verPromocionAsync = useAsync<any>();

  // ============= INICIALIZACIÓN =============
  
  /**
   * Carga las promociones al montar el componente
   */
  useEffect(() => {
    const initPromociones = async () => {
      try {
        const [promocionesData, promocionesActivasData] = await Promise.all([
          getPromociones(),
          getPromocionesActivas(),
        ]);
        
        setPromociones(promocionesData || []);
        setPromocionesActivas(promocionesActivasData || []);
      } catch (err) {
        showError('Error cargando promociones iniciales');
      }
    };

    initPromociones();
  }, [showError]);

  // ============= OPERACIONES DE CARGA =============

  /**
   * Recarga todas las promociones
   */
  const recargarPromociones = useCallback(async () => {
    try {
      const [promocionesData, promocionesActivasData] = await Promise.all([
        getPromociones(),
        getPromocionesActivas(),
      ]);
      
      setPromociones(promocionesData || []);
      setPromocionesActivas(promocionesActivasData || []);
    } catch (err) {
      showError('Error recargando promociones');
    }
  }, [showError]);

  // ============= OPERACIONES CRUD =============

  /**
   * Crear o editar una promoción
   */
  const handleCrearPromocion = useCallback(
    async (payload: PromocionPayload, imageFile?: File | null) => {
      try {
        if (promocionToEdit) {
          // Edit flow
          await editarPromocionAsync.execute(() => 
            updatePromocion(
              promocionToEdit.id_promocion, 
              payload.name, 
              payload.precio, 
              payload.productos, 
              payload.estado,
              imageFile,
              promocionToEdit.imagen_path
            )
          );
          setPromocionToEdit(null);
          showSuccess('Promoción actualizada correctamente');
        } else {
          // Create flow
          await crearPromocionAsync.execute(() => 
            createPromocion(payload.name, payload.precio, payload.productos, payload.estado, imageFile)
          );
          showSuccess('Promoción creada correctamente');
        }
        await recargarPromociones();
        modalCrearPromocion.close();
      } catch (err) {
        showError('Error al crear o actualizar la promoción');
      }
    },
    [promocionToEdit, crearPromocionAsync, editarPromocionAsync, modalCrearPromocion, showSuccess, showError, recargarPromociones]
  );

  /**
   * Abrir modal para editar una promoción
   */
  const handleEditarPromocion = useCallback(
    async (promocion: Promocion) => {
      try {
        const detalles = await getDetallePromocion(promocion.id_promocion);
        const productosConCantidad = (detalles || []).map((d: any) => ({ 
          id_producto: d.id_producto, 
          cantidad: d.cantidad 
        }));
        setPromocionToEdit({ ...promocion, productos: productosConCantidad });
        modalCrearPromocion.open();
      } catch (err) {
        showError('No se pudo cargar los detalles de la promoción');
      }
    },
    [modalCrearPromocion, showError]
  );

  /**
   * Cambiar estado de una promoción (activar/desactivar)
   */
  const handleChangePromocion = useCallback(
    (id_promocion: number, estado: boolean) => {
      showConfirm(
        estado ? 'Dar de alta promoción' : 'Dar de baja promoción',
        `¿Seguro que quieres ${estado ? 'dar de alta' : 'dar de baja'} la promoción #${id_promocion}?`,
        async () => {
          try {
            await eliminarPromocionAsync.execute(() => deletePromocion(id_promocion, estado));
            await recargarPromociones();
            showSuccess(`Promoción ${estado ? 'dada de alta' : 'dada de baja'} correctamente`);
          } catch (err) {
            showError('No se pudo cambiar el estado de la promoción');
          }
        },
        estado ? 'info' : 'danger'
      );
    },
    [showConfirm, eliminarPromocionAsync, showSuccess, showError, recargarPromociones]
  );

  /**
   * Ver detalles de una promoción
   */
  const handleVerPromocion = useCallback(
    async (promocion: Promocion) => {
      try {
        const detalles = await verPromocionAsync.execute(() => getDetallePromocion(promocion.id_promocion));
        setPromocionVista(promocion);
        setPromocionVistaDetalles(detalles || []);
        modalVerPromocion.open();
      } catch (err) {
        showError('No se pudieron cargar los detalles de la promoción');
      }
    },
    [verPromocionAsync, modalVerPromocion, showError]
  );

  // ============= VALOR DEL CONTEXTO =============

  const value: PromocionesContextValue = {
    // Estado
    promociones,
    promocionesActivas,
    promocionToEdit,
    promocionVista,
    promocionVistaDetalles,

    // Modales
    modalCrearPromocion,
    modalVerPromocion,

    // Operaciones de carga
    recargarPromociones,

    // Operaciones CRUD
    handleCrearPromocion,
    handleEditarPromocion,
    handleChangePromocion,
    handleVerPromocion,

    // Estados de loading
    crearPromocionAsync,
    editarPromocionAsync,
    eliminarPromocionAsync,
    verPromocionAsync,
  };

  return <PromocionesContext.Provider value={value}>{children}</PromocionesContext.Provider>;
};

/** ======================
 * HOOK PERSONALIZADO
 * ====================== */

export const usePromociones = () => {
  const context = useContext(PromocionesContext);
  if (!context) {
    throw new Error('usePromociones debe usarse dentro de PromocionesProvider');
  }
  return context;
};
