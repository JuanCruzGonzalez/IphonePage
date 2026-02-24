/**
 * CarritoContext - Manejo centralizado del estado del carrito de compras
 * 
 * Este contexto proporciona:
 * - Estado del carrito (items, totales)
 * - Funciones para agregar/eliminar/actualizar items
 * - Lógica para productos por peso (gramos)
 * - Integración con WhatsApp para pedidos
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Producto, Promocion, CrearPedidoInput } from '../../../core/types';
import { calculateCartTotal } from '../../../shared/utils/calculations';
import { formatPrice } from '../../../shared/utils';
import { createPedido } from '../../pedidos/services/pedidoService';
import { queryKeys } from '../../../lib/queryClient';

/**
 * Interfaz para items del carrito
 */
export interface ItemCarrito {
  id: string; // Formato: "producto-{id}" o "promocion-{id}"
  tipo: 'producto' | 'promocion';
  id_referencia: number; // id_producto o id_promocion
  nombre: string;
  descripcion?: string | null; // Descripción del producto/promoción
  precio: number;
  cantidad: number;
}

/**
 * Estado del modal para productos por peso
 */
interface ModalCantidad {
  isOpen: boolean;
  producto: Producto | null;
}

/**
 * Interfaz del contexto
 */
interface CarritoContextType {
  // Estado
  carrito: ItemCarrito[];
  mostrarCarrito: boolean;
  modalCantidad: ModalCantidad;
  cantidadGramos: string;
  modalDatosCliente: boolean;

  // Setters para el modal de cantidad
  setCantidadGramos: (cantidad: string) => void;
  
  // Acciones del carrito
  agregarAlCarrito: (producto: Producto, cantidad: number) => void;
  agregarPromocionAlCarrito: (promocion: Promocion, cantidad?: number) => void;
  eliminarDelCarrito: (id: string) => void;
  actualizarCantidad: (id: string, nuevaCantidad: number) => void;
  vaciarCarrito: () => void;
  
  // UI
  toggleMostrarCarrito: () => void;
  cerrarCarrito: () => void;
  
  // Modal de cantidad (para productos por peso)
  abrirModalCantidad: (producto: Producto) => void;
  cerrarModalCantidad: () => void;
  confirmarCantidadGramos: () => void;
  manejarAgregarProducto: (producto: Producto) => void;
  
  // Utilidades
  obtenerItemEnCarrito: (id_producto: number) => ItemCarrito | undefined;
  calcularTotal: number; // Ahora es un valor calculado con useMemo
  enviarPedidoWhatsApp: () => void;
  abrirModalDatosCliente: () => void;
  cerrarModalDatosCliente: () => void;
  confirmarPedidoCliente: (datos: {
    nombre: string;
    telefono: string;
    direccion: string;
    metodoPago: 'efectivo' | 'transferencia' | 'mercadopago';
    notas: string;
  }) => Promise<void>;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

/**
 * Provider del CarritoContext
 */
export const CarritoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [modalCantidad, setModalCantidad] = useState<ModalCantidad>({
    isOpen: false,
    producto: null,
  });
  const [cantidadGramos, setCantidadGramos] = useState('');
  const [modalDatosCliente, setModalDatosCliente] = useState(false);

