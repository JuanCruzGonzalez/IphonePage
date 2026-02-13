import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Producto, PromocionDetalleInput } from '../types';
import Cropper from 'react-easy-crop';
import { getPromocionImageUrl } from '../api/storageService';

interface ModalCrearPromocionProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  // initialPromotion used for editing
  initialPromotion?: { id_promocion: number; name: string; precio: number | null; productos: PromocionDetalleInput[]; estado: boolean; imagen_path?: string | null } | null;
  onSubmit: (payload: { name: string; precio: number | null; productos: PromocionDetalleInput[]; estado: boolean }, imageFile?: File | null) => void;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
  loading?: boolean;
}

export const ModalCrearPromocion: React.FC<ModalCrearPromocionProps> = ({ isOpen, onClose, productos, initialPromotion = null, onSubmit, showWarning, loading = false }) => {
  const [name, setName] = useState('');
  const [precio, setPrecio] = useState('');
  // items: productos agregados a la promoción (incluye nombre para mostrar)
  const [items, setItems] = useState<{ id_producto: number; cantidad: number; nombre?: string; unidadMedidaId?: number }[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [showProductosDropdown, setShowProductosDropdown] = useState(false);
  const [cantidadInput, setCantidadInput] = useState('1');
  const [estado, setEstado] = useState<'1' | '2'>('1');
  
  const productSearchRef = useRef<HTMLDivElement>(null);
  
  // Estados para imagen
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPrecio('');
      setItems([]);
      setEstado('1');
      setImageFile(null);
      setImagePreview(null);
      setImageToCrop(null);
      setShowCropper(false);
      setBusquedaProducto('');
      setShowProductosDropdown(false);
    } else {
      // populate when opening for edit
      if (initialPromotion) {
        setName(initialPromotion.name ?? '');
        setPrecio(initialPromotion.precio != null ? String(initialPromotion.precio) : '');
        setItems(Array.isArray(initialPromotion.productos) ? initialPromotion.productos.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad, nombre: productos.find(x => x.id_producto === p.id_producto)?.nombre })) : []);
        setEstado(initialPromotion.estado ? '1' : '2');
      } else {
        // creating new
        setName('');
        setPrecio('');
        setItems([]);
        setEstado('1');
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [isOpen]);

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
        setShowProductosDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar productos basado en la búsqueda
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) &&
    !items.find(it => it.id_producto === p.id_producto) // No mostrar productos ya agregados
  ).slice(0, 10); // Limitar a 10 resultados

  const seleccionarProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setBusquedaProducto(producto.nombre);
    setShowProductosDropdown(false);
  };

  // Funciones para manejo de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        showWarning?.('Por favor selecciona un archivo de imagen válido');
        return;
      }
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showWarning?.('La imagen debe ser menor a 5MB');
        return;
      }
      // Cargar imagen para recorte
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageToCrop(null);
    setShowCropper(false);
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas size to square (1:1 ratio)
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size,
      size
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (croppedBlob) {
        // Convert blob to File
        const file = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        
        // Create preview
        const previewUrl = URL.createObjectURL(croppedBlob);
        setImagePreview(previewUrl);
        
        setShowCropper(false);
        setImageToCrop(null);
      }
    } catch (error) {
      console.error('Error al recortar imagen:', error);
      showWarning?.('Error al procesar la imagen');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  if (!isOpen) return null;

  const agregarItem = () => {
    if (!productoSeleccionado) {
      showWarning?.('Por favor selecciona un producto');
      return;
    }
    
    const cant = parseInt(cantidadInput) || 0;
    if (cant <= 0) {
      showWarning?.('Ingrese una cantidad válida');
      return;
    }

    if (items.find(i => i.id_producto === productoSeleccionado.id_producto)) {
      showWarning?.('Este producto ya está agregado');
      return;
    }
    
    setItems(prev => [...prev, { 
      id_producto: productoSeleccionado.id_producto, 
      cantidad: cant, 
      nombre: productoSeleccionado.nombre, 
      unidadMedidaId: productoSeleccionado.id_unidad_medida 
    }]);
    
    setProductoSeleccionado(null);
    setBusquedaProducto('');
    setCantidadInput('1');
  };

  const setCantidad = (id: number, cantidad: number) => {
    setItems(prev => prev.map(it => it.id_producto === id ? { ...it, cantidad } : it));
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id_producto !== id));

  const handleSubmit = () => {
    if (!name.trim()) {
      showWarning?.('Ingrese un nombre para la promoción');
      return;
    }
    if (items.length === 0) {
      showWarning?.('Seleccione al menos un producto para la promoción');
      return;
    }

    const precioNum = precio === '' ? null : (isNaN(Number(precio)) ? null : Number(precio));

    onSubmit(
      { name: name.trim(), precio: precioNum, productos: items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })), estado: estado === '1' },
      imageFile
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-minimal-header">
          <h2>Nueva Promoción</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-minimal-body">
          <div className="form-group">
            <label>Nombre *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la promoción" />
          </div>
          <div className="form-group">
            <label>Precio (opcional)</label>
            <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio de la promoción" />
          </div>

          <div className="form-group" style={{ position: 'relative' }} ref={productSearchRef}>
            <label>Buscar y Agregar Productos</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => {
                    setBusquedaProducto(e.target.value);
                    setShowProductosDropdown(true);
                  }}
                  onFocus={() => setShowProductosDropdown(true)}
                  placeholder="Escribe para buscar productos..."
                  style={{ width: '100%' }}
                />
                {showProductosDropdown && busquedaProducto && productosFiltrados.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginTop: '4px'
                  }}>
                    {productosFiltrados.map(p => (
                      <div
                        key={p.id_producto}
                        onClick={() => seleccionarProducto(p)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: 500 }}>{p.nombre}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Stock: {p.stock} | ${p.id_unidad_medida === 1 ? (p.precioventa * 100).toFixed(2) : p.precioventa.toFixed(2)}{p.id_unidad_medida === 1 ? ' x100gr' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input 
                type="number" 
                min={1} 
                value={cantidadInput} 
                onChange={(e) => setCantidadInput(e.target.value)} 
                placeholder="Cantidad"
                style={{ width: 100 }} 
              />
              <button 
                className="btn-secondary" 
                onClick={agregarItem}
                disabled={loading || !productoSeleccionado}
              >
                + Agregar
              </button>
            </div>

            {items.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <h4>Productos agregados</h4>
                {items.map(it => (
                  <div key={it.id_producto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px' }}>
                    <div>
                      <span>{it.nombre ?? ('#' + it.id_producto)} × </span>
                      <input type="number" min={1} value={String(it.cantidad)} onChange={(e) => setCantidad(it.id_producto, e.target.value === '' ? 1 : parseInt(e.target.value))} style={{ width: 80 }} />
                    </div>
                    <div>
                      <button className="btn-remove" onClick={() => removeItem(it.id_producto)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value as any)}>
              <option value="1">Activo</option>
              <option value="2">Inactivo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Imagen de la Promoción</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'block', marginBottom: '0.5rem' }}
            />
            {imagePreview && (
              <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'rgba(255, 0, 0, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: '1',
                    padding: '0'
                  }}
                >
                  ×
                </button>
              </div>
            )}
            {!imagePreview && initialPromotion?.imagen_path && (
              <div style={{ marginTop: '0.5rem' }}>
                <img 
                  src={getPromocionImageUrl(initialPromotion.imagen_path) || undefined} 
                  alt="Imagen actual" 
                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>Imagen actual (sube una nueva para reemplazar)</p>
              </div>
            )}
          </div>
        </div>
          <div className="modal-minimal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? (initialPromotion ? 'Actualizando...' : 'Guardando...') : (initialPromotion ? 'Actualizar Promoción' : 'Crear Promoción')}</button>
        </div>
      </div>

      {/* Modal de recorte de imagen */}
      {showCropper && imageToCrop && (
        <div className="modal-overlay" style={{ zIndex: 1002 }} onClick={handleCropCancel}>
          <div 
            className="modal-minimal" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-minimal-header">
              <h2>Recortar Imagen (1:1)</h2>
              <button className="btn-close" onClick={handleCropCancel}>×</button>
            </div>
            <div style={{ position: 'relative', flex: 1, minHeight: 0, backgroundColor: '#000' }}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #ddd' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" onClick={handleCropCancel} style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleCropConfirm} style={{ flex: 1 }}>
                  Confirmar Recorte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalCrearPromocion;
