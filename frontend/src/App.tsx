import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Layout } from "@/components/layout"
import { Home } from "@/pages/home"
import { Shop } from "@/pages/shop"
import { ProductDetail } from "@/pages/product-detail"
import { Initiation } from "@/pages/initiation"
import { Cart } from "@/pages/cart"
import { Checkout } from "@/pages/checkout"
import { Success } from "@/pages/success"
import { History } from "@/pages/history"

// Placeholder pages
const Admin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL || ""}/admin`
  return null
}

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="initiation" element={<Initiation />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="success" element={<Success />} />
            <Route path="history" element={<History />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
