import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './App.jsx'
import store from './app/store.js'
import AuthProvider from './app/providers/AuthProvider.jsx'
import { ToastProvider } from './shared/hooks/useToast.jsx'
import ToastViewport from './shared/components/ui/ToastViewport.jsx'
import './styles/global.css'

const savedTheme = localStorage.getItem('ink-theme')
const initialDark = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.classList.toggle('dark', initialDark)

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ToastProvider>
              <App />
              <ToastViewport />
            </ToastProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)
