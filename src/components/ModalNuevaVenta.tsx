import React, { useState } from 'react';
import { Producto, Promocion, DetalleVentaInput } from '../types';
import { updateProducto } from '../api/productoService';

// Small row component for product items (editable unit price)
const ProductRow: React.FC<{
    item: { id_producto: number; cantidad: number; nombre: string; precioventa: number; unidadMedidaId: number };
    onUpdatePrice: (id_producto: number, newPrice: number) => void;
    onRemove: (id_producto: number) => void;
    onChangeCantidad: (id_producto: number, cantidad: number) => void;
}> = ({ item, onUpdatePrice, onRemove, onChangeCantidad }) => {
    return (
        <div key={item.id_producto} className="item-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', width: '100%' }}>
                <span>{item.nombre}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="qty-controls">
                        <button type="button" className="qty-button" onClick={() => onChangeCantidad(item.id_producto, Math.max(1, item.cantidad - 1))}>−</button>
                        <input
                            className="qty-input"
                            type="number"
                            min={1}
                            value={item.cantidad}
                            onChange={(e) => {
                                const raw = e.target.value;
                                // allow empty temporarily, but enforce minimum 1 when applying
                                const parsed = raw === '' ? 0 : parseInt(raw, 10);
                                if (isNaN(parsed)) return;
                                onChangeCantidad(item.id_producto, Math.max(1, parsed));
                            }}
                            style={{ width: 60, textAlign: 'center' }}
                        />
                        <button type="button" className="qty-button" onClick={() => onChangeCantidad(item.id_producto, item.cantidad + 1)}>+</button>
                    </div>
                    <span style={{ marginLeft: 8, color: '#666' }}>
                        <input
                            style={{
                                width: '70px',
                                backgroundColor: 'transparent',
                                color: '#000',
                                border: '1px solid #ccc',
                                borderRadius: 4,
                                padding: '2px 6px',
                            }}
                            type="number"
                            value={item.unidadMedidaId === 1 ? String(item.precioventa * 100) : String(item.precioventa)}
                            onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                onUpdatePrice(item.id_producto, item.unidadMedidaId === 1 ? val / 100 : val);
                            }}
                            min="0"
                        />
                        {item.unidadMedidaId === 1 ? ' x100gr' : ''}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontWeight: 'bold', width: '70px' }}>${item.cantidad * item.precioventa}</span>
                        <button className="btn-remove" onClick={() => onRemove(item.id_producto)}>Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Small row component for promotion items (editable quantity and unit price)
const PromoRow: React.FC<{
    promo: { id_promocion: number; name: string; precio: number | null; cantidad: number };
    onChangeCantidad: (id_promocion: number, cantidad: number) => void;
    onChangePrecio: (id_promocion: number, precio: number | null) => void;
    onRemove: (id_promocion: number) => void;
}> = ({ promo, onChangeCantidad, onChangePrecio, onRemove }) => {
    return (
        <div key={promo.id_promocion} className="item-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', width: '100%' }}>
                <span>{promo.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="qty-controls">
                        <button type="button" className="qty-button" onClick={() => onChangeCantidad(promo.id_promocion, Math.max(1, promo.cantidad - 1))}>−</button>
                        <input
                            className="qty-input"
                            type="number"
                            min={1}
                            value={promo.cantidad}
                            onChange={(e) => {
                                const raw = e.target.value;
                                const parsed = raw === '' ? 0 : parseInt(raw, 10);
                                if (isNaN(parsed)) return;
                                onChangeCantidad(promo.id_promocion, Math.max(1, parsed));
                            }}
                            style={{ width: 60, textAlign: 'center' }}
                        />
                        <button type="button" className="qty-button" onClick={() => onChangeCantidad(promo.id_promocion, promo.cantidad + 1)}>+</button>
                    </div>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                        <input
                            type="number"
                            value={promo.precio == null ? '' : String(promo.precio)}
                            onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === '') return onChangePrecio(promo.id_promocion, null);
                                const parsed = parseFloat(raw);
                                onChangePrecio(promo.id_promocion, isNaN(parsed) ? null : parsed);
                            }}
                            min="0"
                            style={{ width: '70px' }}
                        />
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontWeight: 'bold', width: '70px' }}>${(promo.precio ?? 0) * promo.cantidad}</span>
                        <button className="btn-remove" onClick={() => onRemove(promo.id_promocion)}>Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ModalNuevaVentaProps {
    isOpen: boolean;
    onClose: () => void;
    productos: Producto[];
    promociones?: Promocion[];
    onSubmit: (items: DetalleVentaInput[], pagada: boolean) => void;
    showToast?: (message: string) => void;
    showError?: (message: string) => void;
    showWarning?: (message: string) => void;
    showConfirm?: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
    loading?: boolean;
}

