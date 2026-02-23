import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import App from './App.tsx'
import LoginForm from './auth/form.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { ProtectedRoute } from './auth/ProtectedRoute.tsx'
import { ClientePage } from './features/tienda/ClientePage.tsx'
import { ProductoDetallePage } from './features/tienda/ProductoDetallePage.tsx'
import { TiendaLayout } from './features/tienda/TiendaLayout.tsx'
import { TiendaProductosPage } from './features/tienda/TiendaProductosPage.tsx'
import { TiendaPromocionesPage } from './features/tienda/TiendaPromocionesPage.tsx'
import { CarritoProvider } from './features/tienda/context/CarritoContext.tsx'
import './core/styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/*"
              element={
                <CarritoProvider>
                  <TiendaLayout />
                </CarritoProvider>
              }
            >
              <Route index element={<ClientePage />} />
              <Route path="productos" element={<TiendaProductosPage />} />
              <Route path="promociones" element={<TiendaPromocionesPage />} />
              <Route path="producto/:id" element={<ProductoDetallePage />} />
            </Route>
            <Route path="/administracion/IphonePage" element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)
