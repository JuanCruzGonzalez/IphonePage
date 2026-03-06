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
import { TiendaTelefonosPage } from './features/tienda/TiendaTelefonosPage.tsx'
import { TiendaPromocionesPage } from './features/tienda/TiendaPromocionesPage.tsx'
import { CarritoProvider } from './features/tienda/context/CarritoContext.tsx'
import { ClienteAuthProvider } from './features/tienda/context/ClienteAuthContext.tsx'
import { ProtectedClienteRoute } from './features/tienda/components/ProtectedClienteRoute.tsx'
import ClienteLoginPage from './features/tienda/ClienteLoginPage.tsx'
import ClienteSignupPage from './features/tienda/ClienteSignupPage.tsx'
import ClientePerfilPage from './features/tienda/ClientePerfilPage.tsx'
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
                <ClienteAuthProvider>
                  <CarritoProvider>
                    <TiendaLayout />
                  </CarritoProvider>
                </ClienteAuthProvider>
              }
            >
              <Route index element={<ClientePage />} />
              <Route path="telefonos" element={<TiendaTelefonosPage />} />
              <Route path="accesorios" element={<TiendaProductosPage />} />
              <Route path="promociones" element={<TiendaPromocionesPage />} />
              <Route path="producto/:id" element={<ProductoDetallePage />} />
              <Route path="login-cliente" element={<ClienteLoginPage />} />
              <Route path="registro" element={<ClienteSignupPage />} />
              <Route
                path="mi-cuenta"
                element={
                  <ProtectedClienteRoute>
                    <ClientePerfilPage />
                  </ProtectedClienteRoute>
                }
              />
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
