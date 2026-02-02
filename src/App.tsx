import { useState, useEffect } from 'react';
import './App.css';
import './ToastStyles.css';
import { Producto, VentaConDetalles, UnidadMedida } from './types';
import {
  getProductos,
  createProducto,
  updateStockProducto,
  getVentas,
  createVenta,
  updateVentaEstado,
  updateProducto,
  updateProductoEstado,
  getUnidadesMedidas,
} from './api/ventaService';
import { Sidebar } from './components/Sidebar';
import { VentasPage } from './pages/VentasPage';
import { ProductosPage } from './pages/ProductosPage';
import { StockPage } from './pages/StockPage';
import { ModalNuevaVenta, ModalNuevoProducto, ModalActualizarStock } from './components/Modals';
import { Toast, ConfirmModal } from './components/ToastModal';
import { useToast, useConfirm } from './hooks/useToast';

function App() {
  const [activeSection, setActiveSection] = useState<'ventas' | 'productos' | 'stock'>('ventas');
  const [ventas, setVentas] = useState<VentaConDetalles[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const [modalNuevaVenta, setModalNuevaVenta] = useState(false);
  const [modalNuevoProducto, setModalNuevoProducto] = useState(false);
  const [productToEdit, setProductToEdit] = useState<null | any>(null);
  const [modalActualizarStock, setModalActualizarStock] = useState(false);

  // Hooks para toast y confirmación
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [productosData, ventasData, unidadesData] = await Promise.all([
        getProductos(),
        getVentas(),
        getUnidadesMedidas(),
      ]);
      
      setProductos(productosData);
      setUnidadesMedida(unidadesData || []);
      setVentas(ventasData);
      setError(null);
    } catch (err) {
      console.error('❌ Error al cargar los datos:', err);
      setError('Error al cargar los datos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para crear venta
  const handleNuevaVenta = async (items: { id_producto: number; cantidad: number; precioUnitario: number; }[], pagada: boolean) => {
    try {
      const fecha = new Date().toISOString().split('T')[0];
      await createVenta(fecha, items, pagada);
      await cargarDatos();
      setModalNuevaVenta(false);
      showSuccess('Venta registrada exitosamente');
    } catch (err) {
      showError('Error al registrar la venta');
      console.error(err);
    }
  };

  // Handler para marcar una venta como pagada/pendiente, con confirmación y manejo de errores
  const handleMarcarPagada = (id_venta: number, currentEstado: boolean) => {
    showConfirm(
      currentEstado ? 'Marcar como pendiente' : 'Marcar como pagada',
      `¿Seguro que quieres marcar la venta #${id_venta} como ${currentEstado ? 'pendiente' : 'pagada'}?`,
      async () => {
        try {
          const updated = await updateVentaEstado(id_venta, !currentEstado);
          if (!updated) {
            showError(`No se encontró la venta #${id_venta}`);
            return;
          }
          await cargarDatos();
          showSuccess(`Venta #${id_venta} actualizada correctamente`);
        } catch (err) {
          // Mejor logging del error y mensaje útil al usuario
          console.error('Error al actualizar estado de venta:', err);
          const e: any = err;
          const message = e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
          showError(message || 'No se pudo actualizar el estado de la venta');
        }
      },
      'warning'
    );
  };

  // Handlers para crear producto
  const handleNuevoProducto = async (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number; estado: boolean}) => {
    try {
      await createProducto({
        nombre: producto.nombre,
        descripcion: producto.descripcion || null,
        stock: producto.stock,
        costo: producto.costo,
        precioventa: producto.precioventa,
        id_unidad_medida: producto.unidadMedida,
        estado: producto.estado,
      });
      await cargarDatos();
      setModalNuevoProducto(false);
      showSuccess('Producto agregado exitosamente');
    } catch (err) {
      showError('Error al agregar el producto');
      console.error(err);
    }
  };

  // Handler para editar un producto existente
  const handleEditarProducto = async (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number; estado: boolean}) => {
    if (!productToEdit) return;
    try {
      await updateProducto(productToEdit.id_producto, {
        nombre: producto.nombre,
        descripcion: producto.descripcion || null,
        stock: producto.stock,
        costo: producto.costo,
        precioventa: producto.precioventa,
        id_unidad_medida: producto.unidadMedida,
        estado: producto.estado,
      });
      await cargarDatos();
      setModalNuevoProducto(false);
      setProductToEdit(null);
      showSuccess('Producto actualizado exitosamente');
    } catch (err) {
      showError('Error al actualizar el producto');
      console.error(err);
    }
  };

  const openEditarProducto = (producto: any) => {
    setProductToEdit(producto);
    setModalNuevoProducto(true);
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
    
    await updateStockProducto(productoId, nuevoStock);
    setModalActualizarStock(false);  // ✅ Cerrar modal ANTES de recargar
    
    await cargarDatos();  // ✅ Recargar datos
    
    showSuccess(`Stock actualizado: ${producto.nombre} ahora tiene ${nuevoStock} unidades`);
  } catch (err) {
    showError('Error al actualizar el stock');
    console.error(err);
  }
};

  if (loading) {
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
            onNuevaVenta={() => setModalNuevaVenta(true)}
            onTogglePago={handleMarcarPagada}
          />
        )}
        
        {activeSection === 'productos' && (
          <ProductosPage 
            productos={productos} 
            onNuevoProducto={() => setModalNuevoProducto(true)}
            onEditarProducto={openEditarProducto}
            onToggleProductoEstado={(id, estado, nombre) => handleToggleProductoEstado(id, estado, nombre)}
          />
        )}
        
        {activeSection === 'stock' && (
          <StockPage 
            productos={productos} 
            onActualizarStock={() => setModalActualizarStock(true)}
          />
        )}
      </main>

      {/* Modales */}
      <ModalNuevaVenta
        isOpen={modalNuevaVenta}
        onClose={() => setModalNuevaVenta(false)}
        productos={productos}
        onSubmit={handleNuevaVenta}
        // Pasa las funciones de toast y confirm a los modales
        showToast={showSuccess}
        showError={showError}
        showWarning={showWarning}
        showConfirm={showConfirm}
      />

      <ModalNuevoProducto
        isOpen={modalNuevoProducto}
        unidadesMedida={unidadesMedida}
        onClose={() => { setModalNuevoProducto(false); setProductToEdit(null); }}
        onSubmit={productToEdit ? handleEditarProducto : handleNuevoProducto}
        initialProduct={productToEdit}
        showError={showError}
        showWarning={showWarning}
      />

      <ModalActualizarStock
        isOpen={modalActualizarStock}
        onClose={() => setModalActualizarStock(false)}
        productos={productos}
        onSubmit={handleActualizarStock}
        showError={showError}
        showWarning={showWarning}
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