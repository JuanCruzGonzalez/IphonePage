import React, { useState, useEffect } from 'react';
import { Categoria, ProductoImagen } from '../../../core/types';
import { useProductos } from '../context/ProductosContext';
import { GestorImagenesProducto } from './GestorImagenesProducto';

interface ModalNuevoProductoProps {
  categorias: Categoria[];
}

export const ModalNuevoProducto = React.memo<ModalNuevoProductoProps>(({ 
  categorias,
}) => {
  const { 
    modalNuevoProducto, 
    productToEdit,
    categoriasDeProducto,
    handleNuevoProducto,
    handleEditarProducto,
    isCreatingProducto,
    isEditingProducto,
  } = useProductos();

  const isOpen = modalNuevoProducto.isOpen;
  const onClose = modalNuevoProducto.close;
  const initialProduct = productToEdit;
  const loading = productToEdit ? isEditingProducto : isCreatingProducto;
  const categoriasIniciales = categoriasDeProducto;

  const [nombre, setNombre] = useState(initialProduct?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(initialProduct?.descripcion ?? '');
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : '');
  const [costo, setCosto] = useState(initialProduct ? String(initialProduct.costo) : '');
  const [precioventa, setPrecioventa] = useState(initialProduct ? String(initialProduct.precioventa) : '');
  const [estadoProducto, setEstadoProducto] = useState<string>(initialProduct ? (initialProduct.estado ? '1' : '2') : '1');
  const [imagenes, setImagenes] = useState<ProductoImagen[]>(initialProduct?.imagenes || []);
  const [promocionActiva, setPromocionActiva] = useState(initialProduct?.promocion_activa ?? false);
  const [precioPromocion, setPrecioPromocion] = useState(initialProduct?.precio_promocion ? String(initialProduct.precio_promocion) : '');
  const [accesorio, setAccesorio] = useState(initialProduct?.accesorio ?? false);
  const [condicion, setCondicion] = useState<'nuevo' | 'usado_premium' | 'usado'>(initialProduct?.condicion ?? 'nuevo');
  const [destacado, setDestacado] = useState(initialProduct?.destacado ?? false);
  const [ordenDestacado, setOrdenDestacado] = useState(initialProduct?.orden_destacado ? String(initialProduct.orden_destacado) : '');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<number[]>(categoriasIniciales);
  const [modalCategoriasOpen, setModalCategoriasOpen] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setNombre(initialProduct.nombre ?? '');
      setDescripcion(initialProduct.descripcion ?? '');
      setStock(String(initialProduct.stock ?? ''));
      setCosto(String(initialProduct.costo ?? ''));
      setPrecioventa(String(initialProduct.precioventa ?? ''));
      
      const tienePromocion = initialProduct.promocion_activa ?? false;
      setPromocionActiva(tienePromocion);
      
      if (initialProduct.precio_promocion != null) {
        setPrecioPromocion(String(initialProduct.precio_promocion));
      } else {
        setPrecioPromocion('');
      }
      
      setEstadoProducto((initialProduct.estado ?? true) ? '1' : '2');
      setImagenes(initialProduct.imagenes || []);
      setAccesorio(initialProduct.accesorio ?? false);
      setCondicion(initialProduct.condicion ?? 'nuevo');
      setDestacado(initialProduct.destacado ?? false);
      if (initialProduct.orden_destacado != null) {
        setOrdenDestacado(String(initialProduct.orden_destacado));
      } else {
        setOrdenDestacado('');
      }
    } else {
      setNombre('');
      setDescripcion('');
      setStock('');
      setCosto('');
      setPrecioventa('');
      setEstadoProducto('1');
      setImagenes([]);
      setPromocionActiva(false);
      setPrecioPromocion('');
      setAccesorio(false);
      setCondicion('nuevo');
      setDestacado(false);
      setOrdenDestacado('');
      setCategoriasSeleccionadas([]);
    }
  }, [initialProduct, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCategoriasSeleccionadas(categoriasIniciales);
    }
  }, [categoriasIniciales, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!nombre.trim() || !stock) {
      return;
    }

    const precioPromocionFinal = promocionActiva && precioPromocion 
      ? parseFloat(precioPromocion)
      : null;

    const ordenDestacadoFinal = destacado && ordenDestacado 
      ? parseInt(ordenDestacado) 
      : null;

    const productoData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      stock: parseInt(stock),
      costo: parseInt(costo),
      precioventa: parseInt(precioventa),
      estado: estadoProducto === '1',
      promocionActiva: promocionActiva,
      precioPromocion: precioPromocionFinal,
      accesorio: accesorio,
      condicion: condicion,
      destacado: destacado,
      ordenDestacado: ordenDestacadoFinal,
    };

    if (initialProduct) {
      await handleEditarProducto(productoData, imagenes, categoriasSeleccionadas);
    } else {
      await handleNuevoProducto(productoData, imagenes, categoriasSeleccionadas);
    }

    // Reset form
    setNombre('');
    setDescripcion('');
    setStock('');
    setCosto('');
    setPrecioventa('');
    setImagenes([]);
    setPromocionActiva(false);
    setPrecioPromocion('');
    setAccesorio(false);
    setCondicion('nuevo');
    setDestacado(false);
    setOrdenDestacado('');
    setCategoriasSeleccionadas([]);
  };
  
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
            <label>Precio de Costo</label>
            <input
              type="number"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Precio de Venta</label>
            <input
              type="number"
              value={precioventa}
              onChange={(e) => setPrecioventa(e.target.value)}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={promocionActiva} 
                onChange={(e) => {
                  setPromocionActiva(e.target.checked);
                  if (!e.target.checked) {
                    setPrecioPromocion('');
                  }
                }}
                style={{width: 'fit-content'}}
              />
              <span>Precio Promocional</span>
            </label>
          </div>
          {promocionActiva && (
            <div className="form-group">
              <label>Precio Promocional</label>
              <input
                type="number"
                value={precioPromocion}
                onChange={(e) => setPrecioPromocion(e.target.value)}
                min="0"
                placeholder="0"
              />
            </div>
          )}
          <div className="form-group">
            <label>Estado</label>
            <select value={estadoProducto} onChange={(e) => setEstadoProducto(e.target.value)}>
              <option value="1">Activo</option>
              <option value="2">Inactivo</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={accesorio} 
                onChange={(e) => setAccesorio(e.target.checked)}
                style={{width: 'fit-content'}}
              />
              <span>Es un accesorio</span>
            </label>
          </div>
          <div className="form-group">
            <label>Condición</label>
            <select value={condicion} onChange={(e) => setCondicion(e.target.value as 'nuevo' | 'usado_premium' | 'usado')}>
              <option value="nuevo">Nuevo</option>
              <option value="usado_premium">Usado Premium</option>
              <option value="usado">Usado</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={destacado} 
                onChange={(e) => {
                  setDestacado(e.target.checked);
                  if (!e.target.checked) {
                    setOrdenDestacado('');
                  }
                }}
                style={{width: 'fit-content'}}
              />
              <span>Producto destacado</span>
            </label>
          </div>
          {destacado && (
            <div className="form-group">
              <label>Orden de destacado (menor número = mayor prioridad)</label>
              <input
                type="number"
                value={ordenDestacado}
                onChange={(e) => setOrdenDestacado(e.target.value)}
                min="1"
                placeholder="1"
              />
            </div>
          )}
          <div className="form-group">
            <label>Categorías</label>
            <button
              type="button"
              onClick={() => setModalCategoriasOpen(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>
                {categoriasSeleccionadas.length === 0 
                  ? 'Seleccionar categorías...'
                  : `${categoriasSeleccionadas.length} categoría${categoriasSeleccionadas.length !== 1 ? 's' : ''} seleccionada${categoriasSeleccionadas.length !== 1 ? 's' : ''}`
                }
              </span>
              <span style={{ color: '#666' }}>▼</span>
            </button>
            {categoriasSeleccionadas.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {categoriasSeleccionadas.map(catId => {
                  const cat = categorias.find(c => c.id_categoria === catId);
                  return cat ? (
                    <span
                      key={catId}
                      style={{
                        backgroundColor: '#e0e7ff',
                        color: '#4f46e5',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {cat.nombre}
                      <button
                        type="button"
                        onClick={() => setCategoriasSeleccionadas(categoriasSeleccionadas.filter(id => id !== catId))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4f46e5',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '14px',
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
          
          <GestorImagenesProducto
            productId={initialProduct?.id_producto}
            imagenesIniciales={imagenes}
            onImagenesChange={setImagenes}
          />

        </div>
        <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (initialProduct ? 'Actualizando...' : 'Guardando...') : (initialProduct ? 'Actualizar Producto' : 'Crear Producto')}
          </button>
        </div>
      </div>

      {/* Modal de selección de categorías */}
      {modalCategoriasOpen && (
        <div className="modal-overlay" style={{ zIndex: 1001 }} onClick={() => setModalCategoriasOpen(false)}>
          <div 
            className="modal-minimal" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-minimal-header">
              <h2>Seleccionar Categorías</h2>
              <button className="btn-close" onClick={() => setModalCategoriasOpen(false)}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {categorias.filter(c => c.estado).length === 0 ? (
                <p style={{ margin: 0, color: '#999', fontSize: '14px', textAlign: 'center' }}>No hay categorías disponibles</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {categorias.filter(c => c.estado).map(categoria => (
                    <label 
                      key={categoria.id_categoria}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: categoriasSeleccionadas.includes(categoria.id_categoria) ? '#f0f9ff' : '#fff',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!categoriasSeleccionadas.includes(categoria.id_categoria)) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!categoriasSeleccionadas.includes(categoria.id_categoria)) {
                          e.currentTarget.style.backgroundColor = '#fff';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={categoriasSeleccionadas.includes(categoria.id_categoria)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategoriasSeleccionadas([...categoriasSeleccionadas, categoria.id_categoria]);
                          } else {
                            setCategoriasSeleccionadas(categoriasSeleccionadas.filter(id => id !== categoria.id_categoria));
                          }
                        }}
                        style={{ 
                          width: '18px', 
                          height: '18px',
                          margin: 0,
                          cursor: 'pointer',
                          accentColor: '#3b82f6'
                        }}
                      />
                      <span style={{ flex: 1, fontWeight: categoriasSeleccionadas.includes(categoria.id_categoria) ? 600 : 400 }}>
                        {categoria.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-minimal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setCategoriasSeleccionadas([])}
                style={{ flex: 1 }}
              >
                Limpiar Todo
              </button>
              <button 
                className="btn-primary" 
                onClick={() => setModalCategoriasOpen(false)}
                style={{ flex: 1 }}
              >
                Confirmar ({categoriasSeleccionadas.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
