import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import { StudentProvider } from '@/context/StudentContext'

window.onerror = function (message, source, lineno, colno, error) {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.background = 'red';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.innerHTML = `
    <h1>Global Error</h1>
    <p>${message}</p>
    <p>${source}:${lineno}:${colno}</p>
    <pre>${error?.stack}</pre>
  `;
  document.body.appendChild(errorDiv);
};

window.addEventListener('unhandledrejection', function (event) {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '50%';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.background = 'blue';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.innerHTML = `
    <h1>Unhandled Promise Rejection</h1>
    <p>${event.reason}</p>
    <pre>${event.reason?.stack}</pre>
  `;
  document.body.appendChild(errorDiv);
});

console.log('Main.tsx executing');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <StudentProvider>
          <App />
        </StudentProvider>
      </AuthProvider>
      <Toaster position="bottom-right" richColors />
    </ErrorBoundary>
  </StrictMode>,
)
