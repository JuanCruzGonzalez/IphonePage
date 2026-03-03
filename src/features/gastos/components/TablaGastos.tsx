import { Gasto } from "../../../core/types";
import { formatPrice } from "../../../shared/utils";

export default function TablaGastos({ gastosFiltrados, handleEditarGasto, handleToggleGastoEstado }: { gastosFiltrados: Gasto[], handleEditarGasto: (gasto: Gasto) => void, handleToggleGastoEstado: (id: number, estado: boolean, descripcion: string) => void }) {
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Costo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {gastosFiltrados.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="empty-state">
                            No hay gastos para mostrar
                        </td>
                    </tr>
                ) : (
                    gastosFiltrados.map(gasto => (
                        <tr key={gasto.id_gasto}>
                            <td className="font-medium">#{gasto.id_gasto}</td>
                            <td>{gasto.descripcion || <span className="text-muted">Sin descripción</span>}</td>
                            <td className="font-medium">{formatPrice(gasto.costo)}</td>
                            <td>
                                <span className={`status-badge ${gasto.estado ? 'active' : 'inactive'}`}>
                                    {gasto.estado ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button
                                    className="btn-sm btn-secondary"
                                    aria-label="Editar"
                                    onClick={() => handleEditarGasto(gasto)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                                        <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                    </svg>
                                </button>
                                {gasto.estado ? (
                                    <button
                                        className="btn-sm btn-danger"
                                        aria-label="Desactivar"
                                        onClick={() => handleToggleGastoEstado(gasto.id_gasto, gasto.estado, gasto.descripcion!)}
                                        style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                            <path d="M10 11v6"></path>
                                            <path d="M14 11v6"></path>
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        className="btn-sm btn-primary"
                                        aria-label="Activar"
                                        onClick={() => handleToggleGastoEstado(gasto.id_gasto, gasto.estado, gasto.descripcion!)}
                                        style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    )
}