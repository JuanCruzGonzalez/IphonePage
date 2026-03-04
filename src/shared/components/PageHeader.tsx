import H1 from "./H1";

export default function PageHeader({ title, subtitle, funcion, textButton }: { title: string; subtitle?: string; funcion: () => void; textButton: string }) {
    return (
        <div className="page-header">
            <div>
                <H1 texto={title} />
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            <button className="btn-primary" onClick={funcion}>
                {textButton}
            </button>
        </div>
    )
}