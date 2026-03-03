export default function EstadisticaCard({ title, value }: { title: string; value: number; }) {
    return (
        <div className="stat-card-minimal">
            <div className="stat-label">{title}</div>
            <div className="stat-value">{value}</div>
        </div>
    )
}