export const ModalNuevaVenta: React.FC<ModalNuevaVentaProps> = ({
    isOpen,
    onClose,
    productos,
    promociones = [],
    onSubmit,
    showError,
    showWarning,
    showToast,
    loading = false,
}) => {
    const [items, setItems] = useState<{ id_producto: number; cantidad: number; nombre: string; precioventa: number; unidadMedidaId: number }[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [pagada, setPagada] = useState(true);
    const [promoSeleccionada, setPromoSeleccionada] = useState('');
    const [promoCantidad, setPromoCantidad] = useState('1');
    const [promosAdded, setPromosAdded] = useState<{ id_promocion: number; name: string; precio: number | null; cantidad: number }[]>([]);

    if (!isOpen) return null;

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
            unidadMedidaId: producto.id_unidad_medida
        }]);
        setProductoSeleccionado('');
        setCantidad('');
    };

    const calcularTotal = () => {
        const productosTotal = items.reduce((total, item) => total + (item.cantidad * item.precioventa), 0);
        const promosTotal = promosAdded.reduce((total, p) => total + (p.cantidad * (p.precio ?? 0)), 0);
        return productosTotal + promosTotal;
    };

    const handleSubmit = () => {
        if (items.length === 0 && promosAdded.length === 0) {
            showWarning?.('Agregue al menos un producto o promoción');
            return;
        }

        const productosDetalles = items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad, precioUnitario: i.precioventa }));
        const promocionesDetalles = promosAdded.map(p => ({ id_promocion: p.id_promocion, cantidad: p.cantidad, precioUnitario: p.precio ?? undefined }));

        onSubmit([...productosDetalles, ...promocionesDetalles], pagada);
        setItems([]);
        setProductoSeleccionado('');
        setCantidad('');
        setPromosAdded([]);
        setPromoSeleccionada('');
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
        setPromoCantidad('1');
    };

    const removerPromocion = (id_promocion: number) => {
        setPromosAdded(prev => prev.filter(p => p.id_promocion !== id_promocion));
    };

    const updateProductPrice = async (id_producto: number, newPrice: number) => {
        setItems(prev => prev.map(it => it.id_producto === id_producto ? { ...it, precioventa: newPrice } : it));
        
        try {
            await updateProducto(id_producto, { precioventa: newPrice });
            showToast?.('Precio actualizado en la base de datos');
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-minimal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-minimal-header">
                    <h2>Nueva Venta</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-minimal-body">
                    <div className="form-group">
                        <label>Producto</label>
                        <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
                            <option value="">Seleccionar producto</option>
                            {productos.map(p => (
                                <option key={p.id_producto} value={p.id_producto}>
                                    {p.nombre} (Stock: {p.stock}) - ${p.id_unidad_medida === 1 ? p.precioventa * 100 : p.precioventa}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Cantidad</label>
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            min="1"
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={pagada} onChange={(e) => setPagada(e.target.checked)} />
                            <span>Pagada</span>
                        </label>
                    </div>
                    <button className="btn-secondary" onClick={agregarItem} style={{ width: '100%' }} disabled={loading}>
                        + Agregar Producto
                    </button>

                    <div style={{ height: 8 }} />
                    <div className="form-group">
                        <label>Promoción</label>
                        <select value={promoSeleccionada} onChange={(e) => setPromoSeleccionada(e.target.value)}>
                            <option value="">Seleccionar promoción</option>
                            {promociones?.map(p => (
                                <option key={p.id_promocion} value={p.id_promocion}>
                                    {p.name} - ${p.precio ?? 0}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Cantidad promo</label>
                        <input
                            type="number"
                            value={promoCantidad}
                            onChange={(e) => setPromoCantidad(e.target.value)}
                            min="1"
                        />
                    </div>
                    <button className="btn-secondary" onClick={agregarPromocion} style={{ width: '100%' }} disabled={loading}>
                        + Agregar Promoción
                    </button>

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
                        borderTop: '2px solid #ddd',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        <span>Total:</span>
                        <span>${calcularTotal()}</span>
                    </div>
                </div>

                <div className="modal-minimal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrar Venta'}
                    </button>
                </div>

            </div>
        </div>
    );
};
