import { useState, useEffect } from 'react';
import './App.css';
import { Producto, VentaConDetalles } from './types';
import {
  testConnection,
  getProductos,
  createProducto,
  updateStockProducto,
  getVentas,
  createVenta,
} from './api/ventaService';
import { Sidebar } from './components/Sidebar';
import { VentasPage } from './pages/VentasPage';
import { ProductosPage } from './pages/ProductosPage';
import { StockPage } from './pages/StockPage';
import { ModalNuevaVenta, ModalNuevoProducto, ModalActualizarStock } from './components/Modals';

function App() {
  const [activeSection, setActiveSection] = useState<'ventas' | 'productos' | 'stock'>('ventas');
  const [ventas, setVentas] = useState<VentaConDetalles[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const [modalNuevaVenta, setModalNuevaVenta] = useState(false);
  const [modalNuevoProducto, setModalNuevoProducto] = useState(false);
  const [modalActualizarStock, setModalActualizarStock] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      console.log('🔌 Verificando conexión a Supabase...');
      const conexionOk = await testConnection();
      
      if (!conexionOk) {
        setError('No se pudo conectar a Supabase. Verifica tus credenciales.');
        setLoading(false);
        return;
      }

      console.log('📥 Cargando datos...');
      const [productosData, ventasData] = await Promise.all([
        getProductos(),
        getVentas()
      ]);
      
      console.log('✅ Datos cargados:', {
        productos: productosData.length,
        ventas: ventasData.length
      });
      
      setProductos(productosData);
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
      alert('✓ Venta registrada exitosamente');
    } catch (err) {
      alert('Error al registrar la venta');
      console.error(err);
    }
  };

  // Handlers para crear producto
  const handleNuevoProducto = async (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; }) => {
    try {
      await createProducto({
        nombre: producto.nombre,
        descripcion: producto.descripcion || null,
        stock: producto.stock,
        costo: producto.costo,
        precioventa: producto.precioventa,
      });
      await cargarDatos();
      setModalNuevoProducto(false);
      alert('✓ Producto agregado exitosamente');
    } catch (err) {
      alert('Error al agregar el producto');
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
      alert(`✓ Stock actualizado: ${producto.nombre} ahora tiene ${producto.stock + cantidad} unidades`);
    } catch (err) {
      alert('Error al actualizar el stock');
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
      />

      <ModalNuevoProducto
        isOpen={modalNuevoProducto}
        onClose={() => setModalNuevoProducto(false)}
        onSubmit={handleNuevoProducto}
      />

      <ModalActualizarStock
        isOpen={modalActualizarStock}
        onClose={() => setModalActualizarStock(false)}
        productos={productos}
        onSubmit={handleActualizarStock}
      />
    </div>
  );
}

export default App;