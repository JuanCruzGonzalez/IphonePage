// api/ventasService.ts
import { supabase } from '../supabaseClient';
import { Producto, Venta, DetalleVenta, VentaConDetalles } from '../types';

// ============= TEST DE CONEXIÓN =============
export async function testConnection() {
  console.log('🧪 Testeando conexión a Supabase...');
  
  try {
    // Test simple: obtener todas las tablas
    const { data: ventas, error: ventasError } = await supabase
      .from('venta')
      .select('*')
      .limit(1);
    
    const { data: productos, error: productosError } = await supabase
      .from('producto')
      .select('*')
      .limit(1);
    
    const { data: detalles, error: detallesError } = await supabase
      .from('detalle_venta')
      .select('*')
      .limit(1);

    console.log('📋 Resultados del test:');
    console.log('  Ventas:', { data: ventas, error: ventasError });
    console.log('  Productos:', { data: productos, error: productosError });
    console.log('  Detalles:', { data: detalles, error: detallesError });

    if (ventasError || productosError || detallesError) {
      console.error('❌ Errores encontrados en las tablas');
      return false;
    }

    console.log('✅ Conexión exitosa a todas las tablas');
    return true;
  } catch (err) {
    console.error('❌ Error en test de conexión:', err);
    return false;
  }
}

// ============= PRODUCTOS =============
export async function getProductos() {
  const { data, error } = await supabase
    .from('producto')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }

  return data as Producto[];
}

export async function createProducto(producto: Omit<Producto, 'id_producto'>) {
  const { data, error } = await supabase
    .from('producto')
    .insert([producto])
    .select()
    .single();

  if (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }

  return data as Producto;
}

export async function updateStockProducto(id_producto: number, nuevoStock: number) {
  const { data, error } = await supabase
    .from('producto')
    .update({ stock: nuevoStock })
    .eq('id_producto', id_producto)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar stock:', error);
    throw error;
  }

  return data as Producto;
}

// ============= VENTAS =============
export async function getVentas() {
  console.log('🔍 Intentando obtener ventas...');
  
  const { data, error } = await supabase
    .from('venta')
    .select(`
      *,
      detalle_venta (
        *,
        producto (*)
      )
    `)
    .order('fecha', { ascending: false });

  console.log('📊 Respuesta de Supabase:', { data, error });

  if (error) {
    console.error('❌ Error al obtener ventas:', error);
    console.error('Detalles del error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  if (!data) {
    console.warn('⚠️ No se obtuvieron datos');
    return [];
  }

  console.log('✅ Ventas obtenidas:', data.length);
  return data as VentaConDetalles[];
}

export async function createVenta(
  fecha: string,
  detalles: { id_producto: number; cantidad: number }[]
) {
  // 1. Crear la venta
  const { data: venta, error: ventaError } = await supabase
    .from('venta')
    .insert([{ fecha, estado: true }])
    .select()
    .single();

  if (ventaError) {
    console.error('Error al crear venta:', ventaError);
    throw ventaError;
  }

  // 2. Crear los detalles de venta
  const detallesConVenta = detalles.map(detalle => ({
    id_venta: venta.id_venta,
    id_producto: detalle.id_producto,
    cantidad: detalle.cantidad
  }));

  const { data: detallesCreados, error: detallesError } = await supabase
    .from('detalle_venta')
    .insert(detallesConVenta)
    .select();

  if (detallesError) {
    console.error('Error al crear detalles de venta:', detallesError);
    throw detallesError;
  }
  return venta;
}

// ============= DETALLES DE VENTA =============
export async function getDetallesVenta(id_venta: number) {
  const { data, error } = await supabase
    .from('detalle_venta')
    .select(`
      *,
      producto (*)
    `)
    .eq('id_venta', id_venta);

  if (error) {
    console.error('Error al obtener detalles de venta:', error);
    throw error;
  }

  return data as (DetalleVenta & { producto: Producto })[];
}