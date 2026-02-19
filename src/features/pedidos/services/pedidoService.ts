import { supabase } from '../../../core/config/supabase';
import { 
  Pedido,
  PedidoConDetalles, 
  CrearPedidoInput,
  EstadoPedido 
} from '../../../core/types';

/**
 * Obtener todos los pedidos con sus detalles
 */
export async function getPedidos(): Promise<PedidoConDetalles[]> {
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });

  if (pedidosError) throw pedidosError;
  if (!pedidos) return [];

  // Cargar detalles para cada pedido
  const pedidosConDetalles = await Promise.all(
    pedidos.map(async (pedido) => {
      const { data: detalles, error: detallesError } = await supabase
        .from('pedido_detalle')
        .select(`
          *,
          producto:id_producto (
            id_producto,
            nombre,
            descripcion,
            imagen_path,
            id_unidad_medida
          ),
          promocion:id_promocion (
            id_promocion,
            name,
            precio,
            imagen_path
          )
        `)
        .eq('id_pedido', pedido.id_pedido);

      if (detallesError) throw detallesError;

      // Mapear detalles con los nombres correctos
      const detallesMapeados = (detalles || []).map(detalle => ({
        ...detalle,
        nombre_item: detalle.tipo === 'producto' 
          ? detalle.producto?.nombre || 'Producto sin nombre'
          : detalle.promocion?.name || 'Promoción sin nombre',
        subtotal: detalle.cantidad * detalle.precio_unitario,
      }));

      return {
        ...pedido,
        detalles: detallesMapeados,
      } as PedidoConDetalles;
    })
  );

  return pedidosConDetalles;
}

/**
 * Obtener pedidos por estado
 */
export async function getPedidosPorEstado(estado: EstadoPedido): Promise<PedidoConDetalles[]> {
  const { data: pedidos, error: pedidosError } = await supabase
    .from('pedidos')
    .select('*')
    .eq('estado', estado)
    .order('created_at', { ascending: false });

  if (pedidosError) throw pedidosError;
  if (!pedidos) return [];

  const pedidosConDetalles = await Promise.all(
    pedidos.map(async (pedido) => {
      const { data: detalles } = await supabase
        .from('pedido_detalle')
        .select(`
          *,
          producto:id_producto (*),
          promocion:id_promocion (*)
        `)
        .eq('id_pedido', pedido.id_pedido);

      // Mapear detalles con los nombres correctos
      const detallesMapeados = (detalles || []).map(detalle => ({
        ...detalle,
        nombre_item: detalle.tipo === 'producto' 
          ? detalle.producto?.nombre || 'Producto sin nombre'
          : detalle.promocion?.name || 'Promoción sin nombre',
        subtotal: detalle.cantidad * detalle.precio_unitario,
      }));

      return {
        ...pedido,
        detalles: detallesMapeados,
      } as PedidoConDetalles;
    })
  );

  return pedidosConDetalles;
}

/**
 * Obtener pedido por ID
 */
export async function getPedidoById(id_pedido: number): Promise<PedidoConDetalles | null> {
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id_pedido', id_pedido)
    .single();

  if (pedidoError) throw pedidoError;
  if (!pedido) return null;

  const { data: detalles } = await supabase
    .from('pedido_detalle')
    .select(`
      *,
      producto:id_producto (*),
      promocion:id_promocion (*)
    `)
    .eq('id_pedido', id_pedido);

  // Mapear detalles con los nombres correctos
  const detallesMapeados = (detalles || []).map(detalle => ({
    ...detalle,
    nombre_item: detalle.tipo === 'producto' 
      ? detalle.producto?.nombre || 'Producto sin nombre'
      : detalle.promocion?.name || 'Promoción sin nombre',
    subtotal: detalle.cantidad * detalle.precio_unitario,
  }));

  return {
    ...pedido,
    detalles: detallesMapeados,
  } as PedidoConDetalles;
}

/**
 * Buscar pedidos por teléfono o nombre
 */
