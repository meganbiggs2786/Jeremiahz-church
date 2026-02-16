import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Shield, ArrowLeft, Loader2, CreditCard } from "lucide-react"
import { useCart } from "@/store/use-cart"
import { createOrder, createPaymentIntent } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US"
  })

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 px-6 text-center space-y-6">
        <h2 className="text-3xl font-bold uppercase tracking-widest">No gear to checkout</h2>
        <Link to="/shop">
          <Button variant="outline">Back to Shop</Button>
        </Link>
      </div>
    )
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // 1. Create Order in Backend
      const orderResult = await createOrder({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          line1: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country
        },
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.size
        }))
      })

      if (orderResult.success) {
        // 2. Create Payment Intent
        const paymentResult = await createPaymentIntent({
          order_number: orderResult.order_number,
          amount: total().toString()
        })

        if (paymentResult.success) {
          // In a real app, we would redirect to Stripe Checkout or handle it with Stripe Elements.
          // For this Phase 3 implementation, we will simulate a successful payment redirect.
          alert("Order created! Redirecting to secure payment portal...")

          // Simulation of success
          setTimeout(() => {
            clearCart()
            navigate(`/success?order=${orderResult.order_number}`)
          }, 2000)
        }
      }
    } catch (err: any) {
      alert("Checkout failed: " + (err.response?.data?.error || "Unknown error"))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="container mx-auto">
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[3px] text-gray-400 hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <header>
              <h1 className="text-4xl font-bold uppercase tracking-tight">Checkout</h1>
              <p className="text-gray-500 tracking-[5px] uppercase text-[10px] font-bold mt-2">Secure Tribal Transaction</p>
            </header>

            <form onSubmit={handleCheckout} className="space-y-8">
              <section className="space-y-6">
                <h3 className="font-bold uppercase tracking-widest text-sm border-b border-border pb-2">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <Input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                  <Input
                    required
                    placeholder="Phone Number"
                    className="md:col-span-2"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="font-bold uppercase tracking-widest text-sm border-b border-border pb-2">Shipping Territory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    required
                    placeholder="Address"
                    className="md:col-span-2"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                  <Input
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                  <Input
                    required
                    placeholder="State / Province"
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                  />
                  <Input
                    required
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={e => setFormData({...formData, postalCode: e.target.value})}
                  />
                  <Input
                    required
                    placeholder="Country"
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                  />
                </div>
              </section>

              <div className="p-6 bg-surface border border-border space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Encrypted and Secure</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  By completing this order, you agree to the Tuath Coir tribal terms. Your gear will be shipped from our territories to yours.
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full h-16 text-lg group" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Authorize Payment — ${total().toFixed(2)}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Cart Preview */}
          <div className="lg:bg-surface/50 lg:p-12 border-l border-border">
            <h3 className="font-bold uppercase tracking-widest text-sm mb-8">Order Preview</h3>
            <div className="space-y-6 mb-12">
              {items.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4">
                  <div className="w-16 h-20 bg-black border border-border shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">{item.name}</h4>
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest">Size: {item.size} | Qty: {item.quantity}</p>
                    <p className="text-xs font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex justify-between text-xs uppercase tracking-widest text-gray-400">
                <span>Subtotal</span>
                <span>${total().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs uppercase tracking-widest text-gray-400">
                <span>Shipping</span>
                <span className="text-primary">Free</span>
              </div>
              <div className="flex justify-between font-bold text-xl uppercase tracking-widest pt-4 border-t border-border">
                <span>Total</span>
                <span>${total().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
