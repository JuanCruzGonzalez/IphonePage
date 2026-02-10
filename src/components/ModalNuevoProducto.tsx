import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { UnidadMedida } from '../types';
import { getProductImageUrl } from '../api/storageService';

interface ModalNuevoProductoProps {
  isOpen: boolean;
  onClose: () => void;
  unidadesMedida: UnidadMedida[];
  onSubmit: (producto: { nombre: string; descripcion: string; stock: number; costo: number; precioventa: number; unidadMedida: number; estado: boolean; vencimiento?: Date | null}, imageFile?: File | null) => void;
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
    imagen_path?: string | null;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);

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
    }
  }, [initialProduct, isOpen]);

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
      console.error('Error al recortar la imagen:', error);
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
    }, imageFile);

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

      {/* Modal de recorte de imagen */}
      {showCropper && imageToCrop && (
        <div className="modal-overlay" style={{ zIndex: 1001 }} onClick={handleCropCancel}>
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
