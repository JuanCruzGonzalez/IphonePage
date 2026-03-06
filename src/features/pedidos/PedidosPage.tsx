import React, { useState, useMemo } from 'react';
import { usePedidos } from './context/PedidosContext';
import { ModalDetallePedido } from './components/ModalDetallePedido';
import { EstadoPedido, PedidoConDetalles } from '../../core/types';
import CargandoPage from '../../shared/components/CargandoPage';
import Page from '../../shared/components/Page';
import Card from '../../shared/components/Card';
import H1 from '../../shared/components/H1';
import Metricas from './components/Metricas';
import './styles/pedidos.css';
import SelectorEstados from './components/SelectorEstados';
import Buscador from './components/Buscador';
import TablePedidos from './components/TablePedidos';

export const PedidosPage: React.FC = () => {
  const {
    pedidos,
    isLoading,
    contadorPendientes,
    metricasHoy,
    handleVerPedido,
    handleCambiarEstado,
    handleBuscarPedidos,
    handleAutoCancelar,
  } = usePedidos();

  const [filtroEstado, setFiltroEstado] = useState<'all' | EstadoPedido>('all');
  const [busqueda, setBusqueda] = useState('');
  const [pedidosFiltrados, setPedidosFiltrados] = useState(pedidos);


  const handlerSetPedidosFiltrados = (value: PedidoConDetalles[]) => {
    setPedidosFiltrados(value);
  }
  const handleSetBuscar = (busqueda: string) => {
    setBusqueda(busqueda);
  }
  const handlerOnFiltroChange = (value: string) => {
    setFiltroEstado(value as 'all' | EstadoPedido);
  }

  // Filtrar pedidos
  useMemo(() => {
    let resultado = pedidos;

    // Filtro por estado
    if (filtroEstado !== 'all') {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }

    setPedidosFiltrados(resultado);
  }, [pedidos, filtroEstado]);

  // Buscar
  const handleBuscar = async () => {
    if (busqueda.trim()) {
      const resultados = await handleBuscarPedidos(busqueda);
      setPedidosFiltrados(filtroEstado === 'all'
        ? resultados
        : resultados.filter(p => p.estado === filtroEstado)
      );
    } else {
      setPedidosFiltrados(filtroEstado === 'all'
        ? pedidos
        : pedidos.filter(p => p.estado === filtroEstado)
      );
    }
  };

  if (isLoading) {
    return (
      <CargandoPage mensaje="pedidos" />
    );
  }

  return (
    <Page>
      <div className="page-header">
        <div>
          <H1 texto="Pedidos" />
          <p className="page-subtitle">Gestiona los pedidos de clientes</p>
        </div>
        <button className="btn-secondary" onClick={handleAutoCancelar}>
          🗑️ Auto-cancelar Vencidos
        </button>
      </div>

      <Metricas contadorPendientes={contadorPendientes} metricasHoy={metricasHoy} />

      {/* Filtros y búsqueda */}
      <div className="filtro">
        <SelectorEstados filtroEstado={filtroEstado} handlerOnFiltroChange={handlerOnFiltroChange} />

        <Buscador
          busqueda={busqueda}
          handleSetBuscar={handleSetBuscar}
          handleBuscar={handleBuscar}
          filtroEstado={filtroEstado}
          handlerSetPedidosFiltrados={handlerSetPedidosFiltrados}
          pedidos={pedidos}
        />
      </div>
      <Card>
        <TablePedidos handleCambiarEstado={handleCambiarEstado} pedidosFiltrados={pedidosFiltrados} handleVerPedido={handleVerPedido} />
      </Card>

      <ModalDetallePedido />
    </Page>
  );
};