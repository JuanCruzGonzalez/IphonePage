import React from 'react';
import { Producto } from '../../../core/types';
import { usePromociones } from '../context/PromocionesContext';

interface ModalVerPromocionProps {
  productosCatalogo: Producto[]; // para resolver nombres
}

export const ModalVerPromocion: React.FC<ModalVerPromocionProps> = ({ productosCatalogo }) => {
  const { modalVerPromocion, promocionVista, promocionVistaDetalles } = usePromociones();
  
  if (!modalVerPromocion.isOpen || !promocionVista) return null;

  const resolveNombre = (id_producto: number) => {
    const p = productosCatalogo.find(x => x.id_producto === id_producto);
    return p ? p.nombre : `#${id_producto}`;
  };

  return (
    <div className="modal-overlay" onClick={modalVerPromocion.close}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>Detalle Promoción</h2>
          <button className="btn-close" onClick={modalVerPromocion.close}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div style={{ marginBottom: 12 }}>
            <strong>{promocionVista.name}</strong>
            <div style={{ color: '#666' }}>{promocionVista.precio != null ? `$${promocionVista.precio}` : 'Precio no establecido'}</div>
            <div style={{ marginTop: 6 }}><span className={`status-badge ${promocionVista.estado ? 'active' : 'inactive'}`}>{promocionVista.estado ? 'Activo' : 'Inactivo'}</span></div>
          </div>

          <div>
            <h4>Productos</h4>
            {promocionVistaDetalles.length === 0 ? (
              <div className="empty-state">No hay productos en esta promoción</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {promocionVistaDetalles.map(d => (
                  <div key={d.id_detalle_promocion} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{resolveNombre(d.id_producto)}</div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>{d.cantidad} un </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={modalVerPromocion.close}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalVerPromocion;
