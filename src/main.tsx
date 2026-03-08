import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'

// Inject Font Awesome if not already loaded
if (!document.querySelector('link[href*="font-awesome"]')) {
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
  document.head.appendChild(fa);
}

import App from './App.tsx'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import { StudentProvider } from '@/context/StudentContext'
import { ResponsiveWrapper } from '@/components/Layout/ResponsiveWrapper'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <StudentProvider>
          <ResponsiveWrapper>
            <App />
          </ResponsiveWrapper>
        </StudentProvider>
      </AuthProvider>
      <Toaster position="bottom-right" richColors />
    </ErrorBoundary>
  </StrictMode>,
)

