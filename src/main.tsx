import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'

// Font Awesome removed in favor of Lucide React

import App from './App.tsx'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { HydrationGuard } from '@/components/HydrationGuard'
import { AuthProvider } from '@/context/AuthContext'
import { StudentProvider } from '@/context/StudentContext'
import { PwaProvider } from '@/context/PwaContext'
import { ResponsiveWrapper } from '@/components/Layout/ResponsiveWrapper'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HydrationGuard>
        <AuthProvider>
          <PwaProvider>
            <StudentProvider>
              <ResponsiveWrapper>
                <App />
              </ResponsiveWrapper>
            </StudentProvider>
          </PwaProvider>
        </AuthProvider>
      </HydrationGuard>
      <Toaster position="bottom-right" richColors />
    </ErrorBoundary>
  </StrictMode>,
)

