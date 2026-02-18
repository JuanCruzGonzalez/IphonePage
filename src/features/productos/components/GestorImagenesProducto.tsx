import React, { useState, useEffect } from 'react';
import { ProductoImagen } from '../../../core/types';
import { uploadProductImage, getProductImageUrl } from '../../../shared/services/storageService';

interface GestorImagenesProductoProps {
  productId?: number;
  imagenesIniciales?: ProductoImagen[];
  onImagenesChange?: (imagenes: ProductoImagen[]) => void;
}

export const GestorImagenesProducto: React.FC<GestorImagenesProductoProps> = ({
  productId,
  imagenesIniciales = [],
  onImagenesChange,
}) => {
  const [imagenes, setImagenes] = useState<ProductoImagen[]>(imagenesIniciales);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setImagenes(imagenesIniciales);
    // Cargar previews de imágenes existentes
    const urls = imagenesIniciales.map(img => getProductImageUrl(img.imagen_path) || '');
    setPreviews(urls);
  }, [imagenesIniciales]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const nuevasImagenes: ProductoImagen[] = [];
      const nuevasPreviews: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Crear preview
        const reader = new FileReader();
        const previewPromise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const preview = await previewPromise;
        
        if (productId) {
          // Si hay productId, subir la imagen ahora
          const path = await uploadProductImage(file, productId);
          nuevasImagenes.push({
            id_producto_imagen: Date.now() + i, // Temporal
            id_producto: productId,
            imagen_path: path,
            orden: imagenes.length + i,
            es_principal: imagenes.length === 0 && i === 0,
          });
          nuevasPreviews.push(preview);
        } else {
          // Si no hay productId, solo guardar el preview
          // La imagen se subirá cuando se cree el producto
          nuevasImagenes.push({
            id_producto_imagen: Date.now() + i, // Temporal
            id_producto: 0, // Temporal
            imagen_path: preview, // Guardar preview temporalmente
            orden: imagenes.length + i,
            es_principal: imagenes.length === 0 && i === 0,
          });
          nuevasPreviews.push(preview);
        }
      }

      const imagenesActualizadas = [...imagenes, ...nuevasImagenes];
      const previewsActualizados = [...previews, ...nuevasPreviews];
      
      setImagenes(imagenesActualizadas);
      setPreviews(previewsActualizados);
      
      if (onImagenesChange) {
        onImagenesChange(imagenesActualizadas);
      }
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      alert('Error al cargar las imágenes');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleEliminar = (index: number) => {
    const nuevasImagenes = imagenes.filter((_, i) => i !== index);
    const nuevosPreviews = previews.filter((_, i) => i !== index);
    
    // Si eliminamos la imagen principal, marcar la primera como principal
    if (imagenes[index].es_principal && nuevasImagenes.length > 0) {
      nuevasImagenes[0].es_principal = true;
    }
    
    setImagenes(nuevasImagenes);
    setPreviews(nuevosPreviews);
    
    if (onImagenesChange) {
      onImagenesChange(nuevasImagenes);
    }
  };

  const handleMarcarPrincipal = (index: number) => {
    const nuevasImagenes = imagenes.map((img, i) => ({
      ...img,
      es_principal: i === index,
    }));
    
    setImagenes(nuevasImagenes);
    
    if (onImagenesChange) {
      onImagenesChange(nuevasImagenes);
    }
  };

  const handleMoverImagen = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imagenes.length) return;
    
    const nuevasImagenes = [...imagenes];
    const nuevasPreviews = [...previews];
    
    const [imagenMovida] = nuevasImagenes.splice(fromIndex, 1);
    const [previewMovido] = nuevasPreviews.splice(fromIndex, 1);
    
    nuevasImagenes.splice(toIndex, 0, imagenMovida);
    nuevasPreviews.splice(toIndex, 0, previewMovido);
    
    // Actualizar orden
    nuevasImagenes.forEach((img, i) => {
      img.orden = i;
    });
    
    setImagenes(nuevasImagenes);
    setPreviews(nuevasPreviews);
    
    if (onImagenesChange) {
      onImagenesChange(nuevasImagenes);
    }
  };

  return (
    <div className="form-group">
      <label>Imágenes del Producto</label>
      
      <div style={{ marginTop: '8px' }}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ marginBottom: '12px' }}
        />
        {uploading && <p>Cargando imágenes...</p>}
      </div>

      {imagenes.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
          marginTop: '12px',
        }}>
          {imagenes.map((imagen, index) => (
            <div
              key={imagen.id_producto_imagen}
              style={{
                position: 'relative',
                border: imagen.es_principal ? '2px solid #4CAF50' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px',
                backgroundColor: '#fff',
              }}
            >
              <img
                src={previews[index] || getProductImageUrl(imagen.imagen_path) || ''}
                alt={`Imagen ${index + 1}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
              
              <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {!imagen.es_principal && (
                  <button
                    type="button"
                    onClick={() => handleMarcarPrincipal(index)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#333',
                    }}
                  >
                    Principal
                  </button>
                )}
                {imagen.es_principal && (
                  <span style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#4CAF50',
                    color: '#333',
                    borderRadius: '4px',
                  }}>
                    Principal
                  </span>
                )}
                
                <button
                  type="button"
                  onClick={() => handleMoverImagen(index, index - 1)}
                  disabled={index === 0}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    color: '#333',
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ←
                </button>
                
                <button
                  type="button"
                  onClick={() => handleMoverImagen(index, index + 1)}
                  disabled={index === imagenes.length - 1}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    color: '#333',
                    borderRadius: '4px',
                    cursor: index === imagenes.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  →
                </button>
                
                <button
                  type="button"
                  onClick={() => handleEliminar(index)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ marginTop: '4px', fontSize: '10px', color: '#666' }}>
                Orden: {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {imagenes.length === 0 && (
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          No hay imágenes cargadas
        </p>
      )}
    </div>
  );
};
