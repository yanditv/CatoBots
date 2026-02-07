import { motion } from 'framer-motion'
import { UserPlus, Bot, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

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
    <div className="min-h-screen bg-neutral-50 p-6 flex items-center justify-center">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-white border border-neutral-100 p-12 rounded-[3rem] shadow-2xl shadow-neutral-200/60"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <UserPlus size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-black">Registro</h1>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mt-1">Inscribe tu robot</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 px-2">Nombre de la Institución</label>
            <input 
              required
              type="text" 
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
              placeholder="ej. Instituto Tecnológico"
              className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 focus:border-brand/30 outline-none transition-all placeholder:text-neutral-300 font-medium text-black"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 px-2">Nombre del Robot</label>
            <div className="relative">
              <Bot className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
              <input 
                required
                type="text" 
                value={formData.robotName}
                onChange={(e) => setFormData({...formData, robotName: e.target.value})}
                placeholder="ej. Iron Clad"
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 pl-14 focus:border-brand/30 outline-none transition-all placeholder:text-neutral-300 font-medium text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 px-2">Categoría de Competencia</label>
            <div className="relative">
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 appearance-none focus:border-brand/30 outline-none transition-all text-sm font-medium text-black"
              >
                <option value="Heavyweight">Heavyweight</option>
                <option value="Lightweight">Lightweight</option>
                <option value="Mini-Sumo">Mini-Sumo</option>
              </select>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-6 bg-brand text-white font-black rounded-2.5xl flex items-center justify-center gap-3 shadow-xl shadow-brand/20 hover:shadow-brand/40 transition-all text-xs uppercase tracking-[0.2em]"
          >
            <ShieldCheck className="w-5 h-5" />
            REGISTRAR COMPETIDOR
          </motion.button>
        </form>

        <p className="mt-12 text-center text-[10px] text-neutral-300 font-black uppercase tracking-[0.3em]">
          Solo personal autorizado
        </p>
      </motion.div>
    </div>
  );
};

export default Registration;
