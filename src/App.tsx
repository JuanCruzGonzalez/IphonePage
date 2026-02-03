import { useState, useEffect } from 'react';
import './App.css';
import './ToastStyles.css';
import { Producto, VentaConDetalles, UnidadMedida } from './types';
import {
  getVentas,
  createVenta,
  buscarVentas,
  updateVentaFlag,
} from './api/ventaService';
import {
  getProductos,
  createProducto,
  updateStockProducto,
  buscarProductos,
  getUnidadesMedidas,
  updateProducto,
  updateProductoEstado,
} from './api/productoService';
import { Sidebar } from './components/Sidebar';
import { VentasPage } from './pages/VentasPage';
import { ProductosPage } from './pages/ProductosPage';
import { StockPage } from './pages/StockPage';
import { ModalNuevaVenta } from './components/ModalNuevaVenta';
import { ModalNuevoProducto } from './components/ModalNuevoProducto';
import { ModalActualizarStock } from './components/ModalActualizarStock';
import { Toast, ConfirmModal } from './components/ToastModal';
import { useToast, useConfirm } from './hooks/useToast';
import { useDisableWheelOnNumberInputs } from './hooks/useDisableWheelOnNumberInputs';
import { useModal } from './hooks/useModal';
import { useAsync } from './hooks/useAsync';

function App() {
  const [activeSection, setActiveSection] = useState<'ventas' | 'productos' | 'stock'>('ventas');
  const [ventas, setVentas] = useState<VentaConDetalles[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const modalNuevaVenta = useModal(false);
  const modalNuevoProducto = useModal(false);
  const [productToEdit, setProductToEdit] = useState<null | any>(null);
  const modalActualizarStock = useModal(false);

  // Hooks para toast y confirmación
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();

  // Deshabilitar comportamiento de la rueda sobre inputs number (global)
  useDisableWheelOnNumberInputs();

  useEffect(() => {
    cargarDatos();
  }, []);

  const initAsync = useAsync<void>();
  const buscarVentasAsync = useAsync<any[]>();
  const buscarProductosAsync = useAsync<any[]>();
  const crearProductoAsync = useAsync<any>();
  const editarProductoAsync = useAsync<any>();
  const actualizarStockAsync = useAsync<any>();
  const crearVentaAsync = useAsync<any>();

  const cargarDatos = async () => {
    try {
      // start a watchdog timer in case the initial load hangs
      let timer: any | null = null;
      timer = setTimeout(() => {
        if (initAsync.loading) {
          console.error('Carga inicial tardó demasiado — forzando reset de estado de carga');
          initAsync.reset();
          setError('La carga tardó demasiado. Intenta recargar la página.');
        }
      }, 15000);

      await initAsync.execute(async () => {
        const [productosData, ventasData, unidadesData] = await Promise.all([
          getProductos(),
          getVentas(),
          getUnidadesMedidas(),
        ]);
        setProductos(productosData);
        setUnidadesMedida(unidadesData || []);
        setVentas(ventasData);
        setError(null);
      });
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    } catch (err) {
      console.error('❌ Error al cargar los datos:', err);
      setError('Error al cargar los datos: ' + (err as Error).message);
    }
  };

  // Handler genérico para togglear flags booleanos de venta ('estado' o 'baja')
  const handleToggleVentaFlag = (id_venta: number, field: 'estado' | 'baja', currentValue: boolean, label?: string) => {
    const title = field === 'estado' ? (currentValue ? 'Marcar como pendiente' : 'Marcar como pagada') : (currentValue ? 'Dar de alta venta' : 'Dar de baja venta');
    const actionText = field === 'estado' ? (currentValue ? 'pendiente' : 'pagada') : (currentValue ? 'dar de alta' : 'dar de baja');

    showConfirm(
      title,
      `¿Seguro que quieres ${actionText} ${label ?? ('#' + id_venta)}?`,
      async () => {
        try {
          const updated = await updateVentaFlag(id_venta, field, !currentValue);
          if (!updated) {
            showError(`No se encontró la venta #${id_venta}`);
            return;
          }
          await cargarDatos();
          showSuccess(`Venta ${updated.id_venta} actualizada correctamente`);
        } catch (err) {
          console.error(`Error al actualizar ${field} de venta:`, err);
          const e: any = err;
          const message = e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
          showError(message || `No se pudo actualizar el campo ${field} de la venta`);
        }
      },
      'warning'
    );
  };

  // Handlers para crear venta
  const handleNuevaVenta = async (items: { id_producto: number; cantidad: number; precioUnitario: number; }[], pagada: boolean) => {
    try {
      const fecha = new Date().toISOString().split('T')[0];
      await crearVentaAsync.execute(() => createVenta(fecha, items, pagada));
  await cargarDatos();
  modalNuevaVenta.close();
      showSuccess('Venta registrada exitosamente');
    } catch (err) {
      showError('Error al registrar la venta');
      console.error(err);
    }
  };

  // NOTE: use handleToggleVentaFlag for toggling 'estado' as needed

  // Buscar ventas con filtros (fechas, estado y baja)
  const handleBuscarVentas = async (opts?: { desde?: string; hasta?: string; estado?: boolean; baja?: boolean }) => {
    try {
      const results = await buscarVentasAsync.execute(() => buscarVentas(opts));
      setVentas(results || []);
    } catch (err) {
      console.error('Error al buscar ventas:', err);
      const e: any = err;
      const message = e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
      showError(message || 'Error buscando ventas');
    } finally {
    }
  };

  // Handlers para crear producto
  const handleNuevoProducto = async (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number; estado: boolean}) => {
    try {
      await crearProductoAsync.execute(() => createProducto({
        nombre: producto.nombre,
        descripcion: producto.descripcion || null,
        stock: producto.stock,
        costo: producto.costo,
        precioventa: producto.precioventa,
        id_unidad_medida: producto.unidadMedida,
        estado: producto.estado,
      }));
  await cargarDatos();
  modalNuevoProducto.close();
      showSuccess('Producto agregado exitosamente');
    } catch (err) {
      showError('Error al agregar el producto');
      console.error(err);
    }
  };

  // Buscar productos a partir de texto (desde ProductosPage)
  const handleBuscarProductos = async (texto: string) => {
    try {
      // opcional: podrías mostrar un loader local si quieres
      const results = await buscarProductosAsync.execute(() => buscarProductos(texto));
      setProductos(results || []);
    } catch (err) {
      console.error('Error al buscar productos:', err);
      const e: any = err;
      const message = e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
      showError(message || 'Error buscando productos');
    }
  };

  // Handler para editar un producto existente
  const handleEditarProducto = async (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number; estado: boolean}) => {
    if (!productToEdit) return;
    try {
      const updated = await editarProductoAsync.execute(() => updateProducto(productToEdit.id_producto, {
        nombre: producto.nombre,
        descripcion: producto.descripcion || null,
        stock: producto.stock,
        costo: producto.costo,
        precioventa: producto.precioventa,
        id_unidad_medida: producto.unidadMedida,
        estado: producto.estado,
      }));
      if (!updated) {
        showError('No se pudo actualizar el producto');
        return;
      }
  await cargarDatos();
  modalNuevoProducto.close();
  setProductToEdit(null);
      showSuccess('Producto actualizado exitosamente');
    } catch (err) {
      showError('Error al actualizar el producto');
      console.error(err);
    }
  };

  const openEditarProducto = (producto: any) => {
    setProductToEdit(producto);
    modalNuevoProducto.open();
  };

  // Handler para activar/desactivar producto con confirmación
  const handleToggleProductoEstado = (id_producto: number, currentEstado: boolean, nombre?: string) => {
    showConfirm(
      currentEstado ? 'Dar de baja producto' : 'Dar de alta producto',
      `¿Seguro que quieres ${currentEstado ? 'dar de baja' : 'dar de alta'} el producto ${nombre ?? '#'+id_producto}?`,
      async () => {
        try {
          const updated = await updateProductoEstado(id_producto, !currentEstado);
          if (!updated) {
            showError(`No se encontró el producto #${id_producto}`);
            return;
          }
          await cargarDatos();
          showSuccess(`Producto ${updated.nombre} actualizado correctamente`);
        } catch (err) {
          console.error('Error al actualizar estado de producto:', err);
          const e: any = err;
          const message = e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
          showError(message || 'No se pudo actualizar el estado del producto');
        }
      },
      'warning'
    );
  };

  // Handlers para actualizar stock
