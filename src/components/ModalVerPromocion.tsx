import React from 'react';
import { Promocion, DetallePromocionConCantidad, Producto } from '../types';

interface ModalVerPromocionProps {
  isOpen: boolean;
  onClose: () => void;
  promocion: Promocion | null;
  detalles: DetallePromocionConCantidad[];
  productosCatalogo: Producto[]; // para resolver nombres
}

export const ModalVerPromocion: React.FC<ModalVerPromocionProps> = ({ isOpen, onClose, promocion, detalles, productosCatalogo }) => {
  if (!isOpen || !promocion) return null;

  const resolveNombre = (id_producto: number) => {
    const p = productosCatalogo.find(x => x.id_producto === id_producto);
    return p ? p.nombre : `#${id_producto}`;
  };

  const resolveUnidadMedida = (id_producto: number) => {
    const p = productosCatalogo.find(x => x.id_producto === id_producto);
    return p ? p.unidad_medida?.abreviacion : `#${id_producto}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>Detalle Promoción</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div style={{ marginBottom: 12 }}>
            <strong>{promocion.name}</strong>
            <div style={{ color: '#666' }}>{promocion.precio != null ? `$${promocion.precio}` : 'Precio no establecido'}</div>
            <div style={{ marginTop: 6 }}><span className={`status-badge ${promocion.estado ? 'active' : 'inactive'}`}>{promocion.estado ? 'Activo' : 'Inactivo'}</span></div>
          </div>

          <div>
            <h4>Productos</h4>
            {detalles.length === 0 ? (
              <div className="empty-state">No hay productos en esta promoción</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detalles.map(d => (
                  <div key={d.id_detalle_promocion} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{resolveNombre(d.id_producto)}</div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>{d.cantidad} {resolveUnidadMedida(d.id_producto)} </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalVerPromocion;
