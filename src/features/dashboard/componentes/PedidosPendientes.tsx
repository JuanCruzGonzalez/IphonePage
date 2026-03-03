import { formatCurrency } from "../../../shared/utils";
import { IconPedidos } from "./iconos";

export default function PedidosPendientes({ pedidosPendientes, loadingPedidos }: { pedidosPendientes: Array<{ id_pedido: number; cliente_nombre: string; estado: string; total: number | null }>, loadingPedidos: boolean }) {
    return (
        <div className="dashboard-section-card">
            <div className="section-card-header">
                <h3>
                    <span className="header-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}><IconPedidos /></span>
                    Pedidos pendientes
                </h3>
                {pedidosPendientes.length > 0 && (
                    <span className="badge-count warning">{pedidosPendientes.length}</span>
                )}
            </div>
            <div className="section-card-body">
                {loadingPedidos ? (
                    <div className="empty-state">Cargando…</div>
                ) : pedidosPendientes.length === 0 ? (
                    <div className="empty-state">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        <div>Sin pedidos pendientes</div>
                    </div>
                ) : (
                    <ul className="pending-list">
                        {pedidosPendientes.map((p) => (
                            <li key={p.id_pedido}>
                                <span className="pending-name">{p.cliente_nombre || `Pedido #${p.id_pedido}`}</span>
                                <span className={`pending-estado ${p.estado.toLowerCase()}`}>{p.estado}</span>
                                {p.total != null && (
                                    <span className="pending-monto">{formatCurrency(p.total)}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}