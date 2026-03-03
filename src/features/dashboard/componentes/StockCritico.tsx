import { STOCK_CRITICO_UMBRAL } from "../queryes";
import { IconBox } from "./iconos";

export default function StockCritico({ stockCritico, loadingStock }: { stockCritico: Array<{ id_producto: number; nombre: string; stock: number }>, loadingStock: boolean }) {
    return (
        <div className="dashboard-section-card">
            <div className="section-card-header">
                <h3>
                    <span className="header-icon" style={{ background: '#fee2e2', color: '#dc2626' }}><IconBox /></span>
                    Stock crítico
                </h3>
                {stockCritico.length > 0 && (
                    <span className="badge-count danger">{stockCritico.length}</span>
                )}
            </div>
            <div className="section-card-body">
                {loadingStock ? (
                    <div className="empty-state">Cargando…</div>
                ) : stockCritico.length === 0 ? (
                    <div className="empty-state">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        <div>Todos los productos tienen stock suficiente</div>
                    </div>
                ) : (
                    <ul className="stock-list">
                        {stockCritico.map((p) => {
                            const pct = Math.min((p.stock / STOCK_CRITICO_UMBRAL) * 100, 100);
                            const cls = p.stock === 0 ? 'low' : p.stock <= 2 ? 'low' : 'medium';
                            return (
                                <li key={p.id_producto}>
                                    <span className="stock-nombre">{p.nombre}</span>
                                    <div className="stock-amount">
                                        <div className="stock-bar-wrap">
                                            <div className={`stock-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className={`stock-num ${cls}`}>{p.stock}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}