import { Venta } from "../../../core/types";
import { calculateVentaTotalesPorMoneda, formatDate } from "../../../shared/utils";

export default function ModalVentaDetalle({ ventaSeleccionada, handleSetVentaSeleccionada }: { ventaSeleccionada: Venta; handleSetVentaSeleccionada: (venta: Venta | null) => void }) {
    return (
        <div className="modal-overlay" onClick={() => handleSetVentaSeleccionada(null)}>
            <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-minimal-header">
                    <h2>Detalle de Venta #{ventaSeleccionada.id_venta}</h2>
                    <button className="btn-close" onClick={() => handleSetVentaSeleccionada(null)}>×</button>
                </div>
                <div className="modal-minimal-body">
                    <div className="detail-row">
                        <span className="detail-label">Fecha:</span>
                        <span>{formatDate(ventaSeleccionada.fecha)}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Estado:</span>
                        <span className={`status-badge ${ventaSeleccionada.estado ? 'active' : 'inactive'}`}>
                            {ventaSeleccionada.estado ? 'Pagada' : 'Se debe'}
                        </span>
                    </div>

                    <h3 className="detail-section-title">Productos / Promociones</h3>
                    <div className="detail-list">
                        {ventaSeleccionada.detalle_venta.map((detalle) => {
                            const esProductoEnDolares = detalle.producto?.dolares ?? false;
                            return (
                                <div key={detalle.id_detalle_venta} className="detail-item">
                                    <div>
                                        {detalle.promocion ? (
                                            <>
                                                <span>{detalle.promocion.name}</span>
                                                <span style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 6px', backgroundColor: '#f0f0f0', borderRadius: '4px', color: '#666' }}>
                                                    Promoción
                                                </span>
                                                <span className="text-muted"> ×{detalle.cantidad}</span>
                                                <span style={{ marginLeft: '10px', color: '#666' }}>
                                                    ${detalle.precio_unitario.toFixed(2)}
                                                </span>
                                            </>
                                        ) : detalle.producto ? (
                                            <>
                                                <span>{detalle.producto.nombre}</span>
                                                {esProductoEnDolares && (
                                                    <span style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 6px', backgroundColor: '#e3f2fd', borderRadius: '4px', color: '#1976d2', fontWeight: '500' }}>
                                                        USD
                                                    </span>
                                                )}
                                                <span className="text-muted"> ×{detalle.cantidad}</span>
                                                <span style={{ marginLeft: '10px', color: '#666' }}>
                                                    ${detalle.precio_unitario.toFixed(2)}{esProductoEnDolares ? ' USD' : ''}
                                                </span>
                                            </>
                                        ) : (
                                            <span>Ítem desconocido</span>
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 'bold' }}>
                                        ${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}{esProductoEnDolares ? ' USD' : ''}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{
                        marginTop: '20px',
                        paddingTop: '15px',
                        borderTop: '2px solid #ddd'
                    }}>
                        {(() => {
                            const totales = calculateVentaTotalesPorMoneda(ventaSeleccionada);
                            return (
                                <>
                                    {totales.tienePesos && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            marginBottom: totales.tieneDolares ? '8px' : '0'
                                        }}>
                                            <span>Total (ARS):</span>
                                            <span>${totales.totalPesos.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {totales.tieneDolares && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '18px',
                                            fontWeight: 'bold'
                                        }}>
                                            <span>Total (USD):</span>
                                            <span>${totales.totalDolares.toFixed(2)} USD</span>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    )
}