  /**
   * Agrega un producto al carrito
   * Si el producto ya existe, incrementa su cantidad
   */
  const agregarAlCarrito = useCallback((producto: Producto, cantidad: number) => {
    setCarrito(prevCarrito => {
      const id = `producto-${producto.id_producto}`;
      const itemExistente = prevCarrito.find(item => item.id === id);

      // Determinar precio correcto (usar precio de promoción si está activa)
      const precio = producto.promocion_activa && producto.precio_promocion
        ? producto.precio_promocion
        : producto.precioventa;

      if (itemExistente) {
        return prevCarrito.map(item =>
          item.id === id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        return [...prevCarrito, {
          id,
          tipo: 'producto' as const,
          id_referencia: producto.id_producto,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio,
          cantidad,
        }];
      }
    });
  }, []);

  /**
   * Agrega una promoción al carrito
   */
  const agregarPromocionAlCarrito = useCallback((promocion: Promocion, cantidad: number = 1) => {
    setCarrito(prevCarrito => {
      const id = `promocion-${promocion.id_promocion}`;
      const itemExistente = prevCarrito.find(item => item.id === id);
      const precio = promocion.precio || 0;

      if (itemExistente) {
        return prevCarrito.map(item =>
          item.id === id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        return [...prevCarrito, {
          id,
          tipo: 'promocion' as const,
          id_referencia: promocion.id_promocion,
          nombre: promocion.name,
          precio,
          cantidad,
        }];
      }
    });
  }, []);

  /**
   * Elimina un item del carrito
   */
  const eliminarDelCarrito = useCallback((id: string) => {
    setCarrito(prevCarrito => prevCarrito.filter(item => item.id !== id));
  }, []);

  /**
   * Actualiza la cantidad de un item
   * Si la cantidad es <= 0, elimina el item
   */
  const actualizarCantidad = useCallback((id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setCarrito(prevCarrito => prevCarrito.filter(item => item.id !== id));
      return;
    }

    setCarrito(prevCarrito => prevCarrito.map(item =>
      item.id === id
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  }, []);

  /**
   * Vacía todo el carrito
   */
  const vaciarCarrito = useCallback(() => {
    setCarrito([]);
  }, []);

  /**
   * Toggle para mostrar/ocultar panel del carrito
   */
  const toggleMostrarCarrito = useCallback(() => {
    setMostrarCarrito(prev => !prev);
  }, []);

  /**
   * Cierra el panel del carrito
   */
  const cerrarCarrito = useCallback(() => {
    setMostrarCarrito(false);
  }, []);

  /**
   * Abre el modal para ingresar cantidad de gramos
   */
  const abrirModalCantidad = useCallback((producto: Producto) => {
    setModalCantidad({ isOpen: true, producto });
    setCantidadGramos('');
  }, []);

  /**
   * Cierra el modal de cantidad
   */
  const cerrarModalCantidad = useCallback(() => {
    setModalCantidad({ isOpen: false, producto: null });
    setCantidadGramos('');
  }, []);

  /**
   * Confirma la cantidad de gramos ingresada y agrega al carrito
   */
  const confirmarCantidadGramos = useCallback(() => {
    if (!modalCantidad.producto) return;

    const gramos = parseFloat(cantidadGramos);
    if (isNaN(gramos) || gramos <= 0) {
      alert('Ingrese una cantidad válida');
      return;
    }

    agregarAlCarrito(modalCantidad.producto, gramos);
    setModalCantidad({ isOpen: false, producto: null });
    setCantidadGramos('');
  }, [modalCantidad.producto, cantidadGramos, agregarAlCarrito]);

  /**
   * Maneja el click en "Agregar" de un producto
   */
  const manejarAgregarProducto = useCallback((producto: Producto) => {
    agregarAlCarrito(producto, 1);
  }, [agregarAlCarrito]);

  /**
   * Obtiene un item del carrito por su id_producto
   */
  const obtenerItemEnCarrito = useCallback((id_producto: number): ItemCarrito | undefined => {
    return carrito.find(item => item.id === `producto-${id_producto}`);
  }, [carrito]);

  /**
   * Calcula el total del carrito (usando useMemo para evitar cálculos innecesarios)
   */
  const calcularTotal = useMemo(() => calculateCartTotal(carrito), [carrito]);

  /**
   * Genera mensaje y abre WhatsApp con el pedido
   */
  const enviarPedidoWhatsApp = useCallback(() => {
    // Abrir modal para capturar datos del cliente
    setModalDatosCliente(true);
  }, []);

  const abrirModalDatosCliente = useCallback(() => {
    setModalDatosCliente(true);
  }, []);

  const cerrarModalDatosCliente = useCallback(() => {
    setModalDatosCliente(false);
  }, []);

  const confirmarPedidoCliente = useCallback(async (datos: {
    nombre: string;
    telefono: string;
    direccion: string;
    metodoPago: 'efectivo' | 'transferencia' | 'mercadopago';
    notas: string;
  }) => {
    try {
      // Preparar datos del pedido
      const pedidoInput: CrearPedidoInput = {
        cliente_nombre: datos.nombre,
        cliente_telefono: datos.telefono,
        cliente_direccion: datos.direccion,
        metodo_pago: datos.metodoPago,
        notas: datos.notas || null,
        items: carrito.map(item => ({
          tipo: item.tipo,
          id: item.id_referencia,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
        })),
      };

      // Crear pedido en la base de datos
      await createPedido(pedidoInput);

      // Invalidar queries de pedidos para actualizar contadores y tabla
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidos });
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidosPendientes });
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidosMetricas });

      // Generar mensaje de WhatsApp
      const numeroWhatsApp = '5492615355139';
      let mensaje = `Hola Chañar soy ${datos.nombre}, quería hacer el siguiente pedido:\n\n`;

      carrito.forEach(item => {
        const cantidad = item.tipo === 'promocion' ? `${item.cantidad} un` : `${item.cantidad} un`;
        const tipo = item.tipo === 'promocion' ? '🎁 ' : '';
        mensaje += `${tipo}• ${item.nombre}: ${cantidad} - ${formatPrice(item.precio * item.cantidad)}\n`;
        if (item.descripcion) {
          mensaje += `  ${item.descripcion}\n`;
        }
      });

      mensaje += `\n*Total: ${formatPrice(calcularTotal)}*`;
      mensaje += `\n\nDatos de entrega:\n`;
      mensaje += `${datos.telefono}\n`;
      mensaje += `${datos.direccion}\n`;
      mensaje += `Pago: ${datos.metodoPago}`;
      
      if (datos.notas) {
        mensaje += `\n ${datos.notas}`;
      }

      const mensajeCodificado = encodeURIComponent(mensaje);
      const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;

      // Crear un enlace temporal y hacer clic en él
      const link = document.createElement('a');
      link.href = urlWhatsApp;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cerrar modal y vaciar carrito
      setModalDatosCliente(false);
      vaciarCarrito();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      alert('Error al crear el pedido. Por favor, intenta nuevamente.');
    }
  }, [carrito, calcularTotal]);

  const value: CarritoContextType = {
    // Estado
    carrito,
    mostrarCarrito,
    modalCantidad,
    cantidadGramos,
    modalDatosCliente,

    // Setters
    setCantidadGramos,

    // Acciones
    agregarAlCarrito,
    agregarPromocionAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,

    // UI
    toggleMostrarCarrito,
    cerrarCarrito,

    // Modal
    abrirModalCantidad,
    cerrarModalCantidad,
    confirmarCantidadGramos,
    manejarAgregarProducto,

    // Utilidades
    obtenerItemEnCarrito,
    calcularTotal,
    enviarPedidoWhatsApp,
    abrirModalDatosCliente,
    cerrarModalDatosCliente,
    confirmarPedidoCliente,
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

/**
 * Hook personalizado para usar el CarritoContext
 * @throws Error si se usa fuera del CarritoProvider
 */
export const useCarrito = (): CarritoContextType => {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
};
