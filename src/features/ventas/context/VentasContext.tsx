import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { Venta, DetalleVentaInput, PlanDePago } from '../../../core/types';
import {
  getVentasPage,
  createVenta,
  updateVentaEstado,
  updateVentaBaja,
  reactivarVenta,
  updateVentaMetodoPago,
} from '../services/ventaService';
import {
  getPlanesDePago,
  registrarPagoCuota,
  cancelarPlan,
  createPlanDePago,
} from '../services/planDePagoService';
import { getTodayISO } from '../../../shared/utils';
import { useAsync } from '../../../shared/hooks/useAsync';
import { useModal } from '../../../shared/hooks/useModal';

/** ======================
 * TIPOS E INTERFACES
 * ====================== */

// Configuración de plan de pago pasada desde el modal de nueva venta
export interface PlanDePagoConfig {
  id_cliente?: string;
  cliente_nombre: string;
  cliente_telefono: string;
  numero_cuotas: number;
  monto_total: number;
}

interface VentasSearchOptions {
  desde?: string;
  hasta?: string;
  estado?: boolean;
  baja?: boolean;
}

interface VentasContextValue {
  // Estado
  ventas: Venta[];
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
  handleNuevaVenta: (items: DetalleVentaInput[], pagada: boolean, planConfig?: PlanDePagoConfig) => Promise<void>;
  handleBuscarVentas: (opts?: VentasSearchOptions) => Promise<void>;
  handleToggleVentaFlag: (
    id_venta: number,
    field: 'estado' | 'baja',
    currentValue: boolean,
    label?: string,
  ) => void;

  // Planes de pago
  planes: PlanDePago[];
  planesLoading: boolean;
  recargarPlanes: () => Promise<void>;
  handleRegistrarPago: (id_plan: number) => void;
  handleCancelarPlanDePago: (id_plan: number) => void;

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
  // Usar refs para funciones de toast/confirm para evitar recreaciones de useCallback
  const showSuccessRef = useRef(showSuccess);
  const showErrorRef = useRef(showError);
  const showConfirmRef = useRef(showConfirm);

  // Actualizar refs cuando cambien las funciones
  useEffect(() => {
    showSuccessRef.current = showSuccess;
    showErrorRef.current = showError;
    showConfirmRef.current = showConfirm;
  }, [showSuccess, showError, showConfirm]);

