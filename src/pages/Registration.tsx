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
    alert(`Registered: ${formData.robotName} from ${formData.institution} in ${formData.category}`);
    // In a real app, this would hit the backend API
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-6 flex items-center justify-center">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-neutral-900/50 border border-white/5 p-8 rounded-[3rem] backdrop-blur-xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center text-brand">
            <UserPlus />
          </div>
          <div>
            <h1 className="text-2xl font-black">Registration</h1>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Enroll your robot</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 px-2">Institution Name</label>
            <input 
              required
              type="text" 
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
              placeholder="e.g. Robotics Institute"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-brand/50 outline-none transition-all placeholder:text-neutral-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 px-2">Robot Name</label>
            <div className="relative">
              <Bot className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-700" />
              <input 
                required
                type="text" 
                value={formData.robotName}
                onChange={(e) => setFormData({...formData, robotName: e.target.value})}
                placeholder="e.g. Iron Clad"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 focus:border-brand/50 outline-none transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2 px-2">Competition Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-brand/50 outline-none transition-all appearance-none"
            >
              <option value="Heavyweight">Heavyweight</option>
              <option value="Lightweight">Lightweight</option>
              <option value="Mini-Sumo">Mini-Sumo</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-brand text-black font-black rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(34,211,238,0.3)]"
          >
            <ShieldCheck className="w-5 h-5" />
            REGISTER COMPETITOR
          </motion.button>
        </form>

        <p className="mt-8 text-center text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
          Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
};

export default Registration;
