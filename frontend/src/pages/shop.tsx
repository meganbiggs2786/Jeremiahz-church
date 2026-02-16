import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Filter, Search, Loader2 } from "lucide-react"
import { getProducts, getCategories } from "@/lib/api"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => getProducts(selectedCategory || undefined),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const filteredProducts = productsData?.products?.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="container mx-auto">
        <header className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">The Collection</h1>
          <p className="text-gray-500 tracking-[5px] uppercase text-xs font-bold">Gear for the modern tribe</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-10">
            <div className="space-y-6">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b border-border pb-2">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Find gear..."
                  className="pl-10 h-10 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b border-border pb-2">Categories</h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-xs font-bold uppercase tracking-widest text-left px-4 py-2 transition-all ${!selectedCategory ? 'bg-primary text-white' : 'hover:bg-surface text-gray-400'}`}
                >
                  All Territories
                </button>
                {categoriesData?.categories?.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`text-xs font-bold uppercase tracking-widest text-left px-4 py-2 transition-all ${selectedCategory === cat.name ? 'bg-primary text-white' : 'hover:bg-surface text-gray-400'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {productsLoading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    category={product.category}
                    image={product.images?.[0] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"}
                  />
                ))}
              </div>
            ) : (
              <div className="h-96 border border-dashed border-border flex flex-col items-center justify-center text-center p-12 space-y-4">
                <Filter className="w-12 h-12 text-gray-700" />
                <h3 className="text-xl font-bold uppercase tracking-widest">No gear found</h3>
                <p className="text-gray-500 max-w-xs">Try adjusting your filters or search to find what you're looking for.</p>
                <Button variant="outline" onClick={() => {setSelectedCategory(null); setSearchQuery("");}}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
