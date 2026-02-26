import { motion } from 'framer-motion'
import { Bot, ShieldCheck, ArrowLeft, Terminal } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Registration = () => {
  const [formData, setFormData] = useState({
    institution: '',
    robotName: '',
    category: 'Heavyweight'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Registrado: ${formData.robotName} de ${formData.institution} en ${formData.category}`);
  };

  return (
    <div className="min-h-screen bg-cb-green-vibrant bg-noise text-cb-black-pure font-sans overflow-hidden flex flex-col items-center">
      
      {/* Minimal Header */}
      <header className="w-full bg-cb-black-pure border-b-3 border-cb-yellow-neon shadow-block-sm py-2 px-4 flex justify-between items-center z-50">
          <Link to="/" className="flex items-center gap-2 text-cb-white-tech font-tech uppercase tracking-widest text-xs hover:text-cb-yellow-neon transition-colors">
              <ArrowLeft size={16} /> Abortar Enlace
          </Link>
          <div className="flex items-center gap-2">
              <span className="font-tech text-sm italic tracking-widest text-cb-white-tech">CatoBots <span className="text-cb-yellow-neon">IV</span></span>
          </div>
      </header>

      {/* Main Aggressive Container */}
      <main className="flex-1 w-full max-w-3xl px-3 py-4 flex items-center justify-center relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          className="w-full bg-cb-white-tech border-4 border-cb-black-pure p-5 shadow-block-lg relative rotate-[1deg]"
        >
          {/* Warning Tape Accents */}
          <div className="absolute top-0 right-0 w-full h-3 bg-warning-tape -translate-y-full" />

          {/* Form Header */}
          <div className="flex items-center gap-3 mb-4 border-b-4 border-cb-black-pure pb-3">
            <div className="w-12 h-12 bg-cb-black-pure flex items-center justify-center text-cb-yellow-neon border-3 border-cb-black-pure shadow-block-sm rotate-[-3deg] shrink-0">
              <Terminal size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-tech font-black text-cb-black-pure uppercase tracking-widest drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">
                Registro Oficial
              </h1>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-cb-black-pure text-cb-yellow-neon text-xs font-tech tracking-[0.2em] shadow-block-sm uppercase">
                  <span className="w-2 h-2 bg-cb-yellow-neuron animate-pulse" />
                  Terminal En Línea
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fila 1: Institution + Robot Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black font-tech uppercase tracking-widest text-cb-black-pure mb-1">Entidad / Institución</label>
                <div className="relative group">
                  <input 
                    required
                    type="text" 
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    placeholder="Universidad..."
                    className="w-full bg-cb-gray-industrial border-3 border-cb-black-pure rounded-none p-3 text-cb-yellow-neon font-tech text-sm focus:outline-none focus:ring-3 focus:ring-cb-yellow-neon focus:border-cb-black-pure placeholder:text-neutral-600 transition-all shadow-block-sm group-hover:-translate-y-0.5 group-focus-within:-translate-y-0.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black font-tech uppercase tracking-widest text-cb-black-pure mb-1">Designación del Robot</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-cb-black-pure flex items-center justify-center border-r-3 border-cb-black-pure group-focus-within:bg-cb-yellow-neon transition-colors z-10">
                    <Bot className="w-5 h-5 text-cb-white-tech group-focus-within:text-cb-black-pure" />
                  </div>
                  <input 
                    required
                    type="text" 
                    value={formData.robotName}
                    onChange={(e) => setFormData({...formData, robotName: e.target.value})}
                    placeholder="ej. IRON CLAD"
                    className="w-full bg-cb-gray-industrial border-3 border-cb-black-pure rounded-none py-3 px-3 pl-12 text-cb-yellow-neon font-tech text-base focus:outline-none focus:ring-3 focus:ring-cb-yellow-neon focus:border-cb-black-pure placeholder:text-neutral-600 transition-all shadow-block-sm uppercase group-hover:-translate-y-0.5 group-focus-within:-translate-y-0.5 relative"
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Category (ancho completo) */}
            <div>
              <label className="block text-xs font-black font-tech uppercase tracking-widest text-cb-black-pure mb-1">Clase / Peso Autorizado</label>
              <div className="relative group">
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-cb-gray-industrial border-3 border-cb-black-pure rounded-none p-3 text-cb-white-tech font-tech text-sm appearance-none focus:outline-none focus:ring-3 focus:ring-cb-yellow-neon focus:border-cb-black-pure transition-all shadow-block-sm cursor-pointer group-hover:-translate-y-0.5 group-focus-within:-translate-y-0.5"
                >
                  <option value="Heavyweight" className="bg-cb-black-pure text-cb-yellow-neon font-tech">HEAVYWEIGHT (60 lb)</option>
                  <option value="Lightweight" className="bg-cb-black-pure text-cb-yellow-neon font-tech">LIGHTWEIGHT (30 lb)</option>
                  <option value="Mini-Sumo" className="bg-cb-black-pure text-cb-yellow-neon font-tech">MINI-SUMO (500g)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-cb-yellow-neon"></div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-cb-yellow-neon text-cb-black-pure px-6 py-3 border-3 border-cb-black-pure font-tech text-lg uppercase tracking-widest font-extrabold transition-all duration-100 shadow-[4px_4px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none focus:outline-none focus:ring-3 focus:ring-cb-black-pure active:scale-95 flex items-center justify-center gap-3"
              >
                REGISTRO IDENTIFICADO <ShieldCheck size={22} strokeWidth={2.5} />
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-cb-black-pure font-black font-tech uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <span className="w-3 h-1 bg-cb-black-pure inline-block animate-pulse"></span>
            ACCESO SOLO PERSONAL AUTORIZADO
            <span className="w-3 h-1 bg-cb-black-pure inline-block animate-pulse"></span>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Registration;
