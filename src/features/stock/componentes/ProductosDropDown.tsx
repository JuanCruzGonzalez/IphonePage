import { Producto } from "../../../core/types";

export default function ProductosDropDown({ productosFiltrados, seleccionarProducto }: { productosFiltrados: Producto[], seleccionarProducto: (producto: Producto) => void }) {
    return (
        <div className='item-buscador'>
            {
                productosFiltrados.map(p => (
                    <div
                        key={p.id_producto}
                        onClick={() => seleccionarProducto(p)}
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: '14px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {p.nombre}
                            {p.accesorio && (
                                <span style={{ fontSize: '10px', padding: '2px 4px', backgroundColor: '#f0fdf4', borderRadius: '3px', color: '#16a34a', fontWeight: 500 }}>
                                    Accesorio
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Stock actual: {p.stock}
                        </div>
                    </div>
                ))
            }
        </div>
    )
}