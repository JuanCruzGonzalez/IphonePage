import { useState, useEffect } from 'react';
import './App.css';
import './ToastStyles.css';
import { Producto, VentaConDetalles, UnidadMedida, Promocion, DetalleVentaInput, PromocionConDetalles, Gasto } from './types';
import {
  createVenta,
  reactivarVenta,
  updateVentaBaja,
  getVentasPage,
} from './api/ventaService';
import {
  
  getProductosActivos,
  getProductosPage,
  createProducto,
  updateStockProducto,
  getUnidadesMedidas,
  updateProducto,
  updateProductoEstado,
} from './api/productoService';
import { getPromocionesActivas, getPromociones,updatePromocion, deletePromocion, getDetallePromocion } from './api/promocionService';
import { getGastos, createGasto, updateGasto, updateGastoEstado } from './api/gastoService';
import ModalVerPromocion from './components/ModalVerPromocion';
import { Sidebar } from './components/Sidebar';
import { VentasPage } from './pages/VentasPage';
import { ProductosPage } from './pages/ProductosPage';
import { StockPage } from './pages/StockPage';
import { PromocionesPage } from './pages/PromocionesPage';
import { GastosPage } from './pages/GastosPage';
import { ModalNuevaVenta } from './components/ModalNuevaVenta';
import { ModalNuevoProducto } from './components/ModalNuevoProducto';
import { ModalActualizarStock } from './components/ModalActualizarStock';
import { ModalCrearPromocion } from './components/ModalCrearPromocion';
import { ModalGasto } from './components/ModalGasto';
import { Toast, ConfirmModal } from './components/ToastModal';
import { useToast, useConfirm } from './hooks/useToast';
import { useDisableWheelOnNumberInputs } from './hooks/useDisableWheelOnNumberInputs';
import { useModal } from './hooks/useModal';
import { useAsync } from './hooks/useAsync';
import { createPromocion } from './api/promocionService';

