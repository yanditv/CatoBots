import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Terminal, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { username, password });

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
    <div className="min-h-screen bg-cb-green-vibrant bg-noise flex items-center justify-center p-4">
      {/* Decorativo cinta de peligro */}
      <div className="absolute top-20 -left-4 w-[110%] h-6 bg-warning-tape -rotate-1 border-y-2 border-cb-black-pure z-0 shadow-block-sm" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-cb-white-tech border-4 border-cb-black-pure p-8 shadow-block-lg relative"
      >
        {/* Warning tape */}
        <div className="absolute top-0 right-0 w-full h-3 bg-warning-tape -translate-y-full" />

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 flex items-center justify-center mb-4">
            <img src="/logo-yellow.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[4px_4px_0_#000]" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="text-cb-yellow-neon" size={20} />
            <p className="text-cb-black-pure font-tech font-black uppercase text-2xl tracking-wider">Acceso Sistema</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-tech font-black uppercase tracking-widest text-cb-black-pure ml-1">Operador</label>
            <div className="relative group">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-cb-black-pure flex items-center justify-center border-r-3 border-cb-black-pure group-focus-within:bg-cb-yellow-neon transition-colors z-10">
                <User className="w-5 h-5 text-cb-white-tech group-focus-within:text-cb-black-pure" />
              </div>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-cb-gray-industrial border-3 border-cb-black-pure rounded-none py-3 pl-14 pr-4 text-cb-yellow-neon font-tech text-base focus:outline-none focus:ring-3 focus:ring-cb-yellow-neon focus:border-cb-black-pure placeholder:text-neutral-500 transition-all shadow-block-sm"
                placeholder="Usuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-tech font-black uppercase tracking-widest text-cb-black-pure ml-1">Clave de Seguridad</label>
            <div className="relative group">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-cb-black-pure flex items-center justify-center border-r-3 border-cb-black-pure group-focus-within:bg-cb-yellow-neon transition-colors z-10">
                <Lock className="w-5 h-5 text-cb-white-tech group-focus-within:text-cb-black-pure" />
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cb-gray-industrial border-3 border-cb-black-pure rounded-none py-3 pl-14 pr-14 text-cb-yellow-neon font-tech text-base focus:outline-none focus:ring-3 focus:ring-cb-yellow-neon focus:border-cb-black-pure placeholder:text-neutral-500 transition-all shadow-block-sm"
                placeholder="Contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cb-black-pure hover:text-cb-yellow-neon transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-cb-black-pure text-xs font-tech font-bold text-center bg-red-500 text-white py-3 border-3 border-cb-black-pure uppercase"
            >
              ⚠️ ERROR: {error.toUpperCase()}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-cb-yellow-neon text-cb-black-pure font-tech font-black py-4 border-3 border-cb-black-pure shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">VERIFICANDO...</span>
            ) : (
              <>INICIAR OPERACIÓN <ShieldCheck size={20} /></>
            )}
          </motion.button>
        </form>

        {/* Footer decorativo */}
        <div className="mt-6 pt-4 border-t-3 border-cb-black-pure flex justify-center gap-2">
          <div className="w-3 h-3 bg-cb-black-pure" />
          <div className="w-3 h-3 bg-cb-yellow-neon" />
          <div className="w-3 h-3 bg-cb-black-pure" />
        </div>

        {/* Volver al inicio */}
        <Link 
          to="/" 
          className="absolute -top-3 -left-3 flex items-center gap-1 px-3 py-2 bg-cb-black-pure text-cb-white-tech font-tech text-xs font-bold uppercase border-2 border-cb-yellow-neon hover:bg-cb-yellow-neon hover:text-cb-black-pure transition-colors"
        >
          <ArrowLeft size={14} /> Volver
        </Link>
      </motion.div>
    </div>
  );
};

export default Login;
