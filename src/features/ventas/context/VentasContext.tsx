import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { VentaConDetalles, DetalleVentaInput } from '../../../core/types';
import {
  getVentasPage,
  createVenta,
  updateVentaEstado,
  updateVentaBaja,
  reactivarVenta,
} from '../services/ventaService';
import { getTodayISO } from '../../../shared/utils';
import { useAsync } from '../../../shared/hooks/useAsync';
import { useModal } from '../../../shared/hooks/useModal';

/** ======================
 * TIPOS E INTERFACES
 * ====================== */

interface VentasSearchOptions {
  desde?: string;
  hasta?: string;
  estado?: boolean;
  baja?: boolean;
}

interface VentasContextValue {
  // Estado
  ventas: VentaConDetalles[];
  ventasPageNum: number;
  ventasTotal: number;
  ventasSearchQuery: VentasSearchOptions;
  PAGE_SIZE: number;

  // Modales
  modalNuevaVenta: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };

  // Operaciones de carga
  loadVentasPage: (page?: number, opts?: VentasSearchOptions) => Promise<void>;
  recargarVentasActuales: () => Promise<void>;

  // Operaciones CRUD
  handleNuevaVenta: (items: DetalleVentaInput[], pagada: boolean) => Promise<void>;
  handleBuscarVentas: (opts?: VentasSearchOptions) => Promise<void>;
  handleToggleVentaFlag: (
    id_venta: number,
    field: 'estado' | 'baja',
    currentValue: boolean,
    label?: string
  ) => void;

  // Estados de loading (useAsync)
  crearVentaAsync: ReturnType<typeof useAsync<any>>;
}

const VentasContext = createContext<VentasContextValue | undefined>(undefined);

/** ======================
 * PROVIDER
 * ====================== */

interface VentasProviderProps {
  children: ReactNode;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: 'danger' | 'warning' | 'info'
  ) => void;
}

