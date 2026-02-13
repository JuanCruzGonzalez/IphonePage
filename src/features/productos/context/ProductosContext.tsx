import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Producto } from '../../../core/types';
import {
  getProductosPage,
  getProductosActivos,
  createProducto,
  updateProducto,
  updateProductoEstado,
  updateStockProducto,
} from '../services/productoService';
import { uploadProductImage, updateProductImage } from '../../../shared/services/storageService';
import { asignarCategoriasAProducto, getCategoriasDeProducto } from '../../categorias/services/categoriaService';
import { useAsync } from '../../../shared/hooks/useAsync';
import { useModal } from '../../../shared/hooks/useModal';

/** ======================
 * TIPOS E INTERFACES
 * ====================== */

interface ProductoFormData {
  nombre: string;
  descripcion: string;
  stock: number;
  costo: number;
  precioventa: number;
  unidadMedida: number;
  estado: boolean;
  vencimiento?: Date | null;
  promocionActiva?: boolean;
  precioPromocion?: number | null;
}

interface ProductosContextValue {
  // Estado
  productos: Producto[];
  productosActivos: Producto[];
  productosPageNum: number;
  productosTotal: number;
  productosSearchQuery: string;
  PAGE_SIZE: number;
  productToEdit: Producto | null;
  categoriasDeProducto: number[];

  // Modales
  modalNuevoProducto: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };
  modalActualizarStock: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };

  // Operaciones de carga
  loadProductosPage: (page?: number, q?: string) => Promise<void>;
  recargarProductosActuales: () => Promise<void>;

  // Operaciones CRUD
  handleNuevoProducto: (
    producto: ProductoFormData,
    imageFile?: File | null,
    categoriasIds?: number[]
  ) => Promise<void>;
  handleBuscarProductos: (texto: string) => Promise<void>;
  handleEditarProducto: (
    producto: ProductoFormData,
    imageFile?: File | null,
    categoriasIds?: number[]
  ) => Promise<void>;
  openEditarProducto: (producto: Producto) => Promise<void>;
  handleToggleProductoEstado: (
    id_producto: number,
    currentEstado: boolean,
    nombre?: string
  ) => Promise<void>;
  handleActualizarStock: (productoId: number, cantidad: number) => Promise<void>;

  // Estados de loading (useAsync)
  crearProductoAsync: ReturnType<typeof useAsync<Producto>>;
  editarProductoAsync: ReturnType<typeof useAsync<Producto | null>>;
  actualizarStockAsync: ReturnType<typeof useAsync<Producto>>;
  buscarProductosAsync: ReturnType<typeof useAsync<Producto[]>>;

  // Setters internos (si otros componentes necesitan actualizar estado)
  setProductToEdit: (producto: Producto | null) => void;
  setCategoriasDeProducto: (categorias: number[]) => void;
}

const ProductosContext = createContext<ProductosContextValue | undefined>(undefined);

/** ======================
 * PROVIDER
 * ====================== */

interface ProductosProviderProps {
  children: ReactNode;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  showWarning: (msg: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: 'danger' | 'warning' | 'info'
  ) => void;
}

