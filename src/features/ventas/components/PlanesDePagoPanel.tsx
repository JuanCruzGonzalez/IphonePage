import React, { useState } from 'react';
import { PlanDePago } from '../../../core/types';
import { useVentas } from '../context/VentasContext';
import Card from '../../../shared/components/Card';
import ModalPlanDePagoDetalle from './ModalPlanDePagoDetalle';
import '../styles/estilosVentas.css'; // Asegúrate de crear este archivo para estilos específicos
import { IconVer } from '../../../shared/components/Iconos';

const ESTADOS = ['activo', 'completado', 'cancelado', 'todos'] as const;
type FiltroEstado = typeof ESTADOS[number];

const estadoBadge = (estado: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    activo: { bg: '#dbeafe', text: '#1e40af' },
    completado: { bg: '#d1fae5', text: '#065f46' },
    cancelado: { bg: '#fee2e2', text: '#991b1b' },
  };
  const c = colors[estado] ?? { bg: '#f3f4f6', text: '#374151' };
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: '2px 8px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
    }}>
      {estado}
    </span>
  );
};

const BarraCuotas: React.FC<{ plan: PlanDePago }> = ({ plan }) => {
  const pct = plan.numero_cuotas > 0
    ? (plan.cuotas_pagadas / plan.numero_cuotas) * 100
    : 0;
  const color = plan.estado === 'completado' ? '#10b981' : '#3b82f6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 9999, height: 6, minWidth: 60 }}>
        <div style={{ background: color, borderRadius: 9999, height: '100%', width: `${pct}%`, transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>
        {plan.cuotas_pagadas}/{plan.numero_cuotas}
      </span>
    </div>
  );
};

export const PlanesDePagoPanel: React.FC = () => {
  const { planes, planesLoading, recargarPlanes, handleRegistrarPago, handleCancelarPlanDePago } = useVentas();
  const [filtro, setFiltro] = useState<FiltroEstado>('activo');
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanDePago | null>(null);

  const handlePlanSeleccionado = (plan: PlanDePago | null) => {
    setPlanSeleccionado(plan);
  }

  const planesFiltrados = filtro === 'todos'
    ? planes
    : planes.filter(p => p.estado === filtro);

  return (
    <>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', margin: '20px 0' }}>
        <select name="estados" id="1" onChange={(e) => setFiltro(e.target.value as FiltroEstado)} value={filtro} style={{ fontSize: 13, padding: '4px 14px', backgroundColor: 'white', color: 'black', borderRadius: 4, border: '1px solid #d1d5db' }}>
          {ESTADOS.map(e => (
            <option key={e} value={e} className='btn-secondary' style={{ fontSize: 13, padding: '4px 14px' }}>
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </option>
          ))}
        </select>
        <button onClick={recargarPlanes} className="btn-secondary" style={{ fontSize: 13, padding: '4px 14px' }}>
          🔄 Recargar
        </button>
      </div>
      <Card>
        {planesLoading && (
          <div className='no-planes'>Cargando planes...</div>
        )}

        {!planesLoading && planesFiltrados.length === 0 && (
          <div className='no-planes'>
            No hay planes con estado <strong>{filtro}</strong>
          </div>
        )}

        {!planesLoading && planesFiltrados.length > 0 && (
          <div className='table-wrapper'>
            <table className='table'>
              <thead>
                <tr>
                  {['#', 'Cliente', 'Venta', 'Total', 'Cuotas', 'Por cuota', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="headerTable">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planesFiltrados.map(plan => (
                  <tr key={plan.id_plan}>
                    <td className='td-padding font-gray font-size-12'>#{plan.id_plan}</td>
                    <td className='td-padding'>
                      <div className='font-500'>{plan.cliente.nombre}</div>
                      <div className='font-size-11 font-gray'>{plan.cliente.telefono}</div>
                    </td>
                    <td className='td-padding font-gray font-size-12'>#{plan.venta.id_venta}</td>
                    <td className='td-padding font-600'>${plan.monto_total.toFixed(2)}</td>
                    <td className='td-padding min-width-120'>
                      <BarraCuotas plan={plan} />
                    </td>
                    <td className='td-padding'>${plan.monto_cuota.toFixed(2)}</td>
                    <td className='td-padding'>{estadoBadge(plan.estado)}</td>
                    <td className='td-padding'>
                      <div className='acciones-container'>
                        <button
                          onClick={() => handlePlanSeleccionado(plan)}
                          className="btn-secondary accion"
                        >
                          <IconVer />
                        </button>
                        {plan.estado === 'activo' && (
                          <>
                            <button
                              onClick={() => handleRegistrarPago(plan.id_plan)}
                              className="btn-primary accion"
                            >
                              + Cuota
                            </button>
                            <button
                              onClick={() => handleCancelarPlanDePago(plan.id_plan)}
                              className="btn-secondary accion danger"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {planSeleccionado && (
        <ModalPlanDePagoDetalle plan={planSeleccionado} onClose={() => handlePlanSeleccionado(null)} />
      )}
    </>
  );
};
