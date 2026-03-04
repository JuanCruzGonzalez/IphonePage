import React, { useEffect } from 'react';
import { useDebounce } from '../../shared/hooks/useDebounce';
import { useProductos } from './context/ProductosContext';
import { Pagination } from '../../shared/components/Pagination';
import { ModalNuevoProducto } from './components/ModalNuevoProducto';
import { ModalActualizarStock } from '../stock/componentes/ModalActualizarStock';
import { useCategorias } from '../categorias/context/CategoriasContext';
import Page from '../../shared/components/Page';
import Card from '../../shared/components/Card';
import H1 from '../../shared/components/H1';
import SelectProductos from './components/selectProductos';
import TablaProductos from './components/TablaProductos';
import Buscador from './components/Buscador';
import EstadisticasGrid from './components/EstadisticasGrid';

export default function ProductosPage({accesorio}: {accesorio: boolean}) {
  const {
    productos,
    productosTotal,
    productosPageNum,
    productosSearchQuery,
    PAGE_SIZE,
    loadProductosPage,
    handleBuscarProductos,
    modalNuevoProducto,
    openEditarProducto,
    setTipoProductoActual,
  } = useProductos();

  const { categorias } = useCategorias();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  const handlerStatusFilterChange = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value);
  }

  const debounced = useDebounce(searchTerm, 300);

  // Establecer que estamos en accesorios al montar
  useEffect(() => {
    setTipoProductoActual(accesorio ? 'accesorio' : 'telefono');
  }, [setTipoProductoActual, accesorio]);

  useEffect(() => {
    if (debounced !== productosSearchQuery) {
      handleBuscarProductos(debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const stockBajo = productos.filter(p => p.stock < 10).length;

  return (
    <Page>
      <div className="page-header">
        <div>
          <H1 texto={accesorio ? 'Accesorios' : 'Teléfonos'} />
          <p className="page-subtitle">Administra tu catálogo de {accesorio ? 'accesorios' : 'teléfonos'}</p>
        </div>
        <button className="btn-primary" onClick={() => modalNuevoProducto.open()}>
          + Nuevo {accesorio ? 'Accesorio' : 'Teléfono'}
        </button>
      </div>

      <EstadisticasGrid productosTotal={productosTotal} stockBajo={stockBajo} accesorio={accesorio}/>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Buscador searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <SelectProductos statusFilter={statusFilter} handlerStatusFilterChange={handlerStatusFilterChange} />
      </div>
      <Pagination
        currentPage={productosPageNum}
        totalItems={productosTotal}
        pageSize={PAGE_SIZE}
        onPageChange={loadProductosPage}
      />
      <Card>
        <TablaProductos productos={productos} openEditarProducto={openEditarProducto} statusFilter={statusFilter} />
      </Card>
      <Pagination
        currentPage={productosPageNum}
        totalItems={productosTotal}
        pageSize={PAGE_SIZE}
        onPageChange={loadProductosPage}
      />

      {/* Modales */}
      <ModalNuevoProducto
        categorias={categorias}
      />
      <ModalActualizarStock />
    </Page>
  );
};