export async function buscarPedidos(query: string): Promise<PedidoConDetalles[]> {
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('*')
    .or(`cliente_telefono.ilike.%${query}%,cliente_nombre.ilike.%${query}%,id_pedido.eq.${parseInt(query) || 0}`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  if (!pedidos) return [];

  const pedidosConDetalles = await Promise.all(
    pedidos.map(async (pedido) => {
      const { data: detalles } = await supabase
        .from('pedido_detalle')
        .select(`
          *,
          producto:id_producto (*),
          promocion:id_promocion (*)
        `)
        .eq('id_pedido', pedido.id_pedido);

      // Mapear detalles con los nombres correctos
      const detallesMapeados = (detalles || []).map(detalle => ({
        ...detalle,
        nombre_item: detalle.tipo === 'producto' 
          ? detalle.producto?.nombre || 'Producto sin nombre'
          : detalle.promocion?.name || 'Promoción sin nombre',
        subtotal: detalle.cantidad * detalle.precio_unitario,
      }));

      return {
        ...pedido,
        detalles: detallesMapeados,
      } as PedidoConDetalles;
    })
  );

  return pedidosConDetalles;
}

/**
 * Crear un nuevo pedido
 */
export async function createPedido(input: CrearPedidoInput): Promise<Pedido> {
  // Calcular total
  const total = input.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

  // Insertar pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      cliente_nombre: input.cliente_nombre,
      cliente_telefono: input.cliente_telefono,
      cliente_direccion: input.cliente_direccion,
      metodo_pago: input.metodo_pago,
      notas: input.notas,
      total,
      estado: 'RECIBIDO',
    })
    .select()
    .single();

  if (pedidoError) throw pedidoError;

  // Insertar detalles
  const detallesInput = input.items.map(item => ({
    id_pedido: pedido.id_pedido,
    tipo: item.tipo,
    id_producto: item.tipo === 'producto' ? item.id : null,
    id_promocion: item.tipo === 'promocion' ? item.id : null,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
  }));

  const { error: detallesError } = await supabase
    .from('pedido_detalle')
    .insert(detallesInput);

  if (detallesError) throw detallesError;

  return pedido;
}

/**
 * Actualizar estado del pedido
 */
export async function updateEstadoPedido(
  id_pedido: number, 
  nuevoEstado: EstadoPedido
): Promise<void> {
  const { error } = await supabase
    .from('pedidos')
    .update({ estado: nuevoEstado })
    .eq('id_pedido', id_pedido);

  if (error) throw error;
}

/**
 * Obtener contador de pedidos pendientes (RECIBIDO + ACEPTADO)
 */
export async function getContadorPedidosPendientes(): Promise<number> {
  const { count, error } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
    .in('estado', ['RECIBIDO', 'ACEPTADO']);

  if (error) throw error;
  return count || 0;
}

/**
 * Auto-cancelar pedidos vencidos (más de 24hs en estado RECIBIDO)
 */
export async function autoCancelarPedidosVencidos(): Promise<number> {
  const fecha24HorasAtras = new Date();
  fecha24HorasAtras.setHours(fecha24HorasAtras.getHours() - 24);

  const { data, error } = await supabase
    .from('pedidos')
    .update({ estado: 'CANCELADO' })
    .eq('estado', 'RECIBIDO')
    .lt('created_at', fecha24HorasAtras.toISOString())
    .select('id_pedido');

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Obtener métricas de pedidos del día
 */
export async function getMetricasPedidosHoy() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('estado, total')
    .gte('fecha_pedido', hoy.toISOString());

  if (error) throw error;

  const total = pedidos?.length || 0;
  const entregados = pedidos?.filter(p => p.estado === 'ENTREGADO').length || 0;
  const cancelados = pedidos?.filter(p => p.estado === 'CANCELADO').length || 0;
  const pendientes = pedidos?.filter(p => ['RECIBIDO', 'ACEPTADO'].includes(p.estado)).length || 0;
  const totalVentas = pedidos?.filter(p => p.estado === 'ENTREGADO').reduce((sum, p) => sum + p.total, 0) || 0;

  return {
    total,
    entregados,
    cancelados,
    pendientes,
    totalVentas,
    tasaConversion: total > 0 ? (entregados / total) * 100 : 0,
  };
}
