import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Plus, ShieldAlert, Timer, ChevronLeft, Target, LogOut } from 'lucide-react';
import type { MatchState } from '../App';
import { useAuth } from '../context/AuthContext';

interface RefereeProps {
  matches: MatchState[];
  onControl: (matchId: string, action: string, payload?: any) => void;
}

const RefereeControl = ({ matches, onControl }: RefereeProps) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { logout, user } = useAuth();
  
  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ActionButton = ({ icon: Icon, label, onClick, color = 'bg-white', textColor = 'text-neutral-500', size = 'py-6' }: any) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative overflow-hidden ${size} px-4 rounded-[2rem] flex flex-col items-center justify-center gap-2 border border-neutral-100 shadow-sm active:shadow-inner transition-all ${color} ${textColor}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">{label}</span>
    </motion.button>
  );

  if (!selectedMatchId) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6 flex flex-col gap-8 max-w-lg mx-auto">
        <header className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-4xl font-black text-black uppercase">Operaciones</h1>
            <p className="text-xs text-neutral-400 font-bold uppercase mt-1">Operador: {user?.username}</p>
          </div>
          <button onClick={logout} className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 shadow-xl shadow-red-500/5">
            <LogOut size={20} />
          </button>
        </header>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                <Target size={18} />
             </div>
             <h2 className="text-sm font-black uppercase text-neutral-400">Seleccionar Arena Activa</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {matches.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMatchId(m.id)}
                className="bg-white border border-neutral-100 p-6 rounded-[2.5rem] text-left hover:border-brand/30 transition-all flex justify-between items-center shadow-lg shadow-neutral-200/40 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black text-brand uppercase bg-brand/5 px-3 py-1 rounded-lg border border-brand/10">{m.category}</span>
                    {m.isActive && <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />}
                  </div>
                  <h3 className="font-black text-xl text-black group-hover:text-brand transition-colors">{m.robotA?.name} <span className="text-neutral-400 font-medium">vs</span> {m.robotB?.name}</h3>
                </div>
                <div className="text-sm font-bold text-neutral-400">#{m.id.slice(0, 4)}</div>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (!selectedMatch) return null;

  return (
    <div className="min-h-screen bg-neutral-50 p-6 flex flex-col gap-6 max-w-lg mx-auto pb-16">
      <header className="p-8 rounded-[3rem] bg-white border border-neutral-100 flex flex-col gap-6 mt-4 shadow-xl shadow-neutral-200/50">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedMatchId(null)}
            className="p-3 bg-neutral-50 rounded-2xl text-neutral-400 border border-neutral-100"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-right">
             <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest leading-none mb-2">{selectedMatch.category}</p>
             <h1 className="text-2xl font-black text-black">CONTROL DE ARENA</h1>
          </div>
        </div>
        <div className={`w-full py-8 rounded-[2rem] font-mono text-7xl font-black text-center tabular-nums border shadow-inner ${selectedMatch.isActive ? 'bg-brand/5 border-brand/20 text-brand' : 'bg-neutral-50 border-neutral-100 text-neutral-300'}`}>
          {formatTime(selectedMatch.timeLeft)}
        </div>
      </header>

      {/* Timer Controls */}
      <div className="grid grid-cols-3 gap-4">
        <ActionButton 
          icon={selectedMatch.isActive ? Pause : Play} 
          label={selectedMatch.isActive ? 'Pausar' : 'Iniciar'} 
          color={selectedMatch.isActive ? 'bg-orange-500 text-white' : 'bg-brand text-white'}
          textColor="text-white"
          onClick={() => onControl(selectedMatch.id, selectedMatch.isActive ? 'PAUSE' : 'START')}
        />
        <ActionButton 
          icon={Timer} 
          label="+30 Seg" 
          onClick={() => onControl(selectedMatch.id, 'ADD_TIME', 30)}
        />
        <ActionButton 
          icon={RotateCcw} 
          label="Reiniciar" 
          color="bg-white"
          textColor="text-red-500"
          onClick={() => {
            if(confirm('¿Reiniciar encuentro? Todos los puntajes volverán a cero.')) onControl(selectedMatch.id, 'RESET');
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Side A Control */}
        <div className="flex flex-col gap-4">
          <div className="p-6 rounded-[2.5rem] bg-white border border-brand/10 text-center shadow-lg shadow-brand/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand/10" />
            <h2 className="text-xs font-black text-brand uppercase tracking-widest truncate px-2">{selectedMatch.robotA?.name}</h2>
            <div className="text-7xl font-black my-4 text-black">{selectedMatch.scoreA}</div>
          </div>
          <ActionButton 
            icon={Plus} 
            label="Punto" 
            size="py-12"
            color="bg-black text-white"
            textColor="text-white"
            onClick={() => onControl(selectedMatch.id, 'ADD_SCORE_A')}
          />
          <ActionButton 
            icon={ShieldAlert} 
            label="Falta" 
            textColor="text-red-500"
            onClick={() => {
              const p = prompt('¿Razón de la penalización?');
              if(p) onControl(selectedMatch.id, 'ADD_PENALTY_A', p);
            }}
          />
        </div>

        {/* Side B Control */}
        <div className="flex flex-col gap-4">
          <div className="p-6 rounded-[2.5rem] bg-white border border-neutral-200 text-center shadow-lg shadow-neutral-200/30 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-neutral-100" />
            <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest truncate px-2">{selectedMatch.robotB?.name}</h2>
            <div className="text-7xl font-black my-4 text-black">{selectedMatch.scoreB}</div>
          </div>
          <ActionButton 
            icon={Plus} 
            label="Punto" 
            size="py-12"
            color="bg-white text-black"
            textColor="text-black"
            onClick={() => onControl(selectedMatch.id, 'ADD_SCORE_B')}
          />
          <ActionButton 
            icon={ShieldAlert} 
            label="Falta" 
            textColor="text-red-500"
            onClick={() => {
              const p = prompt('¿Razón de la penalización?');
              if(p) onControl(selectedMatch.id, 'ADD_PENALTY_B', p);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RefereeControl;
