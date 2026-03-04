import { Producto } from "../../../core/types";

export default function InputBusqueda({ busqueda, handleSetBusqueda, handleSeleccionarProducto, handleSetDropDown, loading }: { busqueda: string, handleSetBusqueda: (busqueda: string) => void, handleSeleccionarProducto: (producto: Producto | null) => void, handleSetDropDown: (show: boolean) => void, loading: boolean }) {
    return (
        <input
            type="text"
            value={busqueda}
            onChange={(e) => {
                handleSetBusqueda(e.target.value);
                handleSeleccionarProducto(null);
                handleSetDropDown(true);
            }}
            onFocus={() => handleSetDropDown(true)}
            placeholder="Escribe para buscar..."
            disabled={loading}
        />
    )
}