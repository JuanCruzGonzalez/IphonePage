import React, { useState, useEffect, useRef } from 'react';
import { Cliente } from '../../../core/types';
import { buscarClientes } from '../../clientes/services/clienteService';

export interface PlanDePagoFormConfig {
  id_cliente?: string;
  cliente_nombre: string;
  cliente_telefono: string;
  numero_cuotas: number;
}

interface Props {
  totalMonto: number;
  onChange: (config: PlanDePagoFormConfig) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 4,
  border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box',
};

export const PlanDePagoForm: React.FC<Props> = ({ totalMonto, onChange }) => {
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [numCuotas, setNumCuotas] = useState(3);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notificar al padre cuando cambia la config
  useEffect(() => {
    onChange({
      id_cliente: clienteSeleccionado?.id_cliente,
      cliente_nombre: nombre,
      cliente_telefono: telefono,
      numero_cuotas: numCuotas,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, telefono, numCuotas, clienteSeleccionado]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBuscar = async (q: string) => {
    setBusqueda(q);
    setShowDropdown(true);
    if (q.length < 2) { setSugerencias([]); return; }
    try {
      const results = await buscarClientes(q);
      setSugerencias(results.slice(0, 6));
    } catch {
      setSugerencias([]);
    }
  };

  const seleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    const nombreCompleto = `${cliente.nombre ?? ''} ${cliente.apellido ?? ''}`.trim();
    setNombre(nombreCompleto);
    setTelefono(cliente.telefono ?? '');
    setBusqueda(nombreCompleto);
    setSugerencias([]);
    setShowDropdown(false);
  };

  const limpiarCliente = () => {
    setClienteSeleccionado(null);
    setBusqueda('');
    setNombre('');
    setTelefono('');
  };

  const montoCuota = numCuotas > 0
    ? Math.round((totalMonto / numCuotas) * 100) / 100
    : 0;

  return (
    <div style={{ border: '1px solid #e3b44a', borderRadius: 8, padding: 12, background: '#fffdf0', marginTop: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 10, color: '#92610c', fontSize: 14 }}>
        🗓️ Configuración del Plan
      </div>

      {/* Buscar cliente registrado */}
      <div className="form-group" style={{ position: 'relative', marginBottom: 10 }} ref={searchRef}>
        <label style={{ fontSize: 13 }}>Buscar cliente registrado (opcional)</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => handleBuscar(e.target.value)}
            onFocus={() => busqueda.length >= 2 && setShowDropdown(true)}
            placeholder="Nombre, apellido o teléfono..."
            style={inputStyle}
          />
          {clienteSeleccionado && (
            <button
              type="button"
              onClick={limpiarCliente}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 16 }}
            >✕</button>
          )}
        </div>
        {showDropdown && sugerencias.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 4, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {sugerencias.map(c => (
              <div
                key={c.id_cliente}
                onClick={() => seleccionarCliente(c)}
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f0f0f0' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              >
                <div>{c.nombre} {c.apellido}</div>
                <div style={{ color: '#888', fontSize: 11 }}>{c.email} · {c.telefono}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nombre y Teléfono */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div className="form-group">
          <label style={{ fontSize: 13 }}>Nombre <span style={{ color: 'red' }}>*</span></label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del cliente" style={inputStyle} />
        </div>
        <div className="form-group">
          <label style={{ fontSize: 13 }}>Teléfono <span style={{ color: 'red' }}>*</span></label>
          <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono" style={inputStyle} />
        </div>
      </div>

      {/* Cuotas y resumen */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ fontSize: 13 }}>Cuotas <span style={{ color: 'red' }}>*</span></label>
          <input
            type="number"
            min={2}
            max={24}
            value={numCuotas}
            onChange={e => setNumCuotas(Math.max(2, parseInt(e.target.value) || 2))}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: '#fff', borderRadius: 6, padding: '8px 12px', border: '1px solid #ddd', marginBottom: 0 }}>
          <div style={{ fontSize: 11, color: '#888' }}>Por cuota</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#92610c' }}>${montoCuota.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: '#aaa' }}>de ${totalMonto.toFixed(2)} total</div>
        </div>
      </div>
    </div>
  );
};
