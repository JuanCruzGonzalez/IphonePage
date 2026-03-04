import { IconAlta, IconEditar, IconEliminar, IconVer } from "../../../shared/components/Iconos";
import { usePromociones } from "../context/PromocionesContext";
import BotonAccion from "./BotonAccion";

export default function TablaPromociones() {

    const { promociones, handleVerPromocion, handleEditarPromocion, handleChangePromocion } = usePromociones();
    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {promociones.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="empty-state">No hay promociones registradas</td>
                        </tr>
                    ) : (
                        promociones.map(p => (
                            <tr key={p.id_promocion}>
                                <td className="font-medium">{p.name}</td>
                                <td className="text-muted">{p.precio != null ? `$${p.precio}` : '-'}</td>
                                <td>
                                    <span className={`status-badge ${p.estado ? 'active' : 'inactive'}`}>{p.estado ? 'Activo' : 'Inactivo'}</span>
                                </td>
                                <td>
                                    <div className="flex gap-8">
                                        <BotonAccion handle={handleVerPromocion} p={p} icon={<IconVer />} tipo='ver' />
                                        <BotonAccion handle={handleEditarPromocion} p={p} icon={<IconEditar />} tipo='editar' />
                                        {p.estado ? (
                                            <BotonAccion handle={() => handleChangePromocion(p.id_promocion, false)} p={p} icon={<IconEliminar />} tipo='eliminar' />
                                        ) : (
                                            <BotonAccion handle={() => handleChangePromocion(p.id_promocion, true)} p={p} icon={<IconAlta />} tipo='cambiar-estado' />
                                        )}
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