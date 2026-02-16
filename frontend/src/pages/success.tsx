import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle, Package, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Success() {
  const [searchParams] = useSearchParams()
  const orderNumber = searchParams.get("order")

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="container max-w-2xl mx-auto text-center space-y-12">
        <div className="w-24 h-24 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="text-primary w-12 h-12" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Order Confirmed</h1>
          <p className="text-gray-400 uppercase tracking-[3px] text-xs">Your gear is being forged in the territories.</p>
        </div>

        <div className="p-8 bg-surface border border-border space-y-6 text-left">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order Number</span>
            <span className="text-sm font-bold tracking-widest uppercase">{orderNumber || "TC-12345678"}</span>
          </div>

          <div className="flex gap-4 items-start py-2">
            <Package className="w-5 h-5 text-primary shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest">Status: Processing</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Your order has been sent to our supplier territories (Printful/Zendrop).
                You will receive a messenger alert (email) with tracking details once shipped.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start py-2">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest">Protected Transaction</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                The tribe ensures the integrity of your purchase.
                Any issues will be resolved with honor.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/shop">
            <Button variant="outline" size="lg" className="w-64">Continue Shopping</Button>
          </Link>
          <Link to="/">
            <Button size="lg" className="w-64 group">
              Return Home
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
