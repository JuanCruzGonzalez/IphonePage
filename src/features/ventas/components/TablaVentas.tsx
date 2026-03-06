import { Venta } from "../../../core/types";
import { calculateVentaTotalesPorMoneda, formatDate } from "../../../shared/utils";

export default function TablaVentas({ ventas, handleSetVentaSeleccionada, handleToggleVentaFlag }: {
    ventas: Venta[], handleSetVentaSeleccionada: (venta: Venta | null) => void, handleToggleVentaFlag: (id_venta: number, field: "baja" | "estado",
        currentValue: boolean,
        label?: string) => void
}) {
    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ventas.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="empty-state">
                                No hay ventas registradas
                            </td>
                        </tr>
                    ) : (
                        ventas.map(venta => {
                            const totales = calculateVentaTotalesPorMoneda(venta);
                            return (
                                <tr key={venta.id_venta}>
                                    <td className="text-muted">#{venta.id_venta}</td>
                                    <td>{formatDate(venta.fecha)}</td>
                                    <td>{venta.detalle_venta.length} producto(s)</td>
                                    <td>
                                        {totales.tienePesos && (
                                            <div><strong>${totales.totalPesos.toFixed(2)}</strong></div>
                                        )}
                                        {totales.tieneDolares && (
                                            <div><strong>${totales.totalDolares.toFixed(2)} USD</strong></div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${venta.estado ? 'active' : 'inactive'}`}>
                                            {venta.estado ? 'Pagada' : 'Se debe'}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button
                                            className="btn-link"
                                            onClick={() => handleSetVentaSeleccionada(venta)}
                                            aria-label={`Ver detalle venta ${venta.id_venta}`}
                                            title="Ver detalle"
                                            style={{ padding: 6, width: '40px', display: 'flex', justifyContent: 'center', height: '40px', alignItems: 'center', border: '1px solid #ddd' }}
                                        >
                                            {/* Eye / ver detalle icon */}
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                                                <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        {/* Pago toggle (estado) */}
                                        {venta.estado ? (
                                            <button
                                                className="btn-sm btn-secondary"
                                                aria-label="Marcar pendiente"
                                                title="Marcar pendiente"
                                                onClick={() => handleToggleVentaFlag(venta.id_venta, 'estado', venta.estado, `Venta #${venta.id_venta}`)}
                                                style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd' }}
                                            >
                                                {/* Clock icon */}
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                                                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-sm btn-secondary"
                                                aria-label="Marcar pagada"
                                                title="Marcar pagada"
                                                onClick={() => handleToggleVentaFlag(venta.id_venta, 'estado', venta.estado, `Venta #${venta.id_venta}`)}
                                                style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px' }}
                                            >
                                                {/* Check icon */}
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        )}

                                        {/* Baja toggle */}
                                        {venta.baja ? (
                                            <button
                                                className="btn-sm btn-primary"
                                                aria-label="Dar de alta"
                                                title="Dar de alta"
                                                onClick={() => handleToggleVentaFlag(venta.id_venta, 'baja', venta.baja, `Venta #${venta.id_venta}`)}
                                                style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px' }}
                                            >
                                                {/* Arrow up icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z" fill="#fff" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-sm btn-danger"
                                                aria-label="Dar de baja"
                                                title="Dar de baja"
                                                onClick={() => handleToggleVentaFlag(venta.id_venta, 'baja', venta.baja, `Venta #${venta.id_venta}`)}
                                                style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }}
                                            >
                                                {/* Trash icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                                    <path d="M10 11v6"></path>
                                                    <path d="M14 11v6"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}