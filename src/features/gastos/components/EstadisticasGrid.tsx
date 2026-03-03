import { Gasto } from "../../../core/types";
import EstadisticaCard from "./EstadisticaCard";


export default function EstadisticasGrid({ gastos }: { gastos: Gasto[] }) {

    const gastosActivos = gastos.filter(g => g.estado === true);
    const totalGastosActivos = gastosActivos.reduce((sum, g) => sum + g.costo, 0);
    
    return (
        <div className="stats-grid">
            <EstadisticaCard title="Total Gastos Activos" value={totalGastosActivos} />
            <EstadisticaCard title="Gastos Activos" value={gastosActivos.length} />
            <EstadisticaCard title="Total de Gastos" value={gastos.length} />
        </div>
    )
}