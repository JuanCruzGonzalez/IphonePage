import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { UnidadMedida, Categoria } from '../../../core/types';
import { getProductImageUrl } from '../../../shared/services/storageService';
import { useProductos } from '../context/ProductosContext';

interface ModalNuevoProductoProps {
  unidadesMedida: UnidadMedida[];
  categorias: Categoria[];
}

export const ModalNuevoProducto = React.memo<ModalNuevoProductoProps>(({ 
  unidadesMedida,
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
  const [unidadMedida, setUnidadMedida] = useState(initialProduct ? String(initialProduct.id_unidad_medida) : '');
  const [estadoProducto, setEstadoProducto] = useState<string>(initialProduct ? (initialProduct.estado ? '1' : '2') : '1');
  const [vencimiento, setVencimiento] = useState<string>(
    initialProduct?.vencimiento 
      ? new Date(initialProduct.vencimiento).toISOString().split('T')[0]
      : ''
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [promocionActiva, setPromocionActiva] = useState(initialProduct?.promocion_activa ?? false);
  const [precioPromocion, setPrecioPromocion] = useState(initialProduct?.precio_promocion ? String(initialProduct.precio_promocion) : '');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<number[]>(categoriasIniciales);
  const [modalCategoriasOpen, setModalCategoriasOpen] = useState(false);

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
      
      // Actualizar promoción
      const tienePromocion = initialProduct.promocion_activa ?? false;
      setPromocionActiva(tienePromocion);
      
      if (initialProduct.precio_promocion != null) {
        if (initialProduct.id_unidad_medida === 1) {
          setPrecioPromocion(String(initialProduct.precio_promocion * 100));
        } else {
          setPrecioPromocion(String(initialProduct.precio_promocion));
        }
      } else {
        setPrecioPromocion('');
      }
      
      setUnidadMedida(String(initialProduct.id_unidad_medida ?? ''));
      setEstadoProducto((initialProduct.estado ?? true) ? '1' : '2');
      setVencimiento(
        initialProduct.vencimiento 
          ? new Date(initialProduct.vencimiento).toISOString().split('T')[0]
          : ''
      );
      setImageFile(null);
      setImagePreview(null);
      setImageToCrop(null);
      setShowCropper(false);
    } else {
      setNombre('');
      setDescripcion('');
      setStock('');
      setCosto('');
      setPrecioventa('');
      setUnidadMedida('');
      setEstadoProducto('1');
      setVencimiento('');
      setImageFile(null);
      setImagePreview(null);
      setImageToCrop(null);
      setShowCropper(false);
      setPromocionActiva(false);
      setPrecioPromocion('');
      setCategoriasSeleccionadas([]);
    }
  }, [initialProduct, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCategoriasSeleccionadas(categoriasIniciales);
    }
  }, [categoriasIniciales, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        return;
      }
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
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
      // Error processing image
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!nombre.trim() || !stock) {
      return;
    }

    const precioPromocionFinal = promocionActiva && precioPromocion 
      ? (unidadMedida === '1' ? parseFloat(precioPromocion) / 100 : parseFloat(precioPromocion))
      : null;

    const productoData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      stock: parseInt(stock),
      costo: unidadMedida === '1' ? parseInt(costo)/100 : parseInt(costo),
      precioventa: unidadMedida === '1' ? parseInt(precioventa)/100 : parseInt(precioventa),
      unidadMedida: parseInt(unidadMedida),
      estado: estadoProducto === '1',
      vencimiento: vencimiento ? new Date(vencimiento) : null,
      promocionActiva: promocionActiva,
      precioPromocion: precioPromocionFinal,
    };

    if (initialProduct) {
      await handleEditarProducto(productoData, imageFile, categoriasSeleccionadas);
    } else {
      await handleNuevoProducto(productoData, imageFile, categoriasSeleccionadas);
    }

    // Reset form
    setNombre('');
    setDescripcion('');
    setStock('');
    setCosto('');
    setPrecioventa('');
    setUnidadMedida('');
    setVencimiento('');
    setImageFile(null);
    setImagePreview(null);
    setImageToCrop(null);
    setShowCropper(false);
    setPromocionActiva(false);
    setPrecioPromocion('');
    setCategoriasSeleccionadas([]);
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
              <label>Precio Promocional {textoGramos}</label>
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
            <label>Fecha de Vencimiento</label>
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              placeholder="Opcional"
            />
          </div>
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
          <div className="form-group">
            <label>Imagen del Producto</label>
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
            {!imagePreview && initialProduct?.imagen_path && (
              <div style={{ marginTop: '0.5rem' }}>
                <img 
                  src={getProductImageUrl(initialProduct.imagen_path) || undefined} 
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
});
