import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Credenciales inválidas');

      const data = await response.json();
      login(data.token, data.role, data.username, data.id);
      navigate(data.role === 'ADMIN' ? '/admin' : '/referee');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white border border-neutral-100 rounded-[3rem] p-12 shadow-2xl shadow-neutral-200/60 relative overflow-hidden"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 flex items-center justify-center text-brand mb-6">
            <img src="/favicon.svg" alt="Logo" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-black mb-2">CatoBots IV</h1>
          <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Inicio de Sesión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-5">Usuario</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-4.5 pl-14 pr-6 focus:border-brand/30 outline-none transition-all placeholder:text-neutral-300 font-medium text-black"
                placeholder="Usuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-4.5 pl-14 pr-6 focus:border-brand/30 outline-none transition-all placeholder:text-neutral-300 font-medium text-black"
                placeholder="Contraseña"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-[11px] font-black text-center bg-red-50 py-3 rounded-2xl border border-red-100"
            >
              ACCESO DENEGADO: {error.toUpperCase()}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white font-black py-5 rounded-2xl shadow-xl shadow-brand/20 hover:shadow-brand/40 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}
          </motion.button>
        </form>

        <div className="mt-12 pt-8 border-t border-neutral-50 flex justify-center gap-4">
          <div className="w-2 h-2 rounded-full bg-neutral-400" />
          <div className="w-2 h-2 rounded-full bg-neutral-400" />
          <div className="w-2 h-2 rounded-full bg-neutral-400" />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
