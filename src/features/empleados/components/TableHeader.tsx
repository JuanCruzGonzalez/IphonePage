export default function TableHeader({ texto }: { texto: string }) {
    return (
        <th className="headerTable">{texto}</th>
    )
}