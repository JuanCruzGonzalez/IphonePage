import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import LoginForm from './auth/form.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { ProtectedRoute } from './auth/ProtectedRoute.tsx'
import { ClientePage } from './features/tienda/ClientePage.tsx'
import './core/styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/tienda" element={<ClientePage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
