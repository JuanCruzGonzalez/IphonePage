import ModalEmpleadoForm from './components/EmpleadoForm';
import { useAuth } from './../../auth/AuthContext';
import { useEmpleado } from './context/EmpleadoContext';
import './styles/EmpleadosPage.css';
import '../../core/styles/app.css';
import TablaEmpleados from './components/TablaEmpleado';
import { useState } from 'react';
import ModalEmpleado from './components/ModalEmpleado';
import { Empleado } from '../../core/types';
import Page from '../../shared/components/Page';
import Card from '../../shared/components/Card';
import PageHeader from '../../shared/components/PageHeader';

const EmpleadosPage: React.FC = () => {
  const { user } = useAuth();
  const { modalEmpleado, empleadoToEdit, handleNuevoEmpleado } = useEmpleado();
  const { empleados, isLoading, handleEditarEmpleado, handleToggleEmpleadoEstado } = useEmpleado();

  const [modalView, setModalView] = useState<{ open: boolean; empleado?: Empleado }>({ open: false });

  const empleadosOrdenados = [...empleados].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

  const handleEstadoModalView = (empleado: Empleado, open: boolean) => {
    setModalView({ open, empleado });
  }
  // Solo renderiza si el usuario es admin
  if (!user || user.user_metadata?.role !== 'admin') return null;

  return (
    <Page>
      <PageHeader funcion={handleNuevoEmpleado} textButton='Nuevo Empleado' title='Empleados' subtitle='Gestion de empleados de la empresa' />
      <Card>
        {isLoading && <p>Cargando empleados...</p>}
        {!isLoading &&  (
          <TablaEmpleados
            empleadosOrdenados={empleadosOrdenados}
            handleEstadoModalView={handleEstadoModalView}
            handleEditarEmpleado={handleEditarEmpleado}
            handleToggleEmpleadoEstado={handleToggleEmpleadoEstado}
          />
        )}
      </Card>
      {modalEmpleado.isOpen && (
        <div className="modal-overlay" onClick={modalEmpleado.close}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <ModalEmpleadoForm
              empleadoToEdit={empleadoToEdit}
              onClose={modalEmpleado.close}
            />
          </div>
        </div>
      )}
      <ModalEmpleado modalView={modalView} handleEstadoModalView={handleEstadoModalView} />
    </Page>

  );
};

export default EmpleadosPage;