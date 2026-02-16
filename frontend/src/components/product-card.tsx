import { Link } from "react-router-dom"
import { ShoppingBag } from "lucide-react"
import { Button } from "./ui/button"

interface ProductCardProps {
  id: number
  name: string
  price: number
  category: string
  image: string
}

export function ProductCard({ id, name, price, category, image }: ProductCardProps) {
  return (
    <div className="group relative bg-surface border border-border overflow-hidden hover:border-primary transition-all duration-300">
      <Link to={`/product/${id}`} className="block aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-black/80 backdrop-blur-md text-[10px] font-bold tracking-[2px] uppercase px-3 py-1 border border-border">
            {category}
          </span>
        </div>
      </Link>

      <div className="p-6 space-y-4">
        <div>
          <Link to={`/product/${id}`}>
            <h3 className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors line-clamp-1">
              {name}
            </h3>
          </Link>
          <p className="text-primary font-bold mt-1">
            ${price.toFixed(2)}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
