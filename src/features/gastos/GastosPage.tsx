import React, { useState } from 'react';
import { useGastos } from './context/GastosContext';
import { ModalGasto } from './components/ModalGasto';
import EstadisticasGrid from './components/EstadisticasGrid';
import Filtros from './components/Filtros';
import TablaGastos from './components/TablaGastos';

export const GastosPage: React.FC = () => {
  const {
    gastos,
    isLoading,
    gastoToEdit,
    modalGasto,
    handleNuevoGasto,
    handleEditarGasto,
    handleToggleGastoEstado,
    handleSubmitGasto
  } = useGastos();
  const [filtroEstado, setFiltroEstado] = useState<'all' | 'activo' | 'inactivo'>('all');

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando gastos...</p>
        </div>
      </div>
    );
  }

  const gastosFiltrados = gastos.filter(g => {
    if (filtroEstado === 'activo') return g.estado === true;
    if (filtroEstado === 'inactivo') return g.estado === false;
    return true;
  });

  const handleFiltroChange = (value: 'all' | 'activo' | 'inactivo') => {
    setFiltroEstado(value);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gastos</h1>
          <p className="page-subtitle">Gestiona los gastos del negocio</p>
        </div>
        <button className="btn-primary" onClick={handleNuevoGasto}>
          + Nuevo Gasto
        </button>
      </div>

      <EstadisticasGrid gastos={gastos} />

      <div className="card">
        <Filtros filtroEstado={filtroEstado} onFiltroChange={handleFiltroChange} />
        <div className="table-wrapper">
          <TablaGastos gastosFiltrados={gastosFiltrados} handleEditarGasto={handleEditarGasto} handleToggleGastoEstado={handleToggleGastoEstado} />
        </div>
      </div>

      <ModalGasto
        isOpen={modalGasto.isOpen}
        onClose={modalGasto.close}
        onSubmit={handleSubmitGasto}
        initialGasto={gastoToEdit}
      />
    </div>
  );
};
