import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import './core/styles/app.css';
import './core/styles/toast.css';
import { UnidadMedida, Gasto, Categoria } from './core/types';
import {
  getProductosActivos,
  getUnidadesMedidas,
} from './features/productos/services/productoService';
import { getPromocionesActivas } from './features/promociones/services/promocionService';
import { getGastos, createGasto, updateGasto, updateGastoEstado } from './features/gastos/services/gastoService';
import { getCategorias, createCategoria, updateCategoria, updateCategoriaEstado } from './features/categorias/services/categoriaService';
import { Sidebar } from './shared/components/Sidebar';
import { VentasPage } from './features/ventas/VentasPage';
import { ProductosPage } from './features/productos/ProductosPage';
import { ProductosProvider } from './features/productos/context/ProductosContext';
import { VentasProvider } from './features/ventas/context/VentasContext';
import { PromocionesProvider } from './features/promociones/context/PromocionesContext';
import { StockPage } from './features/stock/StockPage';
import { PromocionesPage } from './features/promociones/PromocionesPage';
import { GastosPage } from './features/gastos/GastosPage';
import { CategoriasPage } from './features/categorias/CategoriasPage';
import { ModalNuevaVenta } from './features/ventas/components/ModalNuevaVenta';
import { ModalNuevoProducto } from './features/productos/components/ModalNuevoProducto';
import { ModalActualizarStock } from './features/productos/components/ModalActualizarStock';
import { ModalCrearPromocion } from './features/promociones/components/ModalCrearPromocion';
import ModalVerPromocion from './features/promociones/components/ModalVerPromocion';
import { ModalGasto } from './features/gastos/components/ModalGasto';
import { ModalCategoria } from './features/categorias/components/ModalCategoria';
import { Toast, ConfirmModal } from './shared/components/ToastModal';
import { useToast, useConfirm } from './shared/hooks/useToast';
import { useDisableWheelOnNumberInputs } from './shared/hooks/useDisableWheelOnNumberInputs';
import { useModal } from './shared/hooks/useModal';
import { useAsync } from './shared/hooks/useAsync';

