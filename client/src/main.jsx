import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { SidebarProvider } from './components/Sidebar'

// OPTIMIZATION: React Query Client with efficient caching configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // OPTIMIZATION: Cache data for 5 minutes to reduce API calls
      staleTime: 5 * 60 * 1000,
      // OPTIMIZATION: Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // OPTIMIZATION: Disable refetch on window focus to reduce unnecessary calls
      refetchOnWindowFocus: false,
      // OPTIMIZATION: Retry failed queries 2 times max with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // OPTIMIZATION: Don't retry mutations by default
      retry: 1,
    },
  },
})

// Automatic recovery for dynamic chunk imports after new Vercel deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected (stale chunk after new deployment). Reloading...', event);
  const now = Date.now();
  const lastReload = Number(sessionStorage.getItem('last_vite_preload_reload') || 0);
  if (now - lastReload > 8000) {
    sessionStorage.setItem('last_vite_preload_reload', String(now));
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </QueryClientProvider>
  </StrictMode>,
)
