import React, { useState } from 'react';

interface DatosClienteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (datos: {
        nombre: string;
        telefono: string;
        direccion: string;
        metodoPago: 'efectivo' | 'transferencia' | 'mercadopago';
        notas: string;
    }) => void;
}

export const DatosClienteModal: React.FC<DatosClienteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mercadopago'>('efectivo');
    const [notas, setNotas] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        const newErrors: { [key: string]: string } = {};

        if (!nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (!telefono.trim()) {
            newErrors.telefono = 'El teléfono es requerido';
        } else if (!/^\d+$/.test(telefono.replace(/\s/g, ''))) {
            newErrors.telefono = 'El teléfono debe contener solo números';
        }

        if (!direccion.trim()) {
            newErrors.direccion = 'La dirección es requerida';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Llamar al callback con los datos
        onConfirm({
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            direccion: direccion.trim(),
            metodoPago,
            notas: notas.trim(),
        });

        // Limpiar el formulario
        setNombre('');
        setTelefono('');
        setDireccion('');
        setMetodoPago('efectivo');
        setNotas('');
        setErrors({});
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>Datos del Cliente</h2>
                    <button className="modal-close" onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                            Ingresa los datos del cliente para registrar el pedido antes de enviarlo por WhatsApp
                        </p>

                        {/* Nombre */}
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label htmlFor="nombre" className="form-label">
                                Nombre Completo <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                id="nombre"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre del cliente"
                                className={errors.nombre ? 'input-error' : ''}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                        </div>

                        {/* Teléfono */}
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label htmlFor="telefono" className="form-label">
                                Teléfono <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                id="telefono"
                                type="text"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="2616166624"
                                className={errors.telefono ? 'input-error' : ''}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                            {errors.telefono && <span className="error-message">{errors.telefono}</span>}
                        </div>

                        {/* Dirección */}
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label htmlFor="direccion" className="form-label">
                                Dirección de Entrega <span style={{ color: 'red' }}>*</span>
                            </label>
                            <textarea
                                id="direccion"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                placeholder="Dirección completa..."
                                className={errors.direccion ? 'input-error' : ''}
                                rows={3}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                            />
                            {errors.direccion && <span className="error-message">{errors.direccion}</span>}
                        </div>

                        {/* Método de Pago */}
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label htmlFor="metodoPago" className="form-label">
                                Método de Pago <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select
                                id="metodoPago"
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value as any)}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff' }}
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                        </div>

                        {/* Notas */}
                        <div className="form-group">
                            <label htmlFor="notas" className="form-label">
                                Notas Adicionales
                            </label>
                            <textarea
                                id="notas"
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                placeholder="Ej: Horario preferido, aclaraciones..."
                                rows={2}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-secondary btn-cancel-pedido" onClick={handleClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                Crear Pedido y Enviar
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};