function App() {
  const [activeSection, setActiveSection] = useState<'ventas' | 'productos' | 'stock' | 'promociones' | 'gastos'>('ventas');
  const [ventas, setVentas] = useState<VentaConDetalles[]>([]);
  const [ventasPageNum, setVentasPageNum] = useState(1);
  const [ventasTotal, setVentasTotal] = useState(0);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosPageNum, setProductosPageNum] = useState(1);
  const [productosTotal, setProductosTotal] = useState(0);
  const PAGE_SIZE = 8;
  const VENTAS_PAGE_SIZE = 8;
  const [productosActivos, setProductosActivos] = useState<Producto[]>([]);
  const [promocionesActivas, setPromocionesActivas] = useState<Promocion[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [promocionToEdit, setPromocionToEdit] = useState<PromocionConDetalles | null>(null);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [gastoToEdit, setGastoToEdit] = useState<Gasto | null>(null);
  const modalCrearPromocion = useModal(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const modalNuevaVenta = useModal(false);
  const modalNuevoProducto = useModal(false);
  const [productToEdit, setProductToEdit] = useState<null | any>(null);
  const modalActualizarStock = useModal(false);
  const modalGasto = useModal(false);

  // Hooks para toast y confirmación
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();

  // Deshabilitar comportamiento de la rueda sobre inputs number (global)
  useDisableWheelOnNumberInputs();

  useEffect(() => {
    cargarDatos();
  }, []);

  const initAsync = useAsync<void>();
  const buscarProductosAsync = useAsync<any[]>();
  const crearProductoAsync = useAsync<any>();
  const editarProductoAsync = useAsync<any>();
  const actualizarStockAsync = useAsync<any>();
  const crearVentaAsync = useAsync<any>();
  const crearPromocionAsync = useAsync<any>();
  const editarPromocionAsync = useAsync<any>();
  const eliminarPromocionAsync = useAsync<any>();
  const verPromocionAsync = useAsync<any>();
  const modalVerPromocion = useModal(false);
  const [promocionVista, setPromocionVista] = useState<Promocion | null>(null);
  const [promocionVistaDetalles, setPromocionVistaDetalles] = useState<any[]>([]);

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
        // Load first page of productos (with total) and first page of ventas, plus other data in parallel
        const productosPagePromise = getProductosPage(1, PAGE_SIZE, '');
        const ventasPagePromise = getVentasPage(1, VENTAS_PAGE_SIZE, { baja: false });
        const othersPromise = Promise.all([
          getProductosActivos(),
          getUnidadesMedidas(),
          getPromocionesActivas(),
          getPromociones(),
          getGastos(),
        ]);

        const [productosPageResult, ventasPageResult, [productosActivosData, unidadesData, promocionesActivasData, promocionesData, gastosData]] = await Promise.all([
          productosPagePromise,
          ventasPagePromise,
          othersPromise,
        ]);

        setProductos(productosPageResult.productos);
        setProductosTotal(productosPageResult.total);
        setProductosPageNum(1);
        setProductosActivos(productosActivosData);
        setUnidadesMedida(unidadesData || []);
        setVentas(ventasPageResult.ventas || []);
        setVentasTotal(ventasPageResult.total || 0);
        setVentasPageNum(1);
        setPromocionesActivas(promocionesActivasData || []);
        setPromociones(promocionesData || []);
        setGastos(gastosData || []);
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

  // Load a specific page of productos (with optional search filter q)
  const loadProductosPage = async (page = 1, q = '') => {
    try {
      const { productos: pageRows, total } = await getProductosPage(page, PAGE_SIZE, q);
      console.debug('[loadProductosPage] page=', page, 'pageSize=', PAGE_SIZE, 'returned=', (pageRows || []).length, 'total=', total);
      setProductos(pageRows || []);
      setProductosTotal(total || 0);
      setProductosPageNum(page);
    } catch (err) {
      console.error('Error cargando página de productos:', err);
      showError('Error cargando productos');
    }
  };

  const handleToggleVentaFlag = (
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
          
          if (field === 'baja' && currentValue === true) {
            updated = await reactivarVenta(id_venta);
          }

          if (field === 'baja' && !currentValue === true) {
            console.log('⏺️ Marcando venta como pendiente mediante updateVentaBaja');
            updated = await updateVentaBaja(id_venta, !currentValue);
          }

          if (!updated) {
            showError(`No se encontró la venta #${id_venta}`);
            return;
          }

          await cargarDatos();
          showSuccess(`Venta ${updated.id_venta} actualizada correctamente`);
        } catch (err) {
          console.error(`Error al actualizar ${field} de venta:`, err);
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
  };


  // Handlers para crear venta
  const handleNuevaVenta = async (items: DetalleVentaInput[], pagada: boolean) => {
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

  const handleCrearPromocion = async (payload: { name: string; precio: number | null; productos: { id_producto: number; cantidad: number }[]; estado: boolean }) => {
    try {
      if (promocionToEdit) {
        // Edit flow
        await editarPromocionAsync.execute(() => updatePromocion(promocionToEdit.id_promocion, payload.name, payload.precio, payload.productos, payload.estado));
        setPromocionToEdit(null);
        showSuccess('Promoción actualizada correctamente');
      } else {
        await crearPromocionAsync.execute(() => createPromocion(payload.name, payload.precio, payload.productos, payload.estado));
        showSuccess('Promoción creada correctamente');
      }
      await cargarDatos();
      modalCrearPromocion.close();
    } catch (err) {
      console.error('Error creando/actualizando promocion:', err);
      showError('Error al crear o actualizar la promoción');
    }
  };

  const handleEditarPromocion = async (promocion: Promocion) => {
    try {
      const detalles = await getDetallePromocion(promocion.id_promocion);
      const productosConCantidad = (detalles || []).map((d: any) => ({ id_producto: d.id_producto, cantidad: d.cantidad }));
      setPromocionToEdit({ ...promocion, productos: productosConCantidad });
      modalCrearPromocion.open();
    } catch (err) {
      console.error('Error cargando detalle promocion para editar:', err);
      showError('No se pudo cargar los detalles de la promoción');
    }
  };

  const handleChangePromocion = async (id_promocion: number, estado: boolean) => {
    showConfirm(
      estado ? 'Dar de alta promoción' : 'Dar de baja promoción',
      `¿Seguro que quieres ${estado ? 'dar de alta' : 'dar de baja'} la promoción #${id_promocion}?`,
      async () => {
        try {
          await eliminarPromocionAsync.execute(() => deletePromocion(id_promocion, estado));
          await cargarDatos();
          showSuccess(`Promoción ${estado ? 'dada de alta' : 'dada de baja'} correctamente`);
        } catch (err) {
          console.error('Error eliminando promocion:', err);
          showError('No se pudo eliminar la promoción');
        }
      },
      estado ? 'info' : 'danger'
    );
  };

  const handleVerPromocion = async (promocion: Promocion) => {
    try {
      const detalles = await verPromocionAsync.execute(() => getDetallePromocion(promocion.id_promocion));
      setPromocionVista(promocion);
      setPromocionVistaDetalles(detalles || []);
      modalVerPromocion.open();
    } catch (err) {
      console.error('Error al cargar detalles de promocion:', err);
      showError('No se pudieron cargar los detalles de la promoción');
    }
  };

  // NOTE: use handleToggleVentaFlag for toggling 'estado' as needed

  // Buscar ventas con filtros (fechas, estado y baja)
  const handleBuscarVentas = async (opts?: { desde?: string; hasta?: string; estado?: boolean; baja?: boolean }) => {
    try {
      // Ensure default is baja=false unless explicitly requested
      const safeOpts = { ...(opts || {}), baja: typeof opts?.baja === 'boolean' ? opts!.baja : false };
      // Use paginated API for search results (reset to page 1)
      const { ventas: pageRows, total } = await getVentasPage(1, VENTAS_PAGE_SIZE, safeOpts);
      setVentas(pageRows || []);
      setVentasTotal(total || 0);
      setVentasPageNum(1);
    } catch (err) {
      console.error('Error al buscar ventas:', err);
      const e: any = err;
      const message = e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
      showError(message || 'Error buscando ventas');
    } finally {
    }
  };

  // Load a specific page of ventas (with optional filters)
  const loadVentasPage = async (page = 1, opts?: { desde?: string; hasta?: string; estado?: boolean; baja?: boolean }) => {
    try {
      const safeOpts = { ...(opts || {}), baja: typeof opts?.baja === 'boolean' ? opts!.baja : false };
      const { ventas: pageRows, total } = await getVentasPage(page, VENTAS_PAGE_SIZE, safeOpts);
      console.debug('[loadVentasPage] page=', page, 'pageSize=', VENTAS_PAGE_SIZE, 'returned=', (pageRows || []).length, 'total=', total);
      setVentas(pageRows || []);
      setVentasTotal(total || 0);
      setVentasPageNum(page);
    } catch (err) {
      console.error('Error cargando página de ventas:', err);
      showError('Error cargando ventas');
    }
  };

  // Handlers para crear producto
  const handleNuevoProducto = async (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number; estado: boolean; vencimiento?: Date | null }) => {
    try {
      await crearProductoAsync.execute(() => createProducto({
        nombre: producto.nombre,
        descripcion: producto.descripcion || null,
        stock: producto.stock,
        costo: producto.costo,
        precioventa: producto.precioventa,
        id_unidad_medida: producto.unidadMedida,
        estado: producto.estado,
        vencimiento: producto.vencimiento || undefined,
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
      // Use paginated API for searches as well (reset to page 1)
      const { productos: pageRows, total } = await getProductosPage(1, PAGE_SIZE, texto);
      setProductos(pageRows || []);
      setProductosTotal(total || 0);
      setProductosPageNum(1);
    } catch (err) {
      console.error('Error al buscar productos:', err);
      const e: any = err;
      const message = e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
      showError(message || 'Error buscando productos');
    }
  };

  // Handler para editar un producto existente
  const handleEditarProducto = async (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number; estado: boolean; vencimiento?: Date | null }) => {
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
        vencimiento: producto.vencimiento || undefined,
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
      `¿Seguro que quieres ${currentEstado ? 'dar de baja' : 'dar de alta'} el producto ${nombre ?? '#' + id_producto}?`,
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
      console.error(err);
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
          console.error(err);
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
    <div className="app-container">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="main-content">
        {activeSection === 'ventas' && (
          <VentasPage
            ventas={ventas}
            gastos={gastos}
            total={ventasTotal}
            page={ventasPageNum}
            pageSize={VENTAS_PAGE_SIZE}
            onPageChange={(p, opts) => loadVentasPage(p, opts)}
            onNuevaVenta={modalNuevaVenta.open}
            onToggleVentaFlag={handleToggleVentaFlag}
            onSearch={handleBuscarVentas}
          />
        )}

        {activeSection === 'productos' && (
          <ProductosPage
            productos={productos}
            total={productosTotal}
            page={productosPageNum}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => loadProductosPage(p)}
            onNuevoProducto={modalNuevoProducto.open}
            onEditarProducto={openEditarProducto}
            onToggleProductoEstado={(id, estado, nombre) => handleToggleProductoEstado(id, estado, nombre)}
            onSearch={handleBuscarProductos}
            searchLoading={buscarProductosAsync.loading}
          />
        )}

        {activeSection === 'stock' && (
          <StockPage
            productos={productosActivos}
            onActualizarStock={modalActualizarStock.open}
          />
        )}
        {activeSection === 'promociones' && (
          <PromocionesPage
            promociones={promociones}
            onNuevoPromocion={modalCrearPromocion.open}
            onEditPromocion={handleEditarPromocion}
            onChangePromocion={handleChangePromocion}
            onViewPromocion={handleVerPromocion}
          />
        )}
        {activeSection === 'gastos' && (
          <GastosPage
            gastos={gastos}
            onNuevoGasto={handleNuevoGasto}
            onEditarGasto={handleEditarGasto}
            onToggleEstado={handleToggleGastoEstado}
          />
        )}
      </main>

      {/* Modales */}
      <ModalNuevaVenta
        isOpen={modalNuevaVenta.isOpen}
        onClose={modalNuevaVenta.close}
        productos={productosActivos}
        promociones={promocionesActivas}
        onSubmit={handleNuevaVenta}
        // Pasa las funciones de toast y confirm a los modales
        showToast={showSuccess}
        showError={showError}
        showWarning={showWarning}
        showConfirm={showConfirm}
        loading={crearVentaAsync.loading}
      />

      <ModalCrearPromocion
        isOpen={modalCrearPromocion.isOpen}
        onClose={modalCrearPromocion.close}
        productos={productos}
        initialPromotion={promocionToEdit ? { ...promocionToEdit, productos: promocionToEdit.productos ?? [] } : undefined}
        onSubmit={handleCrearPromocion}
        showError={showError}
        showWarning={showWarning}
        loading={crearPromocionAsync.loading}
      />

      <ModalVerPromocion
        isOpen={modalVerPromocion.isOpen}
        onClose={() => { modalVerPromocion.close(); setPromocionVista(null); setPromocionVistaDetalles([]); }}
        promocion={promocionVista}
        detalles={promocionVistaDetalles}
        productosCatalogo={productos}
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

      <ModalGasto
        isOpen={modalGasto.isOpen}
        onClose={() => { modalGasto.close(); setGastoToEdit(null); }}
        onSubmit={handleSubmitGasto}
        initialGasto={gastoToEdit}
        loading={gastoToEdit ? actualizarGastoAsync.loading : crearGastoAsync.loading}
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