import { Link } from "react-router-dom"
import { Shield, Mail, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black border-t border-border pt-20 pb-10 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="border-2 border-white w-10 h-10 flex items-center justify-center font-bold text-xl">TC</div>
              <span className="text-xl font-bold tracking-[8px] uppercase">Tuath Coir</span>
            </Link>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              ANCIENT CELTIC ROOTS. PROTECT YOUR OWN.
              Small kingdom. Unified tribe. Urban apparel forged in heritage.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest mb-6 text-sm">Territories</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="/shop" className="hover:text-primary transition-colors">All Collections</Link></li>
              <li><Link to="/initiation" className="hover:text-primary transition-colors">The Initiation</Link></li>
              <li><Link to="/history" className="hover:text-primary transition-colors">Our History</Link></li>
              <li><Link to="/admin" className="hover:text-primary transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest mb-6 text-sm">Support</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-[10px] tracking-[3px] uppercase">
            © 2024 TUATH COIR TERRITORIES. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="w-3 h-3" />
            <span className="text-[10px] tracking-widest uppercase">Secured by The Tribe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
