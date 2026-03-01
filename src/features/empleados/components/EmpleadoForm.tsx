import { useState, useEffect } from 'react';
import { Empleado } from '../../../core/types';
import { useEmpleado } from '../context/EmpleadoContext';

interface ModalEmpleadoFormProps {
  empleadoToEdit?: Empleado | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function ModalEmpleadoForm({ empleadoToEdit, onSuccess, onClose }: ModalEmpleadoFormProps) {
  const isEdit = Boolean(empleadoToEdit);
  const [form, setForm] = useState<any>({
    nombre: empleadoToEdit?.nombre || '',
    apellido: empleadoToEdit?.apellido || '',
    fecha_nacimiento: empleadoToEdit?.fecha_nacimiento || '',
    dni: empleadoToEdit?.dni || '',
    estado: empleadoToEdit?.estado || 'activo',
    email: empleadoToEdit?.email || '',
    password: '',
  });

  // Resetear el formulario cuando cambia el modo (nuevo/editar)
  useEffect(() => {
    setForm({
      nombre: empleadoToEdit?.nombre || '',
      apellido: empleadoToEdit?.apellido || '',
      fecha_nacimiento: empleadoToEdit?.fecha_nacimiento || '',
      dni: empleadoToEdit?.dni || '',
      estado: empleadoToEdit?.estado || 'activo',
      email: empleadoToEdit?.email || '',
      password: '',
    });
  }, [empleadoToEdit]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleSubmitEmpleado } = useEmpleado();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isEdit) {
        await handleSubmitEmpleado({ empleado: { ...(empleadoToEdit || {}), ...form } }, form.password || undefined);
      } else {
        await handleSubmitEmpleado({ empleado: { ...form } }, form.password);
        setForm({
          nombre: '', apellido: '', fecha_nacimiento: '', dni: '', estado: 'activo', email: '', password: ''
        });
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || (isEdit ? 'Error al actualizar empleado' : 'Error al crear empleado'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={e => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>{isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <form onSubmit={handleSubmit} className="formEmpleado">
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Nombre"
              />
            </div>
            <div className="form-group">
              <label>Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Apellido"
              />
            </div>
            <div className="form-group">
              <label>Fecha de nacimiento *</label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Fecha de nacimiento"
              />
            </div>
            <div className="form-group">
              <label>DNI *</label>
              <input
                type="text"
                name="dni"
                value={form.dni}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="DNI"
              />
            </div>
            <div className="form-group">
              <label>Estado *</label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="activo">Activo</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required={!isEdit}
                disabled={isEdit || loading}
                placeholder="Email del empleado"
              />
            </div>
            <div className="form-group">
              <label>Contraseña {isEdit ? '' : '*'}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required={!isEdit}
                disabled={isEdit || loading}
                placeholder="Contraseña"
                autoComplete={isEdit ? "current-password" : "new-password"}
              />
            </div>
            {error && <p className='mensajeError'>{error}</p>}
          </form>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading} type="button">
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading} type="button">
            {loading ? (isEdit ? 'Guardando...' : 'Creando...') : isEdit ? 'Guardar cambios' : 'Crear empleado'}
          </button>
        </div>
      </div>
    </div>
  );
}

