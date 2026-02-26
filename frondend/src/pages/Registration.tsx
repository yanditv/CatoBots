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
      <header className="w-full bg-cb-black-pure border-b-4 border-cb-yellow-neon shadow-block-sm py-4 px-6 flex justify-between items-center z-50">
          <Link to="/" className="flex items-center gap-2 text-cb-white-tech font-tech uppercase tracking-widest text-sm hover:text-cb-yellow-neon transition-colors">
              <ArrowLeft size={20} /> Abortar Enlace
          </Link>
          <div className="flex items-center gap-3">
              <span className="font-tech text-lg italic tracking-widest text-cb-white-tech">CatoBots <span className="text-cb-yellow-neon">IV</span></span>
          </div>
      </header>

      {/* Main Aggressive Container */}
      <main className="flex-1 w-full max-w-2xl px-4 py-12 flex items-center justify-center relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          className="w-full bg-cb-white-tech border-8 border-cb-black-pure p-8 md:p-12 shadow-block-lg relative rotate-[1deg]"
        >
          {/* Warning Tape Accents */}
          <div className="absolute top-0 right-0 w-full h-4 bg-warning-tape -translate-y-full" />
          <div className="absolute -left-6 top-8 bottom-8 w-2 bg-cb-black-pure" />
          <div className="absolute -right-6 top-8 bottom-8 w-2 bg-cb-black-pure" />

          {/* Form Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-10 text-center md:text-left border-b-4 border-cb-black-pure pb-8">
            <div className="w-20 h-20 bg-cb-black-pure flex items-center justify-center text-cb-yellow-neon border-4 border-cb-black-pure shadow-block-sm rotate-[-3deg] shrink-0">
              <Terminal size={40} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl font-tech font-black text-cb-black-pure uppercase tracking-widest drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">
                Registro Oficial
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cb-black-pure text-cb-yellow-neon text-xs font-tech tracking-[0.2em] mt-2 shadow-block-sm uppercase self-center md:self-start">
                  <span className="w-2 h-2 bg-cb-yellow-neuron animate-pulse" />
                  Terminal En Línea
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Institution Input */}
            <div>
              <label className="block text-xs font-black font-tech uppercase tracking-widest text-cb-black-pure mb-2">Entidad / Institución Representante</label>
              <div className="relative group">
                <input 
                  required
                  type="text" 
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  placeholder="ej. Universidad Autónoma"
                  className="w-full bg-cb-gray-industrial border-4 border-cb-black-pure rounded-none p-4 text-cb-yellow-neon font-tech text-lg focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon focus:border-cb-black-pure placeholder:text-neutral-600 transition-all shadow-block-sm group-hover:-translate-y-1 group-focus-within:-translate-y-1"
                />
              </div>
            </div>

            {/* Robot Name Input */}
            <div>
              <label className="block text-xs font-black font-tech uppercase tracking-widest text-cb-black-pure mb-2">Designación del Robot</label>
              <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 w-14 bg-cb-black-pure flex items-center justify-center border-r-4 border-cb-black-pure group-focus-within:bg-cb-yellow-neon transition-colors z-10">
                  <Bot className="w-6 h-6 text-cb-white-tech group-focus-within:text-cb-black-pure" />
                </div>
                <input 
                  required
                  type="text" 
                  value={formData.robotName}
                  onChange={(e) => setFormData({...formData, robotName: e.target.value})}
                  placeholder="ej. IRON CLAD"
                  className="w-full bg-cb-gray-industrial border-4 border-cb-black-pure rounded-none py-4 px-4 pl-18 text-cb-yellow-neon font-tech text-xl focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon focus:border-cb-black-pure placeholder:text-neutral-600 transition-all shadow-block-sm uppercase group-hover:-translate-y-1 group-focus-within:-translate-y-1 relative"
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-black font-tech uppercase tracking-widest text-cb-black-pure mb-2">Clase / Peso Autorizado</label>
              <div className="relative group">
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-cb-gray-industrial border-4 border-cb-black-pure rounded-none p-4 text-cb-white-tech font-tech text-lg appearance-none focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon focus:border-cb-black-pure transition-all shadow-block-sm cursor-pointer group-hover:-translate-y-1 group-focus-within:-translate-y-1"
                >
                  <option value="Heavyweight" className="bg-cb-black-pure text-cb-yellow-neon font-tech">HEAVYWEIGHT (60 lb)</option>
                  <option value="Lightweight" className="bg-cb-black-pure text-cb-yellow-neon font-tech">LIGHTWEIGHT (30 lb)</option>
                  <option value="Mini-Sumo" className="bg-cb-black-pure text-cb-yellow-neon font-tech">MINI-SUMO (500g)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-transparent border-t-cb-yellow-neon"></div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-cb-yellow-neon text-cb-black-pure px-8 py-5 border-4 border-cb-black-pure font-tech text-xl uppercase tracking-widest font-extrabold transition-all duration-100 shadow-[6px_6px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none focus:outline-none focus:ring-4 focus:ring-cb-black-pure active:scale-95 flex items-center justify-center gap-4"
              >
                REGISTRO IDENTIFICADO <ShieldCheck size={28} strokeWidth={2.5} />
              </button>
            </div>
          </form>

          <p className="mt-12 text-center text-xs text-cb-black-pure font-black font-tech uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span className="w-4 h-1 bg-cb-black-pure inline-block animate-pulse"></span>
            ACCESO SOLO PERSONAL AUTORIZADO
            <span className="w-4 h-1 bg-cb-black-pure inline-block animate-pulse"></span>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Registration;
