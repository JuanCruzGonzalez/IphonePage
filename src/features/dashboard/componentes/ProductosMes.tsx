import { formatCurrency } from "../../../shared/utils";
import { IconStar } from "./iconos";

export default function ProductosMes({ topProductos, maxUnidades, loadingMes }: { topProductos: any[], maxUnidades: number, loadingMes: boolean }) {
    return (
        <div className="dashboard-section-card">
            <div className="section-card-header">
                <h3>
                    <span className="header-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><IconStar /></span>
                    Top productos del mes
                </h3>
            </div>
            <div className="section-card-body">
                {loadingMes ? (
                    <div className="empty-state">Cargando…</div>
                ) : topProductos.length === 0 ? (
                    <div className="empty-state">Sin ventas este mes</div>
                ) : (
                    <table className="top-productos-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th style={{ textAlign: 'center' }}>Uds.</th>
                                <th>Ingresos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProductos.map((p, i) => (
                                <tr key={p.nombre + i}>
                                    <td><span className={`top-rank r${i + 1}`}>{i + 1}</span></td>
                                    <td><span className="top-nombre" title={p.nombre}>{p.nombre}</span></td>
                                    <td className="top-unidades">{p.unidades}</td>
                                    <td>
                                        <div className="revenue-bar-wrap">
                                            <div className="revenue-bar-fill" style={{ width: `${(p.unidades / maxUnidades) * 100}%` }} />
                                        </div>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{formatCurrency(p.revenue)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}