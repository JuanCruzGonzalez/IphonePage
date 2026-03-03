import { Empleado } from "../../../core/types";
import { ViewButton, ActivateButton, DeleteButton, EditButton } from "./EmpleadoActionButtons";
import TableHeader from "./TableHeader";

export default function TablaEmpleados({ empleadosOrdenados, handleEstadoModalView ,handleEditarEmpleado, handleToggleEmpleadoEstado }: {
    empleadosOrdenados: Empleado[];
    handleEstadoModalView: (empleado: Empleado, open: boolean) => void;
    handleEditarEmpleado: (empleado: Empleado) => void;
    handleToggleEmpleadoEstado: (empleado: Empleado) => void;
}) {

    return (
        <>
            <table className='table'>
                <thead>
                    <tr key="header">
                        <TableHeader texto="Nombre" />
                        <TableHeader texto="Apellido" />
                        <TableHeader texto="Email" />
                        <TableHeader texto="DNI" />
                        <TableHeader texto="Fecha de alta" />
                        <TableHeader texto="Acciones" />
                    </tr>
                </thead>
                <tbody>
                    {empleadosOrdenados.map((emp) => (
                        <tr key={emp.user_id}>
                            <td>{emp.nombre}</td>
                            <td>{emp.apellido}</td>
                            <td>{emp.email}</td>
                            <td>{emp.dni}</td>
                            <td>{new Date(emp.created_at).toLocaleString()}</td>
                            <td style={{ display: 'flex', gap: 8 }}>
                                <ViewButton onClick={() => handleEstadoModalView(emp, true)} />
                                <EditButton onClick={() => handleEditarEmpleado(emp)} />
                                {
                                    emp.estado === 'activo' ? (
                                        <DeleteButton onClick={() => handleToggleEmpleadoEstado(emp)} />
                                    ) : (
                                        <ActivateButton onClick={() => handleToggleEmpleadoEstado(emp)} />
                                    )
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}