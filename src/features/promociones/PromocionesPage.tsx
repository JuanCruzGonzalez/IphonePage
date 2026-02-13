import React from 'react';
import { Promocion } from '../../core/types';

interface PromocionesPageProps {
    promociones: Promocion[];
    onNuevoPromocion: () => void;
    onEditPromocion?: (promocion: Promocion) => void;
    onChangePromocion?: (id_promocion: number, estado: boolean) => void;
    onViewPromocion?: (promocion: Promocion) => void;
}

export const PromocionesPage: React.FC<PromocionesPageProps> = ({ promociones, onNuevoPromocion, onEditPromocion, onChangePromocion, onViewPromocion }) => {
    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Promociones</h1>
                    <p className="page-subtitle">Crea y administra promociones</p>
                </div>
                <button className="btn-primary" onClick={onNuevoPromocion}>+ Nueva Promoción</button>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Estado</th>
                                <th>Productos</th>
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
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10, backgroundColor: '#f0f0f0' }} className="btn-sm btn-secondary mr-2" onClick={() => onViewPromocion?.(p)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                                                        <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10, backgroundColor: '#f0f0f0' }} className="btn-sm btn-secondary mr-2" onClick={() => onEditPromocion?.(p)}>
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
                                                        className="icon-pencil"
                                                    >
                                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                                                        <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                                    </svg>
                                                </button>
                                                {p.estado ? (
                                                    <button className="btn-sm btn-danger" style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }} onClick={() => onChangePromocion?.(p.id_promocion, false)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                                            <path d="M10 11v6"></path>
                                                            <path d="M14 11v6"></path>
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <button className="btn-sm btn-primary" style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }} onClick={() => onChangePromocion?.(p.id_promocion, true)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z" fill="#fff" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PromocionesPage;
