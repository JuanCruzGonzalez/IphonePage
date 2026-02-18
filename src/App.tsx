import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import './core/styles/app.css';
import './core/styles/toast.css';
import { Sidebar } from './shared/components/Sidebar';
import { VentasPage } from './features/ventas/VentasPage';
import { ProductosPage } from './features/productos/ProductosPage';
import { ProductosProvider } from './features/productos/context/ProductosContext';
import { VentasProvider } from './features/ventas/context/VentasContext';
import { PromocionesProvider } from './features/promociones/context/PromocionesContext';
import { GastosProvider } from './features/gastos/context/GastosContext';
import { CategoriasProvider } from './features/categorias/context/CategoriasContext';
import { StockPage } from './features/stock/StockPage';
import { PromocionesPage } from './features/promociones/PromocionesPage';
import { GastosPage } from './features/gastos/GastosPage';
import { CategoriasPage } from './features/categorias/CategoriasPage';
import { Toast, ConfirmModal } from './shared/components/ToastModal';
import { useToast, useConfirm } from './shared/hooks/useToast';
import { useDisableWheelOnNumberInputs } from './shared/hooks/useDisableWheelOnNumberInputs';

function App() {
  const [activeSection, setActiveSection] = useState<'ventas' | 'productos' | 'stock' | 'promociones' | 'gastos' | 'categorias'>('ventas');

  // Hooks para toast y confirmación
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();

  // Deshabilitar comportamiento de la rueda sobre inputs number (global)
  useDisableWheelOnNumberInputs();

  return (
    <QueryClientProvider client={queryClient}>
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
                <div className="app-container">
                  <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

                  <main className="main-content">
                    {activeSection === 'ventas' && <VentasPage />}
                    {activeSection === 'productos' && <ProductosPage />}
                    {activeSection === 'stock' && <StockPage />}
                    {activeSection === 'promociones' && <PromocionesPage />}
                    {activeSection === 'gastos' && <GastosPage />}
                    {activeSection === 'categorias' && <CategoriasPage />}
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
              </CategoriasProvider>
            </GastosProvider>
          </PromocionesProvider>
        </ProductosProvider>
      </VentasProvider>

      {/* React Query Devtools - Solo en desarrollo, se elimina automáticamente en producción */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;