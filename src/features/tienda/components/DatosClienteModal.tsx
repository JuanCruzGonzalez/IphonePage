import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/Modal';

interface DatosClienteModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: {
        nombre?: string;
        telefono?: string;
        direccion?: string;
    };
    onConfirm: (datos: {
        nombre: string;
        telefono: string;
        direccion: string;
        metodoPago: 'efectivo' | 'transferencia' | 'mercadopago' | 'plan_de_pago';
        notas: string;
        planCuotas?: number;
    }) => void;
}

export const DatosClienteModal: React.FC<DatosClienteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    initialData,
}) => {
    const [nombre, setNombre] = useState(initialData?.nombre ?? '');
    const [telefono, setTelefono] = useState(initialData?.telefono ?? '');
    const [direccion, setDireccion] = useState(initialData?.direccion ?? '');
    const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mercadopago' | 'plan_de_pago'>('efectivo');
    const [planCuotas, setPlanCuotas] = useState(3);
    const [notas, setNotas] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Sincronizar si el perfil llega después del primer render (lazy load)
    useEffect(() => {
        if (initialData) {
            if (initialData.nombre)   setNombre(initialData.nombre);
            if (initialData.telefono) setTelefono(initialData.telefono);
            if (initialData.direccion) setDireccion(initialData.direccion);
        }
    }, [initialData?.nombre, initialData?.telefono, initialData?.direccion]);

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
            planCuotas: metodoPago === 'plan_de_pago' ? planCuotas : undefined,
        });

        // Limpiar el formulario
        setNombre('');
        setTelefono('');
        setDireccion('');
        setMetodoPago('efectivo');
        setPlanCuotas(3);
        setNotas('');
        setErrors({});
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <Modal close={handleClose} title="Datos del Cliente">
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
                                <option value="plan_de_pago">Plan de pago (cuotas)</option>
                            </select>
                        </div>

                        {/* Cuotas para plan de pago */}
                        {metodoPago === 'plan_de_pago' && (
                            <div className="form-group" style={{ marginBottom: '16px', background: '#fffdf0', border: '1px solid #e3b44a', borderRadius: 8, padding: 12 }}>
                                <label htmlFor="planCuotas" className="form-label" style={{ color: '#92610c', fontWeight: 600 }}>
                                    🗓️ Número de cuotas <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    id="planCuotas"
                                    type="number"
                                    min={2}
                                    max={24}
                                    value={planCuotas}
                                    onChange={e => setPlanCuotas(Math.max(2, parseInt(e.target.value) || 2))}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <p style={{ fontSize: 12, color: '#92610c', marginTop: 4 }}>
                                    El plan se confirmará cuando el pedido sea entregado.
                                </p>
                            </div>
                        )}


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
                            <button type="button" className="btn-secondary btn-cancel-pedido cancel-button" onClick={handleClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">
                                Crear Pedido y Enviar
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
    );
};
