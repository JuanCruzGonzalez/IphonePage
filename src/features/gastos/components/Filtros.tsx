interface FiltrosProps {
  filtroEstado: 'all' | 'activo' | 'inactivo';
  onFiltroChange: (value: 'all' | 'activo' | 'inactivo') => void;
}

export default function Filtros({ filtroEstado, onFiltroChange }: FiltrosProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingRight: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', margin: '8px', alignItems: 'center' }}>
                <select
                    value={filtroEstado}
                    onChange={(e) => onFiltroChange(e.target.value as 'all' | 'activo' | 'inactivo')}
                    style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', color: '#333' }}
                >
                    <option value="all">Todos</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                </select>
            </div>
        </div>
    );
}