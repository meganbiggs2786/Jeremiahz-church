import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ShoppingBag, ArrowLeft, Shield, Truck, RefreshCw, Loader2 } from "lucide-react"
import { getProduct } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/store/use-cart"

export function ProductDetail() {
  const { id } = useParams()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    enabled: !!id
  })

  const product = productData?.product

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 text-center space-y-6">
        <h2 className="text-3xl font-bold uppercase tracking-widest">Gear Lost in Transit</h2>
        <p className="text-gray-500">The product you are looking for does not exist in our territories.</p>
        <Link to="/shop">
          <Button variant="outline">Back to Collection</Button>
        </Link>
      </div>
    )
  }

  const sizes = ["S", "M", "L", "XL", "2XL"]

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[3px] text-gray-400 hover:text-primary transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-surface border border-border overflow-hidden">
              <img
                src={product.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.slice(1).map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-surface border border-border overflow-hidden cursor-pointer hover:border-primary transition-all">
                  <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-primary font-bold tracking-[4px] uppercase text-xs">{product.category}</span>
              <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">{product.name}</h1>
              <p className="text-3xl font-bold text-white">${product.price.toFixed(2)}</p>
            </div>

            <p className="text-gray-400 leading-relaxed text-lg">
              {product.description || "Premium urban wear forged for the modern tribe. Designed with ancient roots and built for the concrete territory."}
            </p>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest">Select Size</span>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Size Guide</button>
                </div>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center border font-bold text-sm transition-all",
                        selectedSize === size ? "bg-primary border-primary text-white" : "border-border text-gray-400 hover:border-white"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest">Quantity</span>
                <div className="flex items-center w-32 border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex-1 h-12 flex items-center justify-center hover:bg-surface"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex-1 h-12 flex items-center justify-center hover:bg-surface"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 h-16"
                  onClick={() => {
                    if (sizes.length > 0 && !selectedSize) {
                      alert("Please select a size first.")
                      return
                    }
                    useCart.getState().addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: quantity,
                      size: selectedSize || undefined,
                      image: product.images?.[0] || ""
                    })
                  }}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg" className="flex-1 h-16">
                  Buy Now
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-border">
              <div className="flex gap-4 items-start">
                <Truck className="w-5 h-5 text-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest">Global Shipping</p>
                  <p className="text-[10px] text-gray-500">Ships to all territories in 5-7 days.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <RefreshCw className="w-5 h-5 text-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest">30 Day Returns</p>
                  <p className="text-[10px] text-gray-500">Return to your tribe if it doesn't fit.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Shield className="w-5 h-5 text-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest">Secure Checkout</p>
                  <p className="text-[10px] text-gray-500">Encrypted payments for your protection.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