export const ProductosProvider: React.FC<ProductosProviderProps> = ({
  children,
  showSuccess,
  showError,
  showWarning,
  showConfirm,
}) => {
  // ============= ESTADO =============
  const PAGE_SIZE = 8;
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosActivos, setProductosActivos] = useState<Producto[]>([]);
  const [productosPageNum, setProductosPageNum] = useState(1);
  const [productosTotal, setProductosTotal] = useState(0);
  const [productosSearchQuery, setProductosSearchQuery] = useState('');
  const [productToEdit, setProductToEdit] = useState<Producto | null>(null);
  const [categoriasDeProducto, setCategoriasDeProducto] = useState<number[]>([]);

  // Modales
  const modalNuevoProducto = useModal(false);
  const modalActualizarStock = useModal(false);

  // useAsync hooks
  const crearProductoAsync = useAsync<Producto>();
  const editarProductoAsync = useAsync<Producto | null>();
  const actualizarStockAsync = useAsync<Producto>();
  const buscarProductosAsync = useAsync<Producto[]>();

  // ============= INICIALIZACIÓN =============
  
  /**
   * Carga la primera página de productos al montar el componente
   */
  useEffect(() => {
    const initProductos = async () => {
      try {
        const [productosPageResult, productosActivosData] = await Promise.all([
          getProductosPage(1, PAGE_SIZE, ''),
          getProductosActivos(),
        ]);
        
        setProductos(productosPageResult.productos || []);
        setProductosTotal(productosPageResult.total || 0);
        setProductosPageNum(1);
        setProductosSearchQuery('');
        setProductosActivos(productosActivosData || []);
      } catch (err) {
        showError('Error cargando productos iniciales');
      }
    };

    initProductos();
  }, [PAGE_SIZE, showError]);

  // ============= OPERACIONES DE CARGA =============

  /**
   * Carga una página específica de productos con búsqueda opcional
   */
  const loadProductosPage = useCallback(
    async (page = 1, q = '') => {
      try {
        const { productos: pageRows, total } = await getProductosPage(page, PAGE_SIZE, q);
        setProductos(pageRows || []);
        setProductosTotal(total || 0);
        setProductosPageNum(page);
        setProductosSearchQuery(q);
      } catch (err) {
        showError('Error cargando productos');
      }
    },
    [PAGE_SIZE, showError]
  );

  /**
   * Recarga la página actual de productos manteniendo paginación y búsqueda
   */
  const recargarProductosActuales = useCallback(async () => {
    try {
      // Recargar la página actual con la búsqueda actual
      await loadProductosPage(productosPageNum, productosSearchQuery);
      // También recargar productosActivos que se usa en otros componentes
      const productosActivosData = await getProductosActivos();
      setProductosActivos(productosActivosData);
    } catch (err) {
      showError('Error recargando productos');
    }
  }, [productosPageNum, productosSearchQuery, loadProductosPage, showError]);

  // ============= OPERACIONES CRUD =============

  /**
   * Crea un nuevo producto con imagen y categorías opcionales
   */
  const handleNuevoProducto = useCallback(
    async (
      producto: ProductoFormData,
      imageFile?: File | null,
      categoriasIds?: number[]
    ) => {
      try {
        const createdProduct = await crearProductoAsync.execute(() =>
          createProducto({
            nombre: producto.nombre,
            descripcion: producto.descripcion || null,
            stock: producto.stock,
            costo: producto.costo,
            precioventa: producto.precioventa,
            precio_promocion: producto.precioPromocion || null,
            promocion_activa: producto.promocionActiva || false,
            id_unidad_medida: producto.unidadMedida,
            estado: producto.estado,
            vencimiento: producto.vencimiento || undefined,
          })
        );

        // Si hay una imagen, subirla y actualizar el producto
        if (imageFile && createdProduct) {
          try {
            const imagePath = await uploadProductImage(imageFile, createdProduct.id_producto);
            await updateProducto(createdProduct.id_producto, { imagen_path: imagePath });
          } catch (imgErr) {
            showWarning('Producto creado pero no se pudo subir la imagen');
          }
        }

        // Asignar categorías si hay
        if (createdProduct && categoriasIds && categoriasIds.length > 0) {
          try {
            await asignarCategoriasAProducto(createdProduct.id_producto, categoriasIds);
          } catch (catErr) {
            showWarning('Producto creado pero no se pudieron asignar las categorías');
          }
        }

        await recargarProductosActuales();
        modalNuevoProducto.close();
        setCategoriasDeProducto([]);
        showSuccess('Producto agregado exitosamente');
      } catch (err) {
        showError('Error al agregar el producto');
      }
    },
    [
      crearProductoAsync,
      recargarProductosActuales,
      modalNuevoProducto,
      showSuccess,
      showError,
      showWarning,
    ]
  );

  /**
   * Busca productos por texto
   */
  const handleBuscarProductos = useCallback(
    async (texto: string) => {
      try {
        // Use paginated API for searches as well (reset to page 1)
        const { productos: pageRows, total } = await getProductosPage(1, PAGE_SIZE, texto);
        setProductos(pageRows || []);
        setProductosTotal(total || 0);
        setProductosPageNum(1);
        setProductosSearchQuery(texto);
      } catch (err) {
        const e: any = err;
        const message =
          e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
        showError(message || 'Error buscando productos');
      }
    },
    [PAGE_SIZE, showError]
  );

  /**
   * Edita un producto existente
   */
  const handleEditarProducto = useCallback(
    async (
      producto: ProductoFormData,
      imageFile?: File | null,
      categoriasIds?: number[]
    ) => {
      if (!productToEdit) return;
      try {
        // Si hay una nueva imagen, subirla (esto reemplazará la anterior automáticamente)
        let imagenPath = productToEdit.imagen_path;
        if (imageFile) {
          try {
            imagenPath = await updateProductImage(
              imageFile,
              productToEdit.id_producto,
              productToEdit.imagen_path || undefined
            );
          } catch (imgErr) {
            showWarning('Se actualizará el producto sin cambiar la imagen');
          }
        }

        const updated = await editarProductoAsync.execute(() =>
          updateProducto(productToEdit.id_producto, {
            nombre: producto.nombre,
            descripcion: producto.descripcion || null,
            stock: producto.stock,
            costo: producto.costo,
            precioventa: producto.precioventa,
            precio_promocion: producto.precioPromocion || null,
            promocion_activa: producto.promocionActiva || false,
            id_unidad_medida: producto.unidadMedida,
            estado: producto.estado,
            vencimiento: producto.vencimiento || undefined,
            imagen_path: imagenPath,
          })
        );
        if (!updated) {
          showError('No se pudo actualizar el producto');
          return;
        }

        // Actualizar categorías
        if (categoriasIds !== undefined) {
          try {
            await asignarCategoriasAProducto(productToEdit.id_producto, categoriasIds);
          } catch (catErr) {
            showWarning('Producto actualizado pero no se pudieron actualizar las categorías');
          }
        }

        await recargarProductosActuales();
        modalNuevoProducto.close();
        setProductToEdit(null);
        setCategoriasDeProducto([]);
        showSuccess('Producto actualizado exitosamente');
      } catch (err) {
        showError('Error al actualizar el producto');
      }
    },
    [
      productToEdit,
      editarProductoAsync,
      recargarProductosActuales,
      modalNuevoProducto,
      showSuccess,
      showError,
      showWarning,
    ]
  );

  /**
   * Abre el modal de edición con los datos del producto
   */
  const openEditarProducto = useCallback(
    async (producto: Producto) => {
      setProductToEdit(producto);
      // Cargar categorías del producto
      try {
        const categoriasData = await getCategoriasDeProducto(producto.id_producto);
        setCategoriasDeProducto(categoriasData.map((c: any) => c.id_categoria));
      } catch (err) {
        setCategoriasDeProducto([]);
      }
      modalNuevoProducto.open();
    },
    [modalNuevoProducto]
  );

  /**
   * Activa/desactiva un producto con confirmación
   */
  const handleToggleProductoEstado = useCallback(
    async (id_producto: number, currentEstado: boolean, nombre?: string) => {
      showConfirm(
        currentEstado ? 'Dar de baja producto' : 'Dar de alta producto',
        `¿Seguro que quieres ${currentEstado ? 'dar de baja' : 'dar de alta'} el producto ${
          nombre ?? '#' + id_producto
        }?`,
        async () => {
          try {
            const updated = await updateProductoEstado(id_producto, !currentEstado);
            if (!updated) {
              showError(`No se encontró el producto #${id_producto}`);
              return;
            }
            await recargarProductosActuales();
            showSuccess(`Producto ${updated.nombre} actualizado correctamente`);
          } catch (err) {
            const e: any = err;
            const message =
              e?.message || e?.error || (typeof e === 'string' ? e : JSON.stringify(e));
            showError(message || 'No se pudo actualizar el estado del producto');
          }
        },
        'warning'
      );
    },
    [showConfirm, showError, showSuccess, recargarProductosActuales]
  );

  /**
   * Actualiza el stock de un producto
   */
  const handleActualizarStock = useCallback(
    async (productoId: number, cantidad: number) => {
      try {
        const producto = productos.find((p) => p.id_producto === productoId);
        if (!producto) return;

        const nuevoStock = producto.stock + cantidad;

        await actualizarStockAsync.execute(() => updateStockProducto(productoId, nuevoStock));
        modalActualizarStock.close(); // Cerrar modal ANTES de recargar
        await recargarProductosActuales(); // Recargar datos

        showSuccess(
          `Stock actualizado: ${producto.nombre} ahora tiene ${nuevoStock} unidades`
        );
      } catch (err) {
        showError('Error al actualizar el stock');
      }
    },
    [
      productos,
      actualizarStockAsync,
      modalActualizarStock,
      recargarProductosActuales,
      showSuccess,
      showError,
    ]
  );

  // ============= VALOR DEL CONTEXTO =============

  const value: ProductosContextValue = {
    // Estado
    productos,
    productosActivos,
    productosPageNum,
    productosTotal,
    productosSearchQuery,
    PAGE_SIZE,
    productToEdit,
    categoriasDeProducto,

    // Modales
    modalNuevoProducto,
    modalActualizarStock,

    // Operaciones de carga
    loadProductosPage,
    recargarProductosActuales,

    // Operaciones CRUD
    handleNuevoProducto,
    handleBuscarProductos,
    handleEditarProducto,
    openEditarProducto,
    handleToggleProductoEstado,
    handleActualizarStock,

    // Estados de loading
    crearProductoAsync,
    editarProductoAsync,
    actualizarStockAsync,
    buscarProductosAsync,

    // Setters
    setProductToEdit,
    setCategoriasDeProducto,
  };

  return <ProductosContext.Provider value={value}>{children}</ProductosContext.Provider>;
};

/** ======================
 * HOOK
 * ====================== */

/**
 * Hook para acceder al contexto de productos
 * @example
 * const { productos, loadProductosPage, handleNuevoProducto } = useProductos();
 */
export const useProductos = (): ProductosContextValue => {
  const context = useContext(ProductosContext);
  if (!context) {
    throw new Error('useProductos debe usarse dentro de ProductosProvider');
  }
  return context;
};
