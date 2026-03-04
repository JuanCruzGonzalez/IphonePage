import { Producto } from "../../../core/types";

export default function EstadisticasStock({ stockBajo, productos }: { stockBajo: Producto[]; productos: Producto[] }) {
    const stockMedio = productos.filter(p => p.stock >= 10 && p.stock < 30);
    const stockAlto = productos.filter(p => p.stock >= 30);
    return (
        <div className="stats-grid">
            <div className="stat-card-minimal danger">
                <div className="stat-label">Stock Bajo (&lt;10)</div>
                <div className="stat-value">{stockBajo.length}</div>
            </div>
            <div className="stat-card-minimal warning">
                <div className="stat-label">Stock Medio (10-29)</div>
                <div className="stat-value">{stockMedio.length}</div>
            </div>
            <div className="stat-card-minimal success">
                <div className="stat-label">Stock Alto (≥30)</div>
                <div className="stat-value">{stockAlto.length}</div>
            </div>
        </div>
    )
}