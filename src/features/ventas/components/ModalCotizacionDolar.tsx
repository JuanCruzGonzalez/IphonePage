import React, { useState, useEffect } from 'react';
import { CotizacionDolar } from '../../../core/types';
import { 
  getCotizacionActual, 
  getUltimasCotizaciones,
  registrarCotizacion 
} from '../services/cotizacionService';
import { formatCurrency, formatDate } from '../../../shared/utils';
import { useToast } from '../../../shared/hooks/useToast';

interface ModalCotizacionDolarProps {
  isOpen: boolean;
  onClose: () => void;
  onCotizacionActualizada?: (nuevaCotizacion: number) => void;
}

export const ModalCotizacionDolar: React.FC<ModalCotizacionDolarProps> = ({
  isOpen,
  onClose,
  onCotizacionActualizada,
}) => {
  const [cotizacionActual, setCotizacionActual] = useState<number>(1000);
  const [nuevaCotizacion, setNuevaCotizacion] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [historial, setHistorial] = useState<CotizacionDolar[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    try {
      setLoadingHistorial(true);
      const [actual, ultimas] = await Promise.all([
        getCotizacionActual(),
        getUltimasCotizaciones(10)
      ]);
      
      setCotizacionActual(actual);
      setNuevaCotizacion(String(actual));
      setHistorial(ultimas);
    } catch (error) {
      console.error('Error al cargar datos de cotización:', error);
      showError('Error al cargar datos de cotización');
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valor = parseFloat(nuevaCotizacion);

    if (isNaN(valor) || valor <= 0) {
      showWarning('Ingresa un valor válido para la cotización');
      return;
    }

    try {
      setLoading(true);
      const resultado = await registrarCotizacion({
        valor,
        observaciones: observaciones.trim() || undefined,
      });

      if (resultado) {
        showSuccess(`Cotización actualizada a ${formatCurrency(valor)}`);
        setCotizacionActual(valor);
        setObservaciones('');
        await cargarDatos();
        onCotizacionActualizada?.(valor);
      } else {
        showWarning('La cotización no cambió (mismo valor que la actual)');
      }
    } catch (error) {
      console.error('Error al registrar cotización:', error);
      showError('Error al registrar la cotización');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setObservaciones('');
    setNuevaCotizacion(String(cotizacionActual));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">💵 Cotización del Dólar</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Cotización Actual */}
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '2px solid #0ea5e9'
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369a1', fontWeight: 500 }}>
              Cotización Actual
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: '#0c4a6e' }}>
              {formatCurrency(cotizacionActual)}
            </p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#0369a1' }}>
              1 USD = $ {cotizacionActual.toFixed(2)} ARS
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nueva Cotización (pesos por dólar)</label>
              <input
                type="number"
                value={nuevaCotizacion}
                onChange={(e) => setNuevaCotizacion(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Ej: 1050.50"
                required
              />
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#64748b' }}>
                Ingresa cuántos pesos vale 1 dólar estadounidense
              </small>
            </div>

            <div className="form-group">
              <label>Observaciones (opcional)</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                placeholder="Ej: Actualización según el Banco Central"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Actualizar Cotización'}
              </button>
            </div>
          </form>

          {/* Historial Reciente */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Historial Reciente
            </h3>
            
            {loadingHistorial ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando historial...</p>
            ) : historial.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>No hay historial disponible</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th style={{ textAlign: 'right' }}>Cotización</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((cotizacion) => (
                      <tr key={cotizacion.id_cotizacion}>
                        <td>{formatDate(cotizacion.fecha)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>
                          ${cotizacion.valor.toFixed(2)}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                          {cotizacion.observaciones || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