  // ============= ESTADO =============
  const PAGE_SIZE = 8;
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ventasPageNum, setVentasPageNum] = useState(1);
  const [ventasTotal, setVentasTotal] = useState(0);
  const [ventasSearchQuery, setVentasSearchQuery] = useState<VentasSearchOptions>({ baja: false });

  // Modales
  const modalNuevaVenta = useModal(false);

  // useAsync hooks
  const crearVentaAsync = useAsync<any>();

  // Estado de planes de pago
  const [planes, setPlanes] = useState<PlanDePago[]>([]);
  const [planesLoading, setPlanesLoading] = useState(false);

  // ============= INICIALIZACIÓN =============

  /**
   * Carga la primera página de ventas al montar el componente
   * Solo se ejecuta UNA VEZ al montar
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
        showErrorRef.current('Error cargando ventas iniciales');
      }
    };

    initVentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar el componente

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
        showErrorRef.current('Error cargando ventas');
      }
    },
    [PAGE_SIZE]
  );

  /**
   * Recarga la página actual de ventas manteniendo paginación y filtros
   */
  const recargarVentasActuales = useCallback(async (
    opts?: VentasSearchOptions
  ) => {
    try {
      // Si no se pasan opts, usar ventasSearchQuery del estado para mantener filtros
      const optsToUse = opts !== undefined ? opts : ventasSearchQuery;
      await loadVentasPage(ventasPageNum, optsToUse);
    } catch (err) {
      showErrorRef.current('Error recargando ventas');
    }
  }, [ventasPageNum, ventasSearchQuery, loadVentasPage]);

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
        showErrorRef.current(message || 'Error buscando ventas');
      }
    },
    [PAGE_SIZE]
  );

  /**
   * Crear una nueva venta
   */
  const recargarPlanes = useCallback(async () => {
    setPlanesLoading(true);
    try {
      const data = await getPlanesDePago();
      setPlanes(data);
    } catch {
      showErrorRef.current('Error cargando planes de pago');
    } finally {
      setPlanesLoading(false);
    }
  }, []);

  useEffect(() => { recargarPlanes(); }, [recargarPlanes]);

  const handleRegistrarPago = useCallback((id_plan: number) => {
    const plan = planes.find(p => p.id_plan === id_plan);
    if (!plan) return;
    showConfirmRef.current(
      'Registrar cuota',
      `¿Confirmar pago de cuota ${plan.cuotas_pagadas + 1}/${plan.numero_cuotas} ($${plan.monto_cuota.toFixed(2)}) de ${plan.cliente.nombre}?`,
      async () => {
        try {
          await registrarPagoCuota(id_plan);
          showSuccessRef.current('Cuota registrada');
          await recargarPlanes();
        } catch {
          showErrorRef.current('Error al registrar el pago');
        }
      },
      'info'
    );
  }, [planes, recargarPlanes]);

  const handleCancelarPlanDePago = useCallback((id_plan: number) => {
    const plan = planes.find(p => p.id_plan === id_plan);
    if (!plan) return;
    showConfirmRef.current(
      'Cancelar plan',
      `¿Cancelar el plan de pago de ${plan.cliente.nombre}? La venta quedará como impaga.`,
      async () => {
        try {
          await cancelarPlan(id_plan);
          showSuccessRef.current('Plan cancelado');
          await recargarPlanes();
        } catch {
          showErrorRef.current('Error al cancelar el plan');
        }
      },
      'danger'
    );
  }, [planes, recargarPlanes]);

  /**
   * Crear una nueva venta
   */
  const handleNuevaVenta = useCallback(
    async (items: DetalleVentaInput[], pagada: boolean, planConfig?: PlanDePagoConfig) => {
      try {
        const fecha = getTodayISO();
        const idVenta = await crearVentaAsync.execute(() => createVenta(fecha, items, pagada));

        if (planConfig && idVenta) {
          await updateVentaMetodoPago(idVenta, 'plan_de_pago');
          await createPlanDePago({
            id_venta: idVenta,
            id_cliente: planConfig.id_cliente,
            cliente_nombre: planConfig.cliente_nombre,
            cliente_telefono: planConfig.cliente_telefono,
            numero_cuotas: planConfig.numero_cuotas,
            monto_total: planConfig.monto_total,
            monto_cuota: Math.round((planConfig.monto_total / planConfig.numero_cuotas) * 100) / 100,
          });
          await recargarPlanes();
        }

        await recargarVentasActuales();
        modalNuevaVenta.close();
        showSuccessRef.current(planConfig ? 'Venta con plan de pago registrada' : 'Venta registrada exitosamente');
      } catch (err) {
        showErrorRef.current('Error al registrar la venta');
      }
    },
    [crearVentaAsync, modalNuevaVenta, recargarVentasActuales, recargarPlanes]
  );

  /**
   * Cambiar estado de una venta (pagada/pendiente o activa/baja)
   */
  const handleToggleVentaFlag = useCallback(
    (
      id_venta: number,
      field: 'estado' | 'baja',
      currentValue: boolean,
      label?: string,
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

      showConfirmRef.current(
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
              showErrorRef.current(`No se encontró la venta #${id_venta}`);
              return;
            }

            showSuccessRef.current(`Venta ${updated.id_venta} actualizada correctamente`);
            await recargarVentasActuales();
          } catch (err) {
            const e: any = err;
            const message =
              e?.message ||
              e?.error ||
              (typeof e === 'string' ? e : JSON.stringify(e));
            showErrorRef.current(message || `No se pudo actualizar el campo ${field} de la venta`);
          }
        },
        'warning'
      );
    },
    [recargarVentasActuales]
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

    // Planes de pago
    planes,
    planesLoading,
    recargarPlanes,
    handleRegistrarPago,
    handleCancelarPlanDePago,

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
