import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/store/use-cart"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "The Initiation", href: "/initiation" },
    { name: "History", href: "/history" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "bg-black/80 backdrop-blur-lg border-b border-border py-3" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="border-2 border-white w-10 h-10 flex items-center justify-center font-bold text-xl group-hover:border-primary transition-colors">TC</div>
          <span className="text-xl font-bold tracking-[8px] uppercase hidden sm:block">Tuath Coir</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-xs font-bold tracking-widest uppercase transition-colors hover:text-primary",
                location.pathname === link.href ? "text-primary" : "text-gray-300"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/cart" className="relative hover:text-primary transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {useCart().itemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold text-white">
                {useCart().itemCount()}
              </span>
            )}
          </Link>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="h-8 px-4 text-[10px]">
              Admin
            </Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-5 h-5" />
            {useCart().itemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold text-white">
                {useCart().itemCount()}
              </span>
            )}
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black border-b border-border p-6 md:hidden flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold tracking-widest uppercase hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <Link to="/initiation" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full">Take the Oath</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
