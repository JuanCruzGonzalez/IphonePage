import React, { useState } from 'react';
import { ModalActualizarStock } from './componentes/ModalActualizarStock';
import { useProductos } from '../productos/context/ProductosContext';
import { Pagination } from '../../shared/components/Pagination';
import Page from '../../shared/components/Page';
import Card from '../../shared/components/Card';
import TablaStock from './componentes/TablaStock';
import EstadisticasStock from './componentes/EstadisticasStock';
import PageHeader from '../../shared/components/PageHeader';

interface StockPageProps { }

export const StockPage: React.FC<StockPageProps> = () => {
  const { productosActivos, modalActualizarStock } = useProductos();
  const productos = productosActivos;
  const onActualizarStock = modalActualizarStock.open;

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const productosOrdenados = [...productos].sort((a, b) => a.stock - b.stock);
  const stockBajo = productos.filter(p => p.stock < 10);


  // Paginación
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const productosPaginados = productosOrdenados.slice(startIndex, endIndex);
  return (
    <Page>
      <PageHeader title="Stock" subtitle="Monitorea el inventario de productos" funcion={onActualizarStock} textButton="+ Actualizar Stock" />

      <EstadisticasStock stockBajo={stockBajo} productos={productos} />

      <Pagination
        currentPage={currentPage}
        totalItems={productosOrdenados.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
      <Card>
        <TablaStock productosPaginados={productosPaginados} />
      </Card>
      <Pagination
        currentPage={currentPage}
        totalItems={productosOrdenados.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
      {/* Alerta de stock bajo */}
      {stockBajo.length > 0 && (
        <div className="alert alert-warning">
          <strong>⚠️ Atención:</strong> {stockBajo.length} producto(s) con stock bajo requieren reposición.
        </div>
      )}
        <ModalActualizarStock />
    </Page>
  );
};