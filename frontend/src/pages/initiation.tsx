import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Check, Copy, Loader2, Sparkles, MapPin } from "lucide-react"
import { createInitiation } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Initiation() {
  const [step, setStep] = useState<"form" | "loading" | "success">("form")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    territory: "",
    signature: ""
  })
  const [error, setError] = useState<string | null>(null)
  const [rewardCode] = useState("TRIBE15")
  const [copied, setCopied] = useState(false)

  const territories = [
    { id: "Highlands", name: "The Highlands", description: "Northern Reach" },
    { id: "Urban Core", name: "The Urban Core", description: "Metropolis" },
    { id: "Coastlands", name: "The Coastlands", description: "Western Edge" },
    { id: "Midlands", name: "The Midlands", description: "Heartland" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStep("loading")

    try {
      const result = await createInitiation(formData)
      if (result.success) {
        setStep("success")
      } else {
        setError(result.error)
        setStep("form")
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Initiation failed. The tribe awaits.")
      setStep("form")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rewardCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="container max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-surface border border-border p-8 md:p-12 space-y-10"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold uppercase tracking-tight">The Initiation</h1>
                <p className="text-gray-500 tracking-[3px] uppercase text-[10px] font-bold">Seal your oath. Claim your territory.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Your Name / Alias</label>
                    <Input
                      required
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Messenger ID (Email)</label>
                    <Input
                      type="email"
                      required
                      placeholder="email@address.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Claim Your Territory</label>
                    <div className="grid grid-cols-2 gap-4">
                      {territories.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData({...formData, territory: t.id})}
                          className={`p-4 border text-left transition-all ${formData.territory === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-white'}`}
                        >
                          <MapPin className={`w-4 h-4 mb-2 ${formData.territory === t.id ? 'text-primary' : 'text-gray-600'}`} />
                          <p className="text-[10px] font-bold uppercase tracking-widest">{t.name}</p>
                          <p className="text-[8px] text-gray-600 uppercase tracking-widest">{t.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-black border-l-4 border-primary space-y-4">
                    <div className="flex gap-3 items-start">
                      <Check className="w-4 h-4 text-primary mt-1" />
                      <p className="text-xs text-gray-400 uppercase tracking-widest leading-relaxed">I pledge to be true to who I am, unapologetically.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <Check className="w-4 h-4 text-primary mt-1" />
                      <p className="text-xs text-gray-400 uppercase tracking-widest leading-relaxed">I will remain territorial over what is mine and my people.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">E-Signature (Type full name to seal)</label>
                    <Input
                      required
                      placeholder="Type name here"
                      value={formData.signature}
                      onChange={(e) => setFormData({...formData, signature: e.target.value})}
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">{error}</p>}

                <Button type="submit" className="w-full h-16 text-lg group">
                  Seal the Oath
                  <Shield className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
              </form>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
              <h2 className="text-2xl font-bold uppercase tracking-[5px]">Sealing the Oath...</h2>
              <p className="text-gray-500 uppercase tracking-widest text-xs">The tribe is verifying your claim.</p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface border border-primary p-12 text-center space-y-10"
            >
              <div className="w-20 h-20 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="text-primary w-10 h-10" />
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-bold uppercase tracking-tight">Initiation Complete</h2>
                <p className="text-gray-400 uppercase tracking-[3px] text-xs">Welcome to the {formData.territory} Territory, {formData.name}.</p>
              </div>

              <div className="p-8 bg-black border border-border space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[5px] text-primary">Your Tribal Reward</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-4xl font-bold tracking-[10px]">{rewardCode}</span>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-surface border border-border transition-all"
                  >
                    {copied ? <Check className="text-primary" /> : <Copy className="text-gray-500" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Use this code at checkout for 15% off your first gear.</p>
              </div>

              <Link to="/shop">
                <Button size="lg" className="w-full h-16">Enter the Shop</Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
