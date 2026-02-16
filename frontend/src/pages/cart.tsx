import { Link } from "react-router-dom"
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react"
import { useCart } from "@/store/use-cart"
import { Button } from "@/components/ui/button"

export function Cart() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="w-24 h-24 border-2 border-border flex items-center justify-center mx-auto text-gray-700">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold uppercase tracking-tight">Your Cart is Empty</h2>
            <p className="text-gray-500 uppercase tracking-widest text-xs">The territory is waiting for you to gear up.</p>
          </div>
          <Link to="/shop">
            <Button size="lg" className="h-16 px-12">Start Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="container mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-tight">Your Cart</h1>
          <p className="text-gray-500 tracking-[5px] uppercase text-[10px] font-bold mt-2">{itemCount()} Items in total</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex flex-col sm:flex-row gap-6 p-6 bg-surface border border-border group hover:border-primary transition-all">
                <div className="w-full sm:w-32 aspect-[4/5] bg-black overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-bold uppercase tracking-widest text-sm">{item.name}</h3>
                      {item.size && <p className="text-[10px] text-gray-500 uppercase tracking-widest">Size: {item.size}</p>}
                    </div>
                    <p className="font-bold text-primary">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    <div className="flex items-center border border-border h-10 w-28">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                        className="flex-1 flex items-center justify-center hover:bg-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="flex-1 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                        className="flex-1 flex items-center justify-center hover:bg-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border p-8 sticky top-32 space-y-8">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b border-border pb-4">Order Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm uppercase tracking-widest text-gray-400">
                  <span>Subtotal</span>
                  <span>${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm uppercase tracking-widest text-gray-400">
                  <span>Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
                <div className="flex justify-between text-sm uppercase tracking-widest text-gray-400">
                  <span>Tribal Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="pt-4 border-t border-border flex justify-between font-bold text-xl uppercase tracking-widest">
                  <span>Total</span>
                  <span>${total().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Link to="/checkout">
                  <Button className="w-full h-16 group">
                    Secure Checkout
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/shop" className="block text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-primary transition-colors">
                  Continue Shopping
                </Link>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-center gap-4 grayscale opacity-50">
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payments via Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
