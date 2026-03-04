export default function BotonAccion({ handle, p, icon, tipo }: { handle: (p: any) => void, p: any, icon: JSX.Element, tipo: 'ver' | 'editar' | 'cambiar-estado' | 'eliminar' }) {
    const getButtonClass = () => {
        switch (tipo) {
            case 'ver':
                return 'btn-secondary';
            case 'editar':
                return 'btn-secondary';
            case 'cambiar-estado':
                return 'btn-primary';
            case 'eliminar':
                return 'btn-danger';
            default:
                return '';
        }
    };
    const getButtonClassBg = () => {
        switch (tipo) {
            case 'cambiar-estado':
                return 'background-white';
            default:
                return '';
        }
    };

    return (
        <button className={`btn-sm ${getButtonClass()} mr-2 width-40 height-40 border-1 padding-10 ${getButtonClassBg()} justify-center`} onClick={() => handle(p)}>
            {icon}
        </button>
    )
}