import React, { useState } from 'react';
import { CategoriaConHijos } from '../../../core/types';

interface ArbolCategoriasItemProps {
    categorias: CategoriaConHijos[];
    onEditar: (categoria: CategoriaConHijos) => void;
    onToggleEstado: (id_categoria: number, estadoActual: boolean, nombre: string) => void;
    expandidos: Set<number>;
    onToggleExpandir: (id: number) => void;
    nivel?: number;
}

const ArbolCategoriasItem: React.FC<ArbolCategoriasItemProps> = ({
    categorias,
    onEditar,
    onToggleEstado,
    expandidos,
    onToggleExpandir,
    nivel = 0,
}) => {
    if (categorias.length === 0) return null;

    return (
        <>
            {categorias.map(categoria => {
                const tieneHijos = categoria.hijos && categoria.hijos.length > 0;
                const estaExpandido = expandidos.has(categoria.id_categoria);

                return (
                    <React.Fragment key={categoria.id_categoria}>
                        <tr onClick={() => tieneHijos && onToggleExpandir(categoria.id_categoria)}
                            style={{
                                cursor: tieneHijos ? 'pointer' : 'default',
                                userSelect: 'none'
                            }}>
                            <td className="font-medium">
                                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: `${nivel * 24}px`, gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: `${nivel * 24}px` }}>
                                    {tieneHijos ? (
                                        <>
                                            {estaExpandido ? <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" version="1.1" id="Layer_1" width="20px" height="20px" viewBox="0 0 100 100" enable-background="new 0 0 100 100">
                                                <g>
                                                    <path d="M78.466,35.559L50.15,63.633L22.078,35.317c-0.777-0.785-2.044-0.789-2.828-0.012s-0.789,2.044-0.012,2.827L48.432,67.58   c0.365,0.368,0.835,0.563,1.312,0.589c0.139,0.008,0.278-0.001,0.415-0.021c0.054,0.008,0.106,0.021,0.16,0.022   c0.544,0.029,1.099-0.162,1.515-0.576l29.447-29.196c0.785-0.777,0.79-2.043,0.012-2.828S79.249,34.781,78.466,35.559z" />
                                                </g>
                                            </svg> 
                                            : 
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" version="1.1" id="Layer_1" width="20px" height="20px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" style={{ transform: 'rotate(180deg)' }}>
                                                <g>
                                                    <path d="M33.934,54.458l30.822,27.938c0.383,0.348,0.864,0.519,1.344,0.519c0.545,0,1.087-0.222,1.482-0.657   c0.741-0.818,0.68-2.083-0.139-2.824L37.801,52.564L64.67,22.921c0.742-0.818,0.68-2.083-0.139-2.824   c-0.817-0.742-2.082-0.679-2.824,0.139L33.768,51.059c-0.439,0.485-0.59,1.126-0.475,1.723   C33.234,53.39,33.446,54.017,33.934,54.458z" />
                                                </g>
                                            </svg>}
                                        </>
                                    ) : (
                                        <span style={{ width: '24px', display: 'inline-block' }}></span>
                                    )}
                                </div>
                                    #{categoria.id_categoria}
                                </div>
                            </td>
                            <td className="font-medium">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {categoria.nombre}
                                    {tieneHijos && (
                                        <span style={{
                                            marginLeft: '8px',
                                            fontSize: '12px',
                                            color: '#666',
                                            background: '#f0f0f0',
                                            padding: '2px 8px',
                                            borderRadius: '10px'
                                        }}>
                                            {categoria.hijos!.length} subcategoría{categoria.hijos!.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${categoria.estado ? 'active' : 'inactive'}`}>
                                    {categoria.estado ? 'Activa' : 'Inactiva'}
                                </span>
                            </td>
                            <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button
                                    className="btn-sm btn-secondary"
                                    aria-label="Editar"
                                    onClick={() => onEditar(categoria)}
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
                                {categoria.estado ? (
                                    <button
                                        className="btn-sm btn-danger"
                                        aria-label="Desactivar"
                                        onClick={() => onToggleEstado(categoria.id_categoria, categoria.estado, categoria.nombre)}
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
                                        onClick={() => onToggleEstado(categoria.id_categoria, categoria.estado, categoria.nombre)}
                                        style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 11l3 3L22 4"></path>
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                        </svg>
                                    </button>
                                )}
                            </td>
                        </tr>
                        {tieneHijos && estaExpandido && (
                            <ArbolCategoriasItem
                                categorias={categoria.hijos!}
                                onEditar={onEditar}
                                onToggleEstado={onToggleEstado}
                                expandidos={expandidos}
                                onToggleExpandir={onToggleExpandir}
                                nivel={nivel + 1}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};

// Componente contenedor que maneja el estado de expansión
interface ArbolCategoriasProps {
    categorias: CategoriaConHijos[];
    onEditar: (categoria: CategoriaConHijos) => void;
    onToggleEstado: (id_categoria: number, estadoActual: boolean, nombre: string) => void;
}

export const ArbolCategorias: React.FC<ArbolCategoriasProps> = ({
    categorias,
    onEditar,
    onToggleEstado,
}) => {
    const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

    const handleToggleExpandir = (id_categoria: number) => {
        const nuevosExpandidos = new Set(expandidos);
        if (nuevosExpandidos.has(id_categoria)) {
            nuevosExpandidos.delete(id_categoria);
        } else {
            nuevosExpandidos.add(id_categoria);
        }
        setExpandidos(nuevosExpandidos);
    };

    return (
        <ArbolCategoriasItem
            categorias={categorias}
            onEditar={onEditar}
            onToggleEstado={onToggleEstado}
            expandidos={expandidos}
            onToggleExpandir={handleToggleExpandir}
            nivel={0}
        />
    );
};
