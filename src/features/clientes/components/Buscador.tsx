import InputBuscador from "./InputBuscador";

export default function Buscador({ busqueda, handleSetBuscar, handleBuscar }: { busqueda: string; handleSetBuscar: (value: string) => void; handleBuscar: (value?: string) => void; }) {
    return (
        <div className="buscador">
            <InputBuscador busqueda={busqueda} handleSetBuscar={handleSetBuscar} handleBuscar={handleBuscar} />
            <button className="btn-primary" onClick={() => handleBuscar()}>
                Buscar
            </button>
            {busqueda && (
                <button
                    className="btn-secondary"
                    onClick={() => {
                        handleSetBuscar('');
                        handleBuscar('');
                    }}
                >
                    Limpiar
                </button>
            )}
        </div>
    )
}