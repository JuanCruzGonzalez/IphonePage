import { formatCurrency } from "../../../shared/utils";
import { calcVentaTotal } from "../funciones";
import { IconCart } from "./iconos";

export default function UltimasVentas({ ventasMes, loadingMes }: { ventasMes: any[], loadingMes: boolean }) {
    return (
        <div className="dashboard-section-card">
            <div className="section-card-header">
                <h3>
                    <span className="header-icon" style={{ background: '#d1fae5', color: '#059669' }}><IconCart /></span>
                    Últimas ventas
                </h3>
            </div>
            <div className="section-card-body">
                {loadingMes ? (
                    <div className="empty-state">Cargando…</div>
                ) : ventasMes.length === 0 ? (
                    <div className="empty-state">Sin ventas este mes</div>
                ) : (
                    <ul className="ultimas-ventas-list">
                        {[...ventasMes]
                            .sort((a, b) => b.id_venta - a.id_venta)
                            .slice(0, 7)
                            .map((v) => {
                                const total = calcVentaTotal(v);
                                const items = v.detalle_venta.length;
                                return (
                                    <li key={v.id_venta}>
                                        <div className="venta-dot" />
                                        <div className="venta-info">
                                            <div className="venta-titulo">
                                                Venta #{v.id_venta} — {items} ítem{items !== 1 ? 's' : ''}
                                            </div>
                                            <div className="venta-fecha">{v.fecha}</div>
                                        </div>
                                        <div className="venta-monto">{formatCurrency(total)}</div>
                                    </li>
                                );
                            })}
                    </ul>
                )}
            </div>
        </div>
    )
}