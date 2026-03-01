import { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './core/styles/app.css';
import { DashboardPage } from './features/dashboard/DashboardPage';
import './core/styles/toast.css';
import { Sidebar } from './shared/components/Sidebar';
import { VentasPage } from './features/ventas/VentasPage';
import { TelefonosPage } from './features/productos/TelefonosPage';
import { AccesoriosPage } from './features/productos/AccesoriosPage';
import { ProductosProvider } from './features/productos/context/ProductosContext';
import { VentasProvider } from './features/ventas/context/VentasContext';
import { PromocionesProvider } from './features/promociones/context/PromocionesContext';
import { GastosProvider } from './features/gastos/context/GastosContext';
import { CategoriasProvider } from './features/categorias/context/CategoriasContext';
import { PedidosProvider } from './features/pedidos/context/PedidosContext';
import { StockPage } from './features/stock/StockPage';
import { PromocionesPage } from './features/promociones/PromocionesPage';
import { GastosPage } from './features/gastos/GastosPage';
import { CategoriasPage } from './features/categorias/CategoriasPage';
import { PedidosPage } from './features/pedidos/PedidosPage';
import { Toast, ConfirmModal } from './shared/components/ToastModal';
import { useToast, useConfirm } from './shared/hooks/useToast';
import { useDisableWheelOnNumberInputs } from './shared/hooks/useDisableWheelOnNumberInputs';
import EmpleadosPage from './features/empleados/components/EmpleadosPage';
import { EmpleadosProvider } from './features/empleados/context/EmpleadoContext';

function App() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'ventas' | 'telefonos' | 'accesorios' | 'stock' | 'promociones' | 'gastos' | 'categorias' | 'pedidos' | 'empleados'>('dashboard');

  // Hooks para toast y confirmación
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();

  // Deshabilitar comportamiento de la rueda sobre inputs number (global)
  useDisableWheelOnNumberInputs();

  return (
    <>
      <VentasProvider
        showSuccess={showSuccess}
        showError={showError}
        showConfirm={showConfirm}
      >
        <ProductosProvider
          showSuccess={showSuccess}
          showError={showError}
          showWarning={showWarning}
          showConfirm={showConfirm}
        >
          <PromocionesProvider
            showSuccess={showSuccess}
            showError={showError}
            showWarning={showWarning}
            showConfirm={showConfirm}
          >
            <GastosProvider
              showSuccess={showSuccess}
              showError={showError}
              showConfirm={showConfirm}
            >
              <CategoriasProvider
                showSuccess={showSuccess}
                showError={showError}
                showConfirm={showConfirm}
              >
                <PedidosProvider
                  showSuccess={showSuccess}
                  showError={showError}
                  showConfirm={showConfirm}
                >
                  <EmpleadosProvider
                    showSuccess={showSuccess}
                    showError={showError}
                    showConfirm={showConfirm}
                  >
                    <div className="app-container">
                      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

                      <main className="main-content">
                        {activeSection === 'dashboard' && <DashboardPage />}
                        {activeSection === 'ventas' && <VentasPage />}
                        {activeSection === 'telefonos' && <TelefonosPage />}
                        {activeSection === 'accesorios' && <AccesoriosPage />}
                        {activeSection === 'stock' && <StockPage />}
                        {activeSection === 'promociones' && <PromocionesPage />}
                        {activeSection === 'gastos' && <GastosPage />}
                        {activeSection === 'categorias' && <CategoriasPage />}
                        {activeSection === 'pedidos' && <PedidosPage />}
                        {activeSection === 'empleados' && <EmpleadosPage />}
                      </main>

                      {/* Toast Notification */}
                      <Toast
                        isOpen={toast.isOpen}
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                      />

                      {/* Confirm Modal */}
                      <ConfirmModal
                        isOpen={confirm.isOpen}
                        onClose={hideConfirm}
                        onConfirm={confirm.onConfirm}
                        title={confirm.title}
                        message={confirm.message}
                        type={confirm.type}
                      />
                    </div>
                  </EmpleadosProvider>
                </PedidosProvider>
              </CategoriasProvider>
            </GastosProvider>
          </PromocionesProvider>
        </ProductosProvider>
      </VentasProvider>

      {/* React Query Devtools - Solo en desarrollo, se elimina automáticamente en producción */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </>
  );
}

export default App;