function App() {
  const [activeSection, setActiveSection] = useState<'ventas' | 'productos' | 'stock' | 'promociones' | 'gastos' | 'categorias'>('ventas');
  const [productosActivos, setProductosActivos] = useState<any[]>([]); // Para modales
  const [promocionesActivas, setPromocionesActivas] = useState<any[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [gastoToEdit, setGastoToEdit] = useState<Gasto | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const modalGasto = useModal(false);
  const modalCategoria = useModal(false);

  // Hooks para toast y confirmación
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();

  // Deshabilitar comportamiento de la rueda sobre inputs number (global)
  useDisableWheelOnNumberInputs();

  useEffect(() => {
    cargarDatos();
  }, []);

  const initAsync = useAsync<void>();

  const cargarDatos = async () => {
    try {
      // start a watchdog timer in case the initial load hangs
      let timer: any | null = null;
      timer = setTimeout(() => {
        if (initAsync.loading) {
          initAsync.reset();
          setError('La carga tardó demasiado. Intenta recargar la página.');
        }
      }, 15000);

      await initAsync.execute(async () => {
        // Load initial data (ventas handled by VentasContext, productos handled by ProductosContext, promociones handled by PromocionesContext)
        const [productosActivosData, unidadesData, promocionesActivasData, gastosData, categoriasData] = await Promise.all([
          getProductosActivos(),
          getUnidadesMedidas(),
          getPromocionesActivas(),
          getGastos(),
          getCategorias(),
        ]);

        setProductosActivos(productosActivosData || []); // Para modales
        setUnidadesMedida(unidadesData || []);
        setPromocionesActivas(promocionesActivasData || []);
        setGastos(gastosData || []);
        setCategorias(categoriasData || []);
        setError(null);
      });
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    } catch (err) {
      setError('Error al cargar los datos: ' + (err as Error).message);
    }
  };

  // ============= HANDLERS GASTOS =============
  const crearGastoAsync = useAsync();
  const actualizarGastoAsync = useAsync();
  const toggleGastoEstadoAsync = useAsync();

  const handleNuevoGasto = () => {
    setGastoToEdit(null);
    modalGasto.open();
  };

  const handleEditarGasto = (gasto: Gasto) => {
    setGastoToEdit(gasto);
    modalGasto.open();
  };

  const handleSubmitGasto = async (costo: number, descripcion: string | null) => {
    try {
      if (gastoToEdit) {
        // Editar gasto existente
        await actualizarGastoAsync.execute(() => updateGasto(gastoToEdit.id_gasto, { costo, descripcion }));
        showSuccess('Gasto actualizado correctamente');
      } else {
        // Crear nuevo gasto
        await crearGastoAsync.execute(() => createGasto(costo, descripcion));
        showSuccess('Gasto creado correctamente');
      }
      modalGasto.close();
      const gastosData = await getGastos();
      setGastos(gastosData || []);
    } catch (err) {
      showError(gastoToEdit ? 'Error al actualizar el gasto' : 'Error al crear el gasto');
    }
  };

  const handleToggleGastoEstado = async (id_gasto: number, estadoActual: boolean, descripcion: string | null) => {
    const mensaje = estadoActual ? 'desactivar' : 'activar';
    const label = descripcion || `Gasto #${id_gasto}`;
    
    showConfirm(
      `¿${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)} gasto?`,
      `¿Estás seguro de ${mensaje} "${label}"?`,
      async () => {
        try {
          await toggleGastoEstadoAsync.execute(() => updateGastoEstado(id_gasto, !estadoActual));
          const gastosData = await getGastos();
          setGastos(gastosData || []);
          showSuccess(`Gasto ${estadoActual ? 'desactivado' : 'activado'} correctamente`);
        } catch (err) {
          showError(`Error al ${mensaje} el gasto`);
        }
      },
      estadoActual ? 'danger' : 'info'
    );
  };

  // Handlers para categorías
  const crearCategoriaAsync = useAsync();
  const actualizarCategoriaAsync = useAsync();
  const toggleCategoriaEstadoAsync = useAsync();

  const handleNuevaCategoria = () => {
    setCategoriaToEdit(null);
    modalCategoria.open();
  };

  const handleEditarCategoria = (categoria: Categoria) => {
    setCategoriaToEdit(categoria);
    modalCategoria.open();
  };

  const handleSubmitCategoria = async (nombre: string, id_categoria_padre?: number | null) => {
    try {
      if (categoriaToEdit) {
        // Editar categoría existente
        await actualizarCategoriaAsync.execute(() => updateCategoria(categoriaToEdit.id_categoria, { nombre, id_categoria_padre }));
        showSuccess('Categoría actualizada correctamente');
      } else {
        // Crear nueva categoría
        await crearCategoriaAsync.execute(() => createCategoria(nombre, id_categoria_padre));
        showSuccess('Categoría creada correctamente');
      }
      modalCategoria.close();
      const categoriasData = await getCategorias();
      setCategorias(categoriasData || []);
    } catch (err) {
      showError(categoriaToEdit ? 'Error al actualizar la categoría' : 'Error al crear la categoría');
    }
  };

  const handleToggleCategoriaEstado = async (id_categoria: number, estadoActual: boolean, nombre: string) => {
    const mensaje = estadoActual ? 'desactivar' : 'activar';
    
    showConfirm(
      `¿${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)} categoría?`,
      `¿Estás seguro de ${mensaje} "${nombre}"?`,
      async () => {
        try {
          await toggleCategoriaEstadoAsync.execute(() => updateCategoriaEstado(id_categoria, !estadoActual));
          const categoriasData = await getCategorias();
          setCategorias(categoriasData || []);
          showSuccess(`Categoría ${estadoActual ? 'desactivada' : 'activada'} correctamente`);
        } catch (err) {
          showError(`Error al ${mensaje} la categoría`);
        }
      },
      estadoActual ? 'danger' : 'info'
    );
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
    <QueryClientProvider client={queryClient}>
      <VentasProvider
        showSuccess={showSuccess}
        showError={showError}
        showConfirm={showConfirm}
      >
        <ProductosProvider
          showSuccess={showSuccess}
          showError={showError}
          showWarning={showWarning}
          showConfirm={showConfirm}
        >
          <PromocionesProvider
            showSuccess={showSuccess}
            showError={showError}
            showWarning={showWarning}
            showConfirm={showConfirm}
          >
          <div className="app-container">
            <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

            <main className="main-content">
              {activeSection === 'ventas' && (
                <VentasPage gastos={gastos} />
              )}

              {activeSection === 'productos' && <ProductosPage />}

              {activeSection === 'stock' && <StockPage />}

              {activeSection === 'promociones' && <PromocionesPage />}
            {activeSection === 'gastos' && (
              <GastosPage
                gastos={gastos}
                onNuevoGasto={handleNuevoGasto}
                onEditarGasto={handleEditarGasto}
                onToggleEstado={handleToggleGastoEstado}
              />
            )}
            {activeSection === 'categorias' && (
              <CategoriasPage
                categorias={categorias}
                onNuevaCategoria={handleNuevaCategoria}
                onEditarCategoria={handleEditarCategoria}
                onToggleEstado={handleToggleCategoriaEstado}
              />
            )}
          </main>

          {/* Modales */}
          <ModalNuevaVenta
            productos={productosActivos}
            promociones={promocionesActivas}
            showError={showError}
            showWarning={showWarning}
          />

        <ModalCrearPromocion
          productos={productosActivos}
          showWarning={showWarning}
        />

        <ModalVerPromocion
          productosCatalogo={productosActivos}
        />

        <ModalNuevoProducto
          categorias={categorias}
          unidadesMedida={unidadesMedida}
        />

        <ModalActualizarStock />

        <ModalGasto
          isOpen={modalGasto.isOpen}
          onClose={() => { modalGasto.close(); setGastoToEdit(null); }}
          onSubmit={handleSubmitGasto}
          initialGasto={gastoToEdit}
          loading={gastoToEdit ? actualizarGastoAsync.loading : crearGastoAsync.loading}
        />

        <ModalCategoria
          isOpen={modalCategoria.isOpen}
          onClose={() => { modalCategoria.close(); setCategoriaToEdit(null); }}
          onSubmit={handleSubmitCategoria}
          initialCategoria={categoriaToEdit}
          categorias={categorias}
          loading={categoriaToEdit ? actualizarCategoriaAsync.loading : crearCategoriaAsync.loading}
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
        </PromocionesProvider>
      </ProductosProvider>
      </VentasProvider>
      
      {/* React Query Devtools - Solo en desarrollo, se elimina automáticamente en producción */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;