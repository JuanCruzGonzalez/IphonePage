import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Producto, Promocion } from '../../../core/types';
import { updateProducto } from '../../productos/services/productoService';
import { useVentas } from '../context/VentasContext';
import { PlanDePagoForm, PlanDePagoFormConfig } from './PlanDePagoForm';
import ProductosDropDown from '../../stock/componentes/ProductosDropDown';
import { PromoRow } from './PromoRow';
import { ProductRow } from './ProductRow';
import Modal from '../../../shared/components/Modal';

interface ModalNuevaVentaProps {
    productos: Producto[];
    promociones?: Promocion[];
    showError?: (message: string) => void;
    showWarning?: (message: string) => void;
}

export const ModalNuevaVenta = React.memo<ModalNuevaVentaProps>(({
    productos,
    promociones = [],
    showError,
    showWarning,
}) => {
    const { modalNuevaVenta, handleNuevaVenta, crearVentaAsync } = useVentas();
    const [items, setItems] = useState<{ id_producto: number; cantidad: number; nombre: string; precioventa: number; dolares?: boolean }[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [showProductosDropdown, setShowProductosDropdown] = useState(false);
    const [cantidad, setCantidad] = useState('');
    const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mercadopago' | 'plan_de_pago'>('efectivo');
    const [planConfig, setPlanConfig] = useState<PlanDePagoFormConfig | null>(null);
    const [promoSeleccionada, setPromoSeleccionada] = useState('');
    const [busquedaPromo, setBusquedaPromo] = useState('');
    const [showPromosDropdown, setShowPromosDropdown] = useState(false);
    const [promoCantidad, setPromoCantidad] = useState('1');
    const [promosAdded, setPromosAdded] = useState<{ id_promocion: number; name: string; precio: number | null; cantidad: number }[]>([]);

    const productSearchRef = useRef<HTMLDivElement>(null);
    const promoSearchRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdowns cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (productSearchRef.current && !productSearchRef.current.contains(event.target as Node)) {
                setShowProductosDropdown(false);
            }
            if (promoSearchRef.current && !promoSearchRef.current.contains(event.target as Node)) {
                setShowPromosDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mover useMemo ANTES del early return para cumplir las reglas de hooks
    const calcularTotales = useMemo(() => {
        let totalPesos = 0;
        let totalDolares = 0;

        // Sumar productos
        items.forEach(item => {
            const subtotal = item.cantidad * item.precioventa;
            if (item.dolares) {
                totalDolares += subtotal;
            } else {
                totalPesos += subtotal;
            }
        });

        // Sumar promociones (asumimos que siempre son en pesos)
        promosAdded.forEach(p => {
            totalPesos += p.cantidad * (p.precio ?? 0);
        });

        return {
            totalPesos,
            totalDolares,
            tienePesos: totalPesos > 0,
            tieneDolares: totalDolares > 0
        };
    }, [items, promosAdded]);

    if (!modalNuevaVenta.isOpen) return null;

    // Filtrar productos basado en la búsqueda
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
    ).slice(0, 10); // Limitar a 10 resultados

    // Filtrar promociones basado en la búsqueda
    const promocionesFiltradas = promociones.filter(p =>
        p.name.toLowerCase().includes(busquedaPromo.toLowerCase())
    ).slice(0, 10);

    const seleccionarProducto = (producto: Producto) => {
        setProductoSeleccionado(String(producto.id_producto));
        setBusquedaProducto(producto.nombre);
        setShowProductosDropdown(false);
    };

    const seleccionarPromocion = (promo: Promocion) => {
        setPromoSeleccionada(String(promo.id_promocion));
        setBusquedaPromo(promo.name);
        setShowPromosDropdown(false);
    };

    const agregarItem = () => {
        const productoId = parseInt(productoSeleccionado);
        const cant = parseInt(cantidad);

        if (!productoId || !cant || cant <= 0) {
            showWarning?.('Seleccione un producto y cantidad válida');
            return;
        }

        const producto = productos.find(p => p.id_producto === productoId);
        if (!producto) return;

        if (producto.stock < cant) {
            showError?.(`Stock insuficiente. Disponible: ${producto.stock}`);
            return;
        }

        if (items.find(i => i.id_producto === productoId)) {
            showWarning?.('Este producto ya está agregado');
            return;
        }

        setItems([...items, {
            id_producto: productoId,
            cantidad: cant,
            nombre: producto.nombre,
            precioventa: producto.precioventa,
            dolares: producto.dolares,
        }]);
        setProductoSeleccionado('');
        setBusquedaProducto('');
        setCantidad('');
    };

    const handleSubmit = () => {
        if (items.length === 0 && promosAdded.length === 0) {
            showWarning?.('Agregue al menos un producto o promoción');
            return;
        }

        if (metodoPago === 'plan_de_pago') {
            if (!planConfig?.cliente_nombre?.trim() || !planConfig?.cliente_telefono?.trim()) {
                showWarning?.('Complete nombre y teléfono del cliente para el plan de pago');
                return;
            }
            if ((planConfig?.numero_cuotas ?? 0) < 2) {
                showWarning?.('El plan debe tener al menos 2 cuotas');
                return;
            }
            if (calcularTotales.totalPesos <= 0) {
                showWarning?.('El plan de pago solo aplica a productos en pesos (ARS)');
                return;
            }
        }

        const productosDetalles = items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad, precioUnitario: i.precioventa }));
        const promocionesDetalles = promosAdded.map(p => ({ id_promocion: p.id_promocion, cantidad: p.cantidad, precioUnitario: p.precio ?? undefined }));

        const pagada = metodoPago !== 'plan_de_pago';
        const planFinal = metodoPago === 'plan_de_pago' && planConfig
            ? { ...planConfig, monto_total: calcularTotales.totalPesos }
            : undefined;

        handleNuevaVenta([...productosDetalles, ...promocionesDetalles], pagada, planFinal);
        // Reset
        setItems([]);
        setProductoSeleccionado('');
        setBusquedaProducto('');
        setCantidad('');
        setPromosAdded([]);
        setPromoSeleccionada('');
        setBusquedaPromo('');
        setMetodoPago('efectivo');
        setPlanConfig(null);
    };

    const agregarPromocion = () => {
        const id = parseInt(promoSeleccionada);
        const cant = parseInt(promoCantidad) || 1;
        if (!id || cant <= 0) {
            showWarning?.('Seleccione una promoción y cantidad válida');
            return;
        }
        const promo = promociones?.find(p => p.id_promocion === id);
        if (!promo) return;
        if (promosAdded.find(p => p.id_promocion === id)) {
            showWarning?.('Esta promoción ya está agregada');
            return;
        }
        setPromosAdded(prev => [...prev, { id_promocion: promo.id_promocion, name: promo.name, precio: promo.precio, cantidad: cant }]);
        setPromoSeleccionada('');
        setBusquedaPromo('');
        setPromoCantidad('1');
    };

    const removerPromocion = (id_promocion: number) => {
        setPromosAdded(prev => prev.filter(p => p.id_promocion !== id_promocion));
    };

    const updateProductPrice = async (id_producto: number, newPrice: number) => {
        setItems(prev => prev.map(it => it.id_producto === id_producto ? { ...it, precioventa: newPrice } : it));

        try {
            await updateProducto(id_producto, { precioventa: newPrice });
            // Precio actualizado silenciosamente en la base de datos
        } catch (error) {
            showError?.('Error al actualizar el precio en la base de datos');
            console.error('Error updating price:', error);
        }
    };

    const updateProductCantidad = (id_producto: number, cantidad: number) => {
        setItems(prev => prev.map(it => it.id_producto === id_producto ? { ...it, cantidad } : it));
    };

    const updatePromoCantidad = (id_promocion: number, cantidad: number) => {
        setPromosAdded(prev => prev.map(p => p.id_promocion === id_promocion ? { ...p, cantidad } : p));
    };

    const updatePromoPrecio = (id_promocion: number, precio: number | null) => {
        setPromosAdded(prev => prev.map(p => p.id_promocion === id_promocion ? { ...p, precio } : p));
    };

    return (
        <Modal close={modalNuevaVenta.close} title="Nueva Venta">
                <div className="modal-minimal-body">
                    <div className="form-group" style={{ position: 'relative' }} ref={productSearchRef}>
                        <label>Buscar Producto</label>
                        <input
                            type="text"
                            value={busquedaProducto}
                            onChange={(e) => {
                                setBusquedaProducto(e.target.value);
                                setShowProductosDropdown(true);
                                setProductoSeleccionado('');
                            }}
                            onFocus={() => setShowProductosDropdown(true)}
                            placeholder="Escribe para buscar..."
                        />
                        {showProductosDropdown && busquedaProducto && productosFiltrados.length > 0 && (
                            <ProductosDropDown productosFiltrados={productosFiltrados} seleccionarProducto={seleccionarProducto} />
                        )}
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '50%' }}>
                            <input
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                min="1"
                                placeholder="0"
                            />
                        </div>
                        <button className="btn-secondary" onClick={agregarItem} style={{ width: '50%' }} disabled={crearVentaAsync.loading}>
                            + Agregar
                        </button>
                    </div>

                    {/* Método de pago */}
                    <div className="form-group">
                        <label>Método de pago</label>
                        <select
                            value={metodoPago}
                            onChange={e => setMetodoPago(e.target.value as typeof metodoPago)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid #ddd', backgroundColor: '#fff' }}
                        >
                            <option value="efectivo">Efectivo (pagada)</option>
                            <option value="transferencia">Transferencia (pagada)</option>
                            <option value="mercadopago">Mercado Pago (pagada)</option>
                            <option value="plan_de_pago">Plan de pago (cuotas)</option>
                        </select>
                    </div>

                    {/* Configuración del plan de pago */}
                    {metodoPago === 'plan_de_pago' && (
                        <PlanDePagoForm
                            totalMonto={calcularTotales.totalPesos}
                            onChange={setPlanConfig}
                        />
                    )}

                    <div style={{ height: 8 }} />
                    <div className="form-group" style={{ position: 'relative' }} ref={promoSearchRef}>
                        <label>Buscar Promoción</label>
                        <input
                            type="text"
                            value={busquedaPromo}
                            onChange={(e) => {
                                setBusquedaPromo(e.target.value);
                                setShowPromosDropdown(true);
                                setPromoSeleccionada('');
                            }}
                            onFocus={() => setShowPromosDropdown(true)}
                            placeholder="Escribe para buscar..."
                        />
                        {showPromosDropdown && busquedaPromo && promocionesFiltradas.length > 0 && (
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
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                {promocionesFiltradas.map(p => (
                                    <div
                                        key={p.id_promocion}
                                        onClick={() => seleccionarPromocion(p)}
                                        style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f0f0f0',
                                            fontSize: '14px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            Precio: ${(p.precio ?? 0).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '50%' }}>
                            <input
                                type="number"
                                value={promoCantidad}
                                onChange={(e) => setPromoCantidad(e.target.value)}
                                min="1"
                            />
                        </div>
                        <button className="btn-secondary" onClick={agregarPromocion} style={{ width: '50%' }} disabled={crearVentaAsync.loading}>
                            + Agregar
                        </button>
                    </div>

                    {items.length > 0 && (
                        <div className="items-list">
                            <h3>Productos agregados:</h3>
                            {items.map(item => (
                                <ProductRow key={item.id_producto} item={item} onUpdatePrice={updateProductPrice} onRemove={(id) => setItems(items.filter(i => i.id_producto !== id))} onChangeCantidad={updateProductCantidad} />
                            ))}
                        </div>
                    )}

                    {promosAdded.length > 0 && (
                        <div className="items-list" style={{ marginTop: 12 }}>
                            <h3>Promociones agregadas:</h3>
                            {promosAdded.map(p => (
                                <PromoRow key={p.id_promocion} promo={p} onChangeCantidad={updatePromoCantidad} onChangePrecio={updatePromoPrecio} onRemove={removerPromocion} />
                            ))}
                        </div>
                    )}
                    <div style={{
                        marginTop: '15px',
                        paddingTop: '15px',
                        borderTop: '2px solid #ddd'
                    }}>
                        {calcularTotales.tienePesos && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                marginBottom: calcularTotales.tieneDolares ? '8px' : '0'
                            }}>
                                <span>Total (ARS):</span>
                                <span>${calcularTotales.totalPesos.toFixed(2)}</span>
                            </div>
                        )}
                        {calcularTotales.tieneDolares && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}>
                                <span>Total (USD):</span>
                                <span>${calcularTotales.totalDolares.toFixed(2)} USD</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-minimal-footer">
                    <button className="btn-secondary" onClick={modalNuevaVenta.close} disabled={crearVentaAsync.loading}>Cancelar</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={crearVentaAsync.loading}>
                        {crearVentaAsync.loading ? 'Registrando...' : 'Registrar Venta'}
                    </button>
                </div>
        </Modal>
    );
});
