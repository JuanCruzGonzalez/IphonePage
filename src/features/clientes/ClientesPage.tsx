import React, { useState } from 'react';
import { useClientes } from './context/ClientesContext';
import { TablaClientes } from './components/TablaClientes';
import { ModalDetalleCliente } from './components/ModalDetalleCliente';
import PageHeader from '../../shared/components/PageHeader';
import Card from '../../shared/components/Card';
import './styles/clientes.css';
import Page from '../../shared/components/Page';
import Buscador from './components/Buscador';
import CargandoPage from '../../shared/components/CargandoPage';
/**
 * Página de clientes en el panel de administración.
 * Sección: 'clientes'
 */
const ClientesPage: React.FC = () => {
  const {
    clientes,
    isLoading,
    clienteSeleccionado,
    modalDetalle,
    handleBuscar,
    handleVerCliente,
    handleToggleEstado,
  } = useClientes();

  const [busqueda, setBusqueda] = useState('');


  const handleSetBuscar = (value: string) => {
    setBusqueda(value);
  }

  const handleBuscarClientes = (value?: string) => {
    const query = value ?? busqueda;
    handleBuscar(query);
  };

  if (isLoading) {
    return (
      <CargandoPage mensaje="clientes" />
    );
  }

  return (
    <Page>
      <PageHeader title="Clientes" subtitle='Gestion de clientes de la empresa' />
      
      <div className="clientes-content">
        <Buscador
          busqueda={busqueda}
          handleSetBuscar={handleSetBuscar}
          handleBuscar={handleBuscarClientes}
        />

        <Card>
          {/* Buscador */}

          <TablaClientes
            clientes={clientes}
            onVerDetalle={handleVerCliente}
            onToggleEstado={handleToggleEstado}
          />
        </Card>
      </div>

      <ModalDetalleCliente
        isOpen={modalDetalle.isOpen}
        cliente={clienteSeleccionado}
        onClose={modalDetalle.close}
        onToggleEstado={handleToggleEstado}
      />
    </Page>
  );
};

export default ClientesPage;
