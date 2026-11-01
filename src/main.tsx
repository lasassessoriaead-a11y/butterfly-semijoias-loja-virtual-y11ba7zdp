/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import pwaIcon from './assets/butterfly-app-13d68.png'
import './main.css'

// @skip-protected: Do not remove. Required for React rendering.
const manifest = {
  name: 'Butterfly SEMIJOIAS',
  short_name: 'Butterfly',
  description: 'Loja virtual Butterfly SEMIJOIAS — ambiente de pré-lançamento.',
  start_url: '/',
  display: 'standalone',
  background_color: '#F7F3E9',
  theme_color: '#075746',
  lang: 'pt-BR',
  icons: [{ src: pwaIcon, sizes: '1254x1254', type: 'image/png', purpose: 'any' }],
}
const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
if (manifestLink) {
  manifestLink.href = URL.createObjectURL(
    new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }),
  )
}

createRoot(document.getElementById('root')!).render(<App />)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}
