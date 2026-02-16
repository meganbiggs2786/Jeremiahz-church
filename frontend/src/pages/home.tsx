import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Shield, Sword, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"

export function Home() {
  const featuredProducts = [
    {
      id: 1,
      name: "Celtic Knot Urban Tee",
      price: 34.99,
      category: "Urban Wear",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      name: "Territory Tactical Hoodie",
      price: 64.99,
      category: "Athletic Wear",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      name: "Ancient Roots Beanie",
      price: 24.99,
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1576871333021-d55fbc6594c2?auto=format&fit=crop&q=80&w=800"
    }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2000"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-primary tracking-[8px] text-xs uppercase font-bold">Small Kingdom. Unified Tribe.</p>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-tight leading-none">
              Ancient <span className="text-primary">Roots.</span>
            </h1>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-tight leading-none pb-8">
              Protect <span className="text-white border-b-4 border-white">Your Own.</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/shop">
                <Button size="lg" className="w-64">Shop the Collection</Button>
              </Link>
              <Link to="/initiation">
                <Button variant="outline" size="lg" className="w-64">The Initiation</Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-1 h-12 border-l border-white/20" />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 bg-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 text-center md:text-left">
              <div className="w-16 h-16 border-2 border-primary flex items-center justify-center mx-auto md:mx-0">
                <Shield className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Territorial Integrity</h3>
              <p className="text-gray-400 leading-relaxed">
                We believe in protecting what is ours—our culture, our family, and our history. Tuath Coir is the armor for your identity.
              </p>
            </div>
            <div className="space-y-6 text-center md:text-left">
              <div className="w-16 h-16 border-2 border-primary flex items-center justify-center mx-auto md:mx-0">
                <Sword className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Celtic Craft</h3>
              <p className="text-gray-400 leading-relaxed">
                Every design is forged with respect for the ancient symbols. We bridge the gap between the tribal past and the urban future.
              </p>
            </div>
            <div className="space-y-6 text-center md:text-left">
              <div className="w-16 h-16 border-2 border-primary flex items-center justify-center mx-auto md:mx-0">
                <Users className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest">Unified Tribe</h3>
              <p className="text-gray-400 leading-relaxed">
                When you wear Tuath Coir, you are part of the kingdom. No upfront costs, just raw community and shared strength.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 px-6 bg-surface border-y border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold uppercase tracking-tight">Essential Gear</h2>
              <p className="text-gray-500 tracking-[3px] uppercase text-xs font-bold">The latest from the territories</p>
            </div>
            <Link to="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
              View All Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto relative z-10 text-center space-y-10">
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tight max-w-4xl mx-auto">
            Ready to join the <span className="text-primary">Tribe?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto uppercase tracking-widest">
            The initiation awaits. Claim your territory and get your tribal reward.
          </p>
          <Link to="/initiation" className="inline-block">
            <Button size="lg" className="h-16 px-12 text-lg">Take the Oath</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
