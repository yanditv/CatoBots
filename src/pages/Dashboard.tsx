import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, AlertTriangle, Target } from 'lucide-react'
import type { MatchState } from '../App'

interface MatchCardProps {
  match: MatchState;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex flex-col items-center relative overflow-hidden group shadow-xl shadow-neutral-200/40"
    >
      <div className="absolute top-0 right-0 p-6">
        {match.isActive && <div className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />}
      </div>

      <span className="text-[10px] font-black tracking-widest uppercase text-neutral-400 mb-6 px-4 py-1.5 bg-neutral-50 rounded-full border border-neutral-100">
        {match.category} • {match.id.slice(0, 8)}
      </span>

      <div className="grid grid-cols-3 w-full items-center gap-6 mb-8">
        {/* Left Side */}
        <div className="text-right">
          <h3 className="text-base font-black truncate text-black">{match.robotA?.name || '---'}</h3>
          <p className="text-sm font-bold text-neutral-400 truncate mt-0.5">{match.robotA?.institution || '---'}</p>
        </div>

        {/* Score */}
        <div className="flex justify-center items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.span 
              key={match.scoreA}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-black tabular-nums text-black"
            >
              {match.scoreA}
            </motion.span>
          </AnimatePresence>
          <div className="w-1 h-1 rounded-full bg-neutral-200" />
          <AnimatePresence mode="wait">
            <motion.span 
              key={match.scoreB}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-black tabular-nums text-black"
            >
              {match.scoreB}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Right Side */}
        <div className="text-left">
          <h3 className="text-base font-black truncate text-black">{match.robotB?.name || '---'}</h3>
          <p className="text-sm font-bold text-neutral-400 truncate mt-0.5">{match.robotB?.institution || '---'}</p>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-1.5 bg-neutral-50 rounded-full mb-6 overflow-hidden border border-neutral-100">
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${(match.timeLeft / 180) * 100}%` }}
          className={`h-full ${match.timeLeft < 30 ? 'bg-red-500' : 'bg-brand'}`}
        />
      </div>

      <div className="flex justify-between w-full items-center">
        <div className="flex gap-2">
          {match.penaltiesA.length > 0 && (
            <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
              <AlertTriangle size={10} className="text-red-500" />
              <span className="text-[9px] font-black text-red-500">{match.penaltiesA.length}</span>
            </div>
          )}
          {match.penaltiesB.length > 0 && (
            <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100">
              <AlertTriangle size={10} className="text-neutral-400" />
              <span className="text-[9px] font-black text-neutral-400">{match.penaltiesB.length}</span>
            </div>
          )}
        </div>
        <div className={`text-2xl font-black tabular-nums tracking-tight ${match.timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-neutral-300'}`}>
          {formatTime(match.timeLeft)}
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = ({ matches }: { matches: MatchState[] }) => {
  return (
    <div className="min-h-screen p-8 md:p-12 bg-neutral-50 text-black overflow-x-hidden">
      <header className="max-w-7xl mx-auto mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                <Target size={28} />
             </div>
             <span className="text-sm font-black uppercase tracking-widest text-neutral-400">En vivo</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase leading-none">
            Cato<span className="text-brand"> Bots</span>
          </h1>
          <p className="text-neutral-400 font-bold uppercase text-sm mt-6 bg-white border border-neutral-100 inline-block px-4 py-2 rounded-full">Sistema de seguimiento automatizado</p>
        </div>
        
        <div className="bg-white border border-neutral-100 px-8 py-5 rounded-[2rem] shadow-xl shadow-neutral-200/30 hidden lg:block">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-md flex justify-center py-2 font-black text-black leading-none">{matches.filter(m=>m.isActive).length}</span>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Peleas activas</span>
              </div>
            </div>
            <div className="w-px h-8 bg-neutral-100" />
            <div className="flex flex-col">
                <span className="text-md flex justify-center py-2 font-black text-black leading-none">{matches.length}</span>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Grilla total</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </AnimatePresence>
      </div>

      {matches.length === 0 && (
        <div className="max-w-7xl mx-auto py-40 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-12 rounded-[3rem] bg-white border border-neutral-100 shadow-xl shadow-neutral-200/50 mb-10"
          >
            <Trophy size={80} className="text-neutral-100" />
          </motion.div>
          <h2 className="text-3xl font-black text-black mb-4">La arena está vacía</h2>
          <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Esperando el inicio de la competencia</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