const handleActualizarStock = async (productoId: number, cantidad: number) => {
  try {
    const producto = productos.find(p => p.id_producto === productoId);
    if (!producto) return;

    const nuevoStock = producto.stock + cantidad;
    
    await actualizarStockAsync.execute(() => updateStockProducto(productoId, nuevoStock));
    modalActualizarStock.close();  // ✅ Cerrar modal ANTES de recargar
    await cargarDatos();  // ✅ Recargar datos
    
    showSuccess(`Stock actualizado: ${producto.nombre} ahora tiene ${nuevoStock} unidades`);
  } catch (err) {
    showError('Error al actualizar el stock');
    console.error(err);
  }
};

  if (initAsync.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={cargarDatos}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="main-content">
        {activeSection === 'ventas' && (
          <VentasPage 
            ventas={ventas} 
            onNuevaVenta={modalNuevaVenta.open}
            onToggleVentaFlag={handleToggleVentaFlag}
            onSearch={handleBuscarVentas}
          />
        )}
        
        {activeSection === 'productos' && (
          <ProductosPage 
            productos={productos} 
            onNuevoProducto={modalNuevoProducto.open}
            onEditarProducto={openEditarProducto}
            onToggleProductoEstado={(id, estado, nombre) => handleToggleProductoEstado(id, estado, nombre)}
            onSearch={handleBuscarProductos}
            searchLoading={buscarProductosAsync.loading}
          />
        )}
        
        {activeSection === 'stock' && (
          <StockPage 
            productos={productos} 
            onActualizarStock={modalActualizarStock.open}
          />
        )}
      </main>

      {/* Modales */}
      <ModalNuevaVenta
        isOpen={modalNuevaVenta.isOpen}
        onClose={modalNuevaVenta.close}
        productos={productos}
        onSubmit={handleNuevaVenta}
        // Pasa las funciones de toast y confirm a los modales
        showToast={showSuccess}
        showError={showError}
        showWarning={showWarning}
        showConfirm={showConfirm}
        loading={crearVentaAsync.loading}
      />

      <ModalNuevoProducto
        isOpen={modalNuevoProducto.isOpen}
        unidadesMedida={unidadesMedida}
        onClose={() => { modalNuevoProducto.close(); setProductToEdit(null); }}
        onSubmit={productToEdit ? handleEditarProducto : handleNuevoProducto}
        initialProduct={productToEdit}
        showError={showError}
        showWarning={showWarning}
        loading={productToEdit ? editarProductoAsync.loading : crearProductoAsync.loading}
      />

      <ModalActualizarStock
        isOpen={modalActualizarStock.isOpen}
        onClose={modalActualizarStock.close}
        productos={productos}
        onSubmit={handleActualizarStock}
        showError={showError}
        showWarning={showWarning}
        loading={actualizarStockAsync.loading}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        onClose={hideConfirm}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
      />
    </div>
  );
}

export default App;