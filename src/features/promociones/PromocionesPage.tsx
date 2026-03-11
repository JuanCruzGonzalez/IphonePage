import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import { usePromociones } from './context/PromocionesContext';
import { ModalCrearPromocion } from './components/ModalCrearPromocion';
import ModalVerPromocion from './components/ModalVerPromocion';
import { getProductosActivos } from '../productos/services/productoService';
import { useToast } from '../../shared/hooks/useToast';
import Page from '../../shared/components/Page';
import Card from '../../shared/components/Card';
import H1 from '../../shared/components/H1';
import TablaPromociones from './components/TablaPromociones';

export const PromocionesPage: React.FC = () => {
    const {
        modalCrearPromocion,
    } = usePromociones();

    const { showWarning } = useToast();

    const { data: productosActivos = [] } = useQuery({
        queryKey: queryKeys.productosActivos,
        queryFn: getProductosActivos,
        staleTime: 1000 * 60 * 5,
    });
    return (
        <Page>
            <div className="page-header">
                <div>
                    <H1 texto="Promociones" />
                    <p className="page-subtitle">Crea y administra promociones</p>
                </div>
                <button className="btn-primary" onClick={modalCrearPromocion.open}>+ Nueva Promoción</button>
            </div>

            <Card>
                <TablaPromociones />
            </Card>

            {/* Modales */}
            <ModalCrearPromocion
                productos={productosActivos}
                showWarning={showWarning}
            />
            <ModalVerPromocion
                productosCatalogo={productosActivos}
            />
        </Page>
    );
};

export default PromocionesPage;
