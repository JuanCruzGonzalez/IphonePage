export default function CargandoPage({ mensaje }: { mensaje?: string }) {
    return (
        <div className="page">
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Cargando {mensaje || 'datos'}...</p>
            </div>
        </div>
    )
}