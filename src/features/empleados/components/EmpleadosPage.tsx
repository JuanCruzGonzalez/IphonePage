import EmpleadosTable from '../components/EmpleadosTable';
import ModalEmpleadoForm from './EmpleadoForm';
import { useAuth } from '../../../auth/AuthContext';
import { useEmpleado } from '../context/EmpleadoContext';
import './EmpleadosPage.css';
import '../../../core/styles/app.css';

const EmpleadosPage: React.FC = () => {
  const { user } = useAuth();
  const { modalEmpleado, empleadoToEdit, handleNuevoEmpleado } = useEmpleado();
  // Solo renderiza si el usuario es admin
  if (!user || user.user_metadata?.role !== 'admin') return null;

  return (
    <div className='page'>
      <div className='page-header flex '>
        <h2 className='tituloEmpleados'>Empleados</h2>
        <button
          className='nuevoEmpleadoBtn'
          onClick={handleNuevoEmpleado}
        >
          Nuevo empleado
        </button>
      </div>
      <EmpleadosTable />
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
    </div>
  );
};

export default EmpleadosPage;