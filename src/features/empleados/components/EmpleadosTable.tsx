import { useState } from 'react';
import { ViewButton, EditButton, DeleteButton, ActivateButton } from './EmpleadoActionButtons';
import { useEmpleado } from '../context/EmpleadoContext';

export default function EmpleadosTable() {
  const { empleados, isLoading, handleEditarEmpleado, handleToggleEmpleadoEstado } = useEmpleado();
  const [modalView, setModalView] = useState<{ open: boolean; empleado?: any }>({ open: false });

  // Ordenar empleados alfabéticamente por nombre
  const empleadosOrdenados = [...empleados].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

  return (
    <div className='card' style={{ marginTop: 32 }}>
      <div className='table-wrapper'>
        {isLoading && <p>Cargando empleados...</p>}
        {!isLoading && empleadosOrdenados.length > 0 ? (
          <table className='table'>
            <thead>
              <tr key="header">
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Nombre</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Apellido</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Email</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>DNI</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Fecha de alta</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosOrdenados.map((emp) => (
                <tr key={emp.user_id}>
                  <td>{emp.nombre}</td>
                  <td>{emp.apellido}</td>
                  <td>{emp.email}</td>
                  <td>{emp.dni}</td>
                  <td>{new Date(emp.created_at).toLocaleString()}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <ViewButton onClick={() => setModalView({ open: true, empleado: emp })} />
                    <EditButton onClick={() => handleEditarEmpleado(emp)} />
                      {
                        emp.estado === 'activo' ? (
                          <DeleteButton onClick={() => handleToggleEmpleadoEstado(emp.user_id, true, emp.nombre)} />
                        ) : (
                          <ActivateButton onClick={() => handleToggleEmpleadoEstado(emp.user_id, false, emp.nombre)} />
                        )
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay empleados registrados.</p>
        )}

        {/* Modal ver empleado */}
        {modalView.open && (
          <div className="modal-overlay" onClick={() => setModalView({ open: false })}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
              <div className="modal-header">
                <h2>Informacion del Empleado</h2>
                <button className="modal-close" onClick={() => setModalView({ open: false })}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
                <div className="modal-body modalEmpleadoDetalleBody">
                  <table className="empleadoDetalleTable">
                    <tbody>
                      <tr key="nombre">
                        <td className="empleadoDetalleLabel">Nombre</td>
                        <td className="empleadoDetalleValue">{modalView.empleado?.nombre || '-'}</td>
                      </tr>
                      <tr key="apellido">
                        <td className="empleadoDetalleLabel">Apellido</td>
                        <td className="empleadoDetalleValue">{modalView.empleado?.apellido || '-'}</td>
                      </tr>
                      <tr key="email">
                        <td className="empleadoDetalleLabel">Email</td>
                        <td className="empleadoDetalleValue">{modalView.empleado?.email || '-'}</td>
                      </tr>
                      <tr key="fecha_nacimiento">
                        <td className="empleadoDetalleLabel">Fecha de nacimiento</td>
                        <td className="empleadoDetalleValue">
                          {modalView.empleado?.fecha_nacimiento
                            ? new Date(modalView.empleado.fecha_nacimiento).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                      <tr key="dni">
                        <td className="empleadoDetalleLabel">DNI</td>
                        <td className="empleadoDetalleValue">{modalView.empleado?.dni || '-'}</td>
                      </tr>
                      <tr key="estado">
                        <td className="empleadoDetalleLabel">Estado</td>
                        <td className="empleadoDetalleValue">{modalView.empleado?.estado || '-'}</td>
                      </tr>
                      <tr key="fecha_alta">
                        <td className="empleadoDetalleLabel">Fecha de alta</td>
                        <td className="empleadoDetalleValue">
                          {modalView.empleado?.created_at
                            ? new Date(modalView.empleado.created_at).toLocaleString()
                            : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="empleadoDetalleFooter">
                    <button onClick={() => setModalView({ open: false })}>Cerrar</button>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
