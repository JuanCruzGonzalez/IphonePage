import { useState, useEffect } from 'react';
import './App.css';
import { Producto, VentaConDetalles, UnidadMedida } from './types';
import {
  getProductos,
  createProducto,
  updateStockProducto,
  getVentas,
  createVenta,
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
  const handleNuevaVenta = async (items: { id_producto: number; cantidad: number }[]) => {
    try {
      const fecha = new Date().toISOString().split('T')[0];
      await createVenta(fecha, items);
      await cargarDatos();
      setModalNuevaVenta(false);
      showSuccess('Venta registrada exitosamente');
    } catch (err) {
      showError('Error al registrar la venta');
      console.error(err);
    }
  };

  // Handlers para crear producto
  const handleNuevoProducto = async (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number}) => {
    try {
      await createProducto({
        nombre: producto.nombre,
        descripcion: producto.descripcion || null,
        stock: producto.stock,
        costo: producto.costo,
        precioventa: producto.precioventa,
        id_unidad_medida: producto.unidadMedida,
      });
      await cargarDatos();
      setModalNuevoProducto(false);
      showSuccess('Producto agregado exitosamente');
    } catch (err) {
      showError('Error al agregar el producto');
      console.error(err);
    }
  };

  // Handlers para actualizar stock
  const handleActualizarStock = async (productoId: number, cantidad: number) => {
    try {
      const producto = productos.find(p => p.id_producto === productoId);
      if (!producto) return;

      await updateStockProducto(productoId, producto.stock + cantidad);
      await cargarDatos();
      setModalActualizarStock(false);
      showSuccess(`Stock actualizado: ${producto.nombre} ahora tiene ${producto.stock + cantidad} unidades`);
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
          />
        )}
        
        {activeSection === 'productos' && (
          <ProductosPage 
            productos={productos} 
            onNuevoProducto={() => setModalNuevoProducto(true)}
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
        onClose={() => setModalNuevoProducto(false)}
        onSubmit={handleNuevoProducto}
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