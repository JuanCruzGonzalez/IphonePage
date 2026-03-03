interface RenderKPIProps {
    value: string;
    label: string;
    sub: string | null;
    subClass: '' | 'positive' | 'negative';
    iconEl: React.ReactNode;
    iconClass: string;
    cardClass: string;
    loading?: boolean;
}
export default function RenderKPI(
    { value, label, sub, subClass, iconEl, iconClass, cardClass, loading = false }: RenderKPIProps
) {
    return (
        <div className={`kpi-card ${cardClass}`}>
            <div className={`kpi-icon ${iconClass}`}>{iconEl}</div>
            <div className="kpi-label">{label}</div>
            <div className={`kpi-value${loading ? ' loading' : ''}`}>{loading ? '\u00a0' : value}</div>
            {sub && <div className={`kpi-sub ${subClass}`}>{sub}</div>}
        </div>
    );
}
