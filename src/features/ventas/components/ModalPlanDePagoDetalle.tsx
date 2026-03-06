import React from 'react';
import { PlanDePago } from '../../../core/types';
import Modal from '../../../shared/components/Modal';

interface ModalPlanDePagoDetalleProps {
    plan: PlanDePago;
    onClose: () => void;
}

const ModalPlanDePagoDetalle: React.FC<ModalPlanDePagoDetalleProps> = ({ plan, onClose }) => {
    return (
        <Modal title={`Detalle del Plan de Pago #${plan.id_plan}`} close={onClose}>
            <div className="modal-minimal-body">
                <h2 className="modal-plan-title">Detalle del Plan de Pago #{plan.id_plan}</h2>
                <div className="modal-plan-info-block">
                    <strong>Cliente:</strong> {plan.cliente.nombre} <br />
                    <strong>Teléfono:</strong> {plan.cliente.telefono} <br />
                    <strong>Estado:</strong> {plan.estado} <br />
                    <strong>Cuotas:</strong> {plan.cuotas_pagadas} / {plan.numero_cuotas} <br />
                    <strong>Monto total:</strong> ${plan.monto_total.toFixed(2)} <br />
                    <strong>Monto por cuota:</strong> ${plan.monto_cuota.toFixed(2)} <br />
                    <strong>Notas:</strong> {plan.notas || '-'} <br />
                    <strong>Fecha inicio:</strong> {plan.fecha_inicio} <br />
                </div>
                <hr className="modal-plan-divider" />
                <h3 className="modal-plan-subtitle">Venta asociada #{plan.venta.id_venta}</h3>
                <div className="modal-plan-info-block">
                    <strong>Fecha:</strong> {plan.venta.fecha} <br />
                    <strong>Método de pago:</strong> {plan.venta.metodo_pago || '-'} <br />
                    <strong>Total:</strong> {plan.venta.total ? `$${plan.venta.total.toFixed(2)}` : '-'} <br />
                </div>
                <h4 className="modal-plan-details-title">Detalles de la venta</h4>
                <table className="modal-plan-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tipo</th>
                            <th>Nombre</th>
                            <th>Cantidad</th>
                            <th>Precio unitario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plan.venta.detalle_venta.map((d, idx) => (
                            <tr key={d.id_detalle_venta}>
                                <td className="td-padding font-size-12">{idx + 1}</td>
                                <td className="td-padding font-size-12">{d.producto ? 'Producto' : d.promocion ? 'Promoción' : '-'}</td>
                                <td className="td-padding font-500">{d.producto ? d.producto.nombre : d.promocion ? d.promocion.name : '-'}</td>
                                <td className="td-padding font-600">{d.cantidad}</td>
                                <td className="td-padding">${d.precio_unitario.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="close">
                    <button onClick={onClose} className="modal-plan-close-btn">Cerrar</button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalPlanDePagoDetalle;
