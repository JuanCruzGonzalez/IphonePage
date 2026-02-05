import React, { useState, useEffect } from 'react';
import { UnidadMedida } from '../types';

interface ModalNuevoProductoProps {
  isOpen: boolean;
  onClose: () => void;
  unidadesMedida: UnidadMedida[];
  onSubmit: (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number; estado: boolean; vencimiento?: Date | null}) => void;
  initialProduct?: {
    id_producto: number;
    nombre: string;
    descripcion: string | null;
    stock: number;
    costo: number;
    precioventa: number;
    id_unidad_medida: number;
    estado: boolean;
    vencimiento?: Date | null;
  } | null;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
  loading?: boolean;
}

export const ModalNuevoProducto: React.FC<ModalNuevoProductoProps> = ({ 
  isOpen, 
  onClose, 
  unidadesMedida, 
  onSubmit,
  showWarning,
  initialProduct = null,
  loading = false,
}) => {
  const [nombre, setNombre] = useState(initialProduct?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(initialProduct?.descripcion ?? '');
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : '');
  const [costo, setCosto] = useState(initialProduct ? String(initialProduct.costo) : '');
  const [precioventa, setPrecioventa] = useState(initialProduct ? String(initialProduct.precioventa) : '');
  const [unidadMedida, setUnidadMedida] = useState(initialProduct ? String(initialProduct.id_unidad_medida) : '');
  const [estadoProducto, setEstadoProducto] = useState<string>(initialProduct ? (initialProduct.estado ? '1' : '2') : '1');
  const [vencimiento, setVencimiento] = useState<string>(
    initialProduct?.vencimiento 
      ? new Date(initialProduct.vencimiento).toISOString().split('T')[0]
      : ''
  );

  useEffect(() => {
    if (initialProduct) {
      setNombre(initialProduct.nombre ?? '');
      setDescripcion(initialProduct.descripcion ?? '');
      setStock(String(initialProduct.stock ?? ''));
      if (initialProduct.id_unidad_medida === 1) {
        setCosto(initialProduct.costo != null ? String(initialProduct.costo * 100) : '');
      } else {
        setCosto(String(initialProduct.costo ?? ''));
      }
      if (initialProduct.id_unidad_medida === 1) {
        setPrecioventa(initialProduct.precioventa != null ? String(initialProduct.precioventa * 100) : '');
      } else {
        setPrecioventa(String(initialProduct.precioventa ?? ''));
      }
      setUnidadMedida(String(initialProduct.id_unidad_medida ?? ''));
      setEstadoProducto((initialProduct.estado ?? true) ? '1' : '2');
      setVencimiento(
        initialProduct.vencimiento 
          ? new Date(initialProduct.vencimiento).toISOString().split('T')[0]
          : ''
      );
    } else {
      setNombre('');
      setDescripcion('');
      setStock('');
      setCosto('');
      setPrecioventa('');
      setUnidadMedida('');
      setEstadoProducto('1');
      setVencimiento('');
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!nombre.trim() || !stock) {
      showWarning?.('Complete los campos requeridos');
      return;
    }

    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      stock: parseInt(stock),
      costo: unidadMedida === '1' ? parseInt(costo)/100 : parseInt(costo),
      precioventa: unidadMedida === '1' ? parseInt(precioventa)/100 : parseInt(precioventa),
      unidadMedida: parseInt(unidadMedida),
      estado: estadoProducto === '1',
      vencimiento: vencimiento ? new Date(vencimiento) : null,
    });

    setNombre('');
    setDescripcion('');
    setStock('');
    setCosto('');
    setPrecioventa('');
    setUnidadMedida('');
    setVencimiento('');
  };
  const textoGramos = unidadMedida === '1' ? '(por 100 gramos)' : '';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>{initialProduct ? 'Actualizar Producto' : 'Nuevo Producto'}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Unidad de Medida</label>
            <select value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)}>
              <option value="">Seleccionar Unidad de Medida</option>
              {unidadesMedida.map(p => (
                <option key={p.id_unidad_medida} value={p.id_unidad_medida}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Stock inicial *</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Precio de Costo {textoGramos}</label>
            <input
              type="number"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Precio de Venta {textoGramos}</label>
            <input
              type="number"
              value={precioventa}
              onChange={(e) => setPrecioventa(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select value={estadoProducto} onChange={(e) => setEstadoProducto(e.target.value)}>
              <option value="1">Activo</option>
              <option value="2">Inavilitado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha de Vencimiento</label>
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (initialProduct ? 'Actualizando...' : 'Guardando...') : (initialProduct ? 'Actualizar Producto' : 'Crear Producto')}
          </button>
        </div>
      </div>
    </div>
  );
};