export const VentasProvider: React.FC<VentasProviderProps> = ({
  children,
  showSuccess,
  showError,
  showConfirm,
}) => {
  // ============= ESTADO =============
  const PAGE_SIZE = 8;
  const [ventas, setVentas] = useState<VentaConDetalles[]>([]);
  const [ventasPageNum, setVentasPageNum] = useState(1);
  const [ventasTotal, setVentasTotal] = useState(0);
  const [ventasSearchQuery, setVentasSearchQuery] = useState<VentasSearchOptions>({ baja: false });

  // Modales
  const modalNuevaVenta = useModal(false);

  // useAsync hooks
  const crearVentaAsync = useAsync<any>();

  // ============= INICIALIZACIÓN =============
  
  /**
   * Carga la primera página de ventas al montar el componente
   */
  useEffect(() => {
    const initVentas = async () => {
      try {
        const { ventas: pageRows, total } = await getVentasPage(1, PAGE_SIZE, { baja: false });
        setVentas(pageRows || []);
        setVentasTotal(total || 0);
        setVentasPageNum(1);
        setVentasSearchQuery({ baja: false });
      } catch (err) {
        showError('Error cargando ventas iniciales');
      }
    };

    initVentas();
  }, [PAGE_SIZE, showError]);

  // ============= OPERACIONES DE CARGA =============

  /**
   * Carga una página específica de ventas con filtros opcionales
   */
  const loadVentasPage = useCallback(
    async (page = 1, opts?: VentasSearchOptions) => {
      try {
        const safeOpts = { ...(opts || {}), baja: typeof opts?.baja === 'boolean' ? opts.baja : false };
        const { ventas: pageRows, total } = await getVentasPage(page, PAGE_SIZE, safeOpts);
        setVentas(pageRows || []);
        setVentasTotal(total || 0);
        setVentasPageNum(page);
        setVentasSearchQuery(safeOpts);
      } catch (err) {
        showError('Error cargando ventas');
      }
    },
    [PAGE_SIZE, showError]
  );

  /**
   * Recarga la página actual de ventas manteniendo paginación y filtros
   */
  const recargarVentasActuales = useCallback(async () => {
    try {
      await loadVentasPage(ventasPageNum, ventasSearchQuery);
    } catch (err) {
      showError('Error recargando ventas');
    }
  }, [ventasPageNum, ventasSearchQuery, loadVentasPage, showError]);

  // ============= OPERACIONES CRUD =============

  /**
   * Buscar ventas con filtros (fechas, estado y baja)
   * Resetea a la página 1
   */
  const handleBuscarVentas = useCallback(
    async (opts?: VentasSearchOptions) => {
      try {
        const safeOpts = { ...(opts || {}), baja: typeof opts?.baja === 'boolean' ? opts.baja : false };
        const { ventas: pageRows, total } = await getVentasPage(1, PAGE_SIZE, safeOpts);
        setVentas(pageRows || []);
        setVentasTotal(total || 0);
        setVentasPageNum(1);
        setVentasSearchQuery(safeOpts);
      } catch (err) {
        const e: any = err;
        const message = e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
        showError(message || 'Error buscando ventas');
      }
    },
    [PAGE_SIZE, showError]
  );

  /**
   * Crear una nueva venta
   */
  const handleNuevaVenta = useCallback(
    async (items: DetalleVentaInput[], pagada: boolean) => {
      try {
        const fecha = getTodayISO();
        await crearVentaAsync.execute(() => createVenta(fecha, items, pagada));
        await recargarVentasActuales();
        modalNuevaVenta.close();
        showSuccess('Venta registrada exitosamente');
      } catch (err) {
        showError('Error al registrar la venta');
      }
    },
    [crearVentaAsync, modalNuevaVenta, showSuccess, showError, recargarVentasActuales]
  );

  /**
   * Cambiar estado de una venta (pagada/pendiente o activa/baja)
   */
  const handleToggleVentaFlag = useCallback(
    (
      id_venta: number,
      field: 'estado' | 'baja',
      currentValue: boolean,
      label?: string
    ) => {
      const title =
        field === 'estado'
          ? currentValue
            ? 'Marcar como pendiente'
            : 'Marcar como pagada'
          : currentValue
            ? 'Dar de alta venta'
            : 'Dar de baja venta';

      const actionText =
        field === 'estado'
          ? currentValue
            ? 'pendiente'
            : 'pagada'
          : currentValue
            ? 'dar de alta'
            : 'dar de baja';

      showConfirm(
        title,
        `¿Seguro que quieres ${actionText} ${label ?? '#' + id_venta}?`,
        async () => {
          try {
            let updated;
            
            if (field === 'estado') {
              updated = await updateVentaEstado(id_venta, !currentValue);
            }
            
            if (field === 'baja' && currentValue === true) {
              updated = await reactivarVenta(id_venta);
            }

            if (field === 'baja' && !currentValue === true) {
              updated = await updateVentaBaja(id_venta, !currentValue);
            }

            if (!updated) {
              showError(`No se encontró la venta #${id_venta}`);
              return;
            }

            await recargarVentasActuales();
            showSuccess(`Venta ${updated.id_venta} actualizada correctamente`);
          } catch (err) {
            const e: any = err;
            const message =
              e?.message ||
              e?.error ||
              (typeof e === 'string' ? e : JSON.stringify(e));
            showError(message || `No se pudo actualizar el campo ${field} de la venta`);
          }
        },
        'warning'
      );
    },
    [showConfirm, showError, showSuccess, recargarVentasActuales]
  );

  // ============= VALOR DEL CONTEXTO =============

  const value: VentasContextValue = {
    // Estado
    ventas,
    ventasPageNum,
    ventasTotal,
    ventasSearchQuery,
    PAGE_SIZE,

    // Modales
    modalNuevaVenta,

    // Operaciones de carga
    loadVentasPage,
    recargarVentasActuales,

    // Operaciones CRUD
    handleNuevaVenta,
    handleBuscarVentas,
    handleToggleVentaFlag,

    // Estados de loading
    crearVentaAsync,
  };

  return <VentasContext.Provider value={value}>{children}</VentasContext.Provider>;
};

/** ======================
 * HOOK PERSONALIZADO
 * ====================== */

export const useVentas = () => {
  const context = useContext(VentasContext);
  if (!context) {
    throw new Error('useVentas debe usarse dentro de VentasProvider');
  }
  return context;
};
