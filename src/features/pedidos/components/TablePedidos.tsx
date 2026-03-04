import { PedidoConDetalles } from "../../../core/types";
import { formatDate, formatPrice } from "../../../shared/utils";
import { getEstadoBadgeClass, getEstadoTexto } from "../services/pedidoService";
import BotonEstado from "./BotonEstado";
import { AceptarIcon, CancelarIcon, EntregarIcon } from "../../../shared/components/Iconos";

export default function TablePedidos({ pedidosFiltrados, handleVerPedido, handleCambiarEstado }: { pedidosFiltrados: PedidoConDetalles[]; handleVerPedido: (pedido: PedidoConDetalles) => void; handleCambiarEstado: (id_pedido: number, estado: 'ACEPTADO' | 'CANCELADO' | 'ENTREGADO') => void; }) {
    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>#Pedido</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidosFiltrados.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="empty-state">
                                No hay pedidos para mostrar
                            </td>
                        </tr>
                    ) : (
                        pedidosFiltrados.map(pedido => (
                            <tr key={pedido.id_pedido}>
                                <td className="font-medium">#{pedido.id_pedido}</td>
                                <td>{formatDate(pedido.fecha_pedido)}</td>
                                <td>{pedido.cliente_nombre}</td>
                                <td>{pedido.cliente_telefono}</td>
                                <td className="font-medium">{formatPrice(pedido.total)}</td>
                                <td>
                                    <span className={getEstadoBadgeClass(pedido.estado)}>
                                        {getEstadoTexto(pedido.estado)}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn-sm btn-secondary"
                                            onClick={() => handleVerPedido(pedido)}
                                            title="Ver detalle"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        </button>
                                        {
                                            pedido.estado === 'RECIBIDO' ? (
                                                <>
                                                    <BotonEstado onClick={() => handleCambiarEstado(pedido.id_pedido, 'ACEPTADO')} id_pedido={pedido.id_pedido} clase="success" icon={<AceptarIcon />} />

                                                    <BotonEstado onClick={() => handleCambiarEstado(pedido.id_pedido, 'CANCELADO')} id_pedido={pedido.id_pedido} clase="danger" icon={<CancelarIcon />} />
                                                </>
                                            ) : (
                                                pedido.estado === 'ACEPTADO' && (
                                                    <>
                                                        <BotonEstado onClick={() => handleCambiarEstado(pedido.id_pedido, 'ENTREGADO')} id_pedido={pedido.id_pedido} clase="primary" icon={<EntregarIcon />} />
                                                        <BotonEstado onClick={() => handleCambiarEstado(pedido.id_pedido, 'CANCELADO')} id_pedido={pedido.id_pedido} clase="danger" icon={<CancelarIcon />} />
                                                    </>
                                                )
                                            )
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}