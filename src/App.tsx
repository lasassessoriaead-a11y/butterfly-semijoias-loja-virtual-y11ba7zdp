import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Layout } from '@/components/Layout'
import { StoreProvider } from '@/contexts/StoreContext'
import Index from '@/pages/Index'
import CatalogPage from '@/pages/CatalogPage'
import ProductPage from '@/pages/ProductPage'
import CartCheckoutPage from '@/pages/CartCheckoutPage'
import AccountPage from '@/pages/AccountPage'
import ResellerPage from '@/pages/ResellerPage'
import ContactPage from '@/pages/ContactPage'
import AboutPage from '@/pages/AboutPage'
import PoliciesPage from '@/pages/PoliciesPage'
import AdminPage from '@/pages/AdminPage'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="loja" element={<CatalogPage />} />
            <Route path="categoria/:category" element={<CatalogPage />} />
            <Route path="lancamentos" element={<CatalogPage mode="new" />} />
            <Route path="mais-vendidos" element={<CatalogPage mode="best" />} />
            <Route path="produto/:slug" element={<ProductPage />} />
            <Route path="carrinho" element={<CartCheckoutPage />} />
            <Route path="checkout" element={<CartCheckoutPage />} />
            <Route path="conta" element={<AccountPage />} />
            <Route path="revendedora" element={<ResellerPage />} />
            <Route path="contato" element={<ContactPage />} />
            <Route path="sobre" element={<AboutPage />} />
            <Route path="politicas" element={<PoliciesPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </StoreProvider>
    </BrowserRouter>
  )
}
