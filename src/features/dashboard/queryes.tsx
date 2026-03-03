import { getVentasPage } from '../ventas/services/ventaService';
import { getGastosActivos } from '../gastos/services/gastoService';
import { getCotizacionActual } from '../ventas/services/cotizacionService';
import { useQuery } from '@tanstack/react-query';
import { getCurrentMonthRange, getTodayYMD } from '../../shared/utils/dates';
import { supabase } from '../../core/config/supabase';
import { useMemo } from 'react';

export const STOCK_CRITICO_UMBRAL = 5;

export function useDashboardData() {
  const monthRange = useMemo(() => getCurrentMonthRange(), []);
  const hoy = useMemo(() => getTodayYMD(), []);

  const { data: ventasMesData, isLoading: loadingMes } = useQuery({
    queryKey: ['dashboard', 'ventas-mes', monthRange.start, monthRange.end],
    queryFn: () => getVentasPage(1, 1000, { desde: monthRange.start, hasta: monthRange.end, baja: false }),
    staleTime: 1000 * 60 * 3,
  });

  const { data: ventasHoyData, isLoading: loadingHoy } = useQuery({
    queryKey: ['dashboard', 'ventas-hoy', hoy],
    queryFn: () => getVentasPage(1, 100, { desde: hoy, hasta: hoy, baja: false }),
    staleTime: 1000 * 60 * 2,
  });

  const { data: gastosActivos = [], isLoading: loadingGastos } = useQuery({
    queryKey: ['dashboard', 'gastos-activos'],
    queryFn: getGastosActivos,
    staleTime: 1000 * 60 * 5,
  });

  const { data: cotizacion = 1000, isLoading: loadingCotiz } = useQuery({
    queryKey: ['dashboard', 'cotizacion'],
    queryFn: getCotizacionActual,
    staleTime: 1000 * 60 * 10,
  });

  const { data: stockCritico = [], isLoading: loadingStock } = useQuery({
    queryKey: ['dashboard', 'stock-critico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producto')
        .select('id_producto, nombre, stock')
        .eq('estado', true)
        .lte('stock', STOCK_CRITICO_UMBRAL)
        .order('stock', { ascending: true })
        .limit(8);
      if (error) throw error;
      return (data || []) as Array<{ id_producto: number; nombre: string; stock: number }>;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: pedidosPendientes = [], isLoading: loadingPedidos } = useQuery({
    queryKey: ['dashboard', 'pedidos-pendientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id_pedido, cliente_nombre, estado, total')
        .in('estado', ['RECIBIDO', 'ACEPTADO'])
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data || []) as Array<{ id_pedido: number; cliente_nombre: string; estado: string; total: number | null }>;
    },
    staleTime: 1000 * 60 * 3,
  });

  return {
    ventasMesData,
    loadingMes,
    ventasHoyData,
    loadingHoy,
    gastosActivos,
    loadingGastos,
    cotizacion,
    loadingCotiz,
    stockCritico,
    loadingStock,
    pedidosPendientes,
    loadingPedidos,
  };
}