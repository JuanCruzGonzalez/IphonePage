import { Producto } from "../../../core/types";

export default function TablaStock({ productosPaginados }: { productosPaginados: Producto[] }) {
    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Descripción</th>
                        <th>Stock Actual</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {productosPaginados.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="empty-state">
                                No hay productos para mostrar
                            </td>
                        </tr>
                    ) : (
                        productosPaginados.map(producto => (
                            <tr key={producto.id_producto}>
                                <td className="font-medium">{producto.nombre}</td>
                                <td className="text-muted">{producto.descripcion || '—'}</td>
                                <td>
                                    <span className={`stock-badge ${producto.stock < 10 ? 'low' : producto.stock < 30 ? 'medium' : 'high'}`}>
                                        {producto.stock} un
                                    </span>
                                </td>
                                <td>
                                    {producto.stock < 10 ? (
                                        <span className="status-badge danger">⚠️ Reponer</span>
                                    ) : producto.stock < 30 ? (
                                        <span className="status-badge warning">⚡ Atención</span>
                                    ) : (
                                        <span className="status-badge success">✓ Óptimo</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}