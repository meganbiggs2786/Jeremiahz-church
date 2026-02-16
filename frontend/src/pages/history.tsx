import { motion } from "framer-motion"
import { History as HistoryIcon, Map, Anchor, Mountain } from "lucide-react"

export function History() {
  const timeline = [
    {
      year: "Ancient Times",
      title: "The Roots",
      desc: "The Tuath (people) of the Coir (just/proper) lived by the code of territory and honor.",
      icon: <HistoryIcon className="w-6 h-6" />
    },
    {
      year: "1500s",
      title: "The Highland Stand",
      desc: "Protecting the northern reach against all odds. The sword becomes the symbol of the tribe.",
      icon: <Mountain className="w-6 h-6" />
    },
    {
      year: "Modern Era",
      title: "The Urban Transition",
      desc: "The tribe moves to the city, but the roots remain. The sword meets the street.",
      icon: <Anchor className="w-6 h-6" />
    },
    {
      year: "Today",
      title: "Tuath Coir Territories",
      desc: "A unified kingdom, protecting our own through apparel and community.",
      icon: <Map className="w-6 h-6" />
    }
  ]

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="container max-w-4xl mx-auto space-y-20">
        <header className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight">Our History</h1>
          <p className="text-primary tracking-[8px] uppercase text-xs font-bold">Forged in Heritage. Built for the Street.</p>
        </header>

        <div className="space-y-12">
          {timeline.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-8 items-center md:items-start"
            >
              <div className="w-20 h-20 bg-surface border border-primary flex items-center justify-center shrink-0">
                <span className="text-primary">{item.icon}</span>
              </div>
              <div className="space-y-3 text-center md:text-left">
                <span className="text-primary font-bold tracking-[5px] uppercase text-[10px]">{item.year}</span>
                <h3 className="text-2xl font-bold uppercase tracking-widest">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed max-w-2xl">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-20 border-t border-border text-center">
          <p className="text-gray-500 italic max-w-2xl mx-auto">
            "We do not forget who we are. We simply adapt the armor for the territory we claim today."
          </p>
        </div>
      </div>
    </div>
  )
}
