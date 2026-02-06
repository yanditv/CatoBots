import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Plus, ShieldAlert, Timer } from 'lucide-react'
import type { MatchState } from '../App'

interface RefereeProps {
  match: MatchState;
  onControl: (action: string, payload?: any) => void;
}

const RefereeControl = ({ match, onControl }: RefereeProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ActionButton = ({ icon: Icon, label, onClick, color = 'bg-neutral-800', size = 'py-6' }: any) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative overflow-hidden ${size} px-4 rounded-3xl flex flex-col items-center justify-center gap-2 border border-white/5 active:border-white/20 transition-all ${color}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-bold uppercase tracking-wider opacity-60">{label}</span>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-black p-4 flex flex-col gap-4 max-w-lg mx-auto pb-12">
      <header className="p-6 rounded-[2rem] bg-neutral-900/50 border border-white/5 flex justify-between items-center mt-2">
        <div>
          <h1 className="text-xl font-black">REFEREE CONTROL</h1>
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest leading-none">Category: {match.category}</p>
        </div>
        <div className={`px-4 py-2 rounded-2xl font-mono text-3xl font-black tabular-nums border ${match.isActive ? 'bg-brand/10 border-brand/50 text-brand animate-pulse' : 'bg-neutral-800 border-white/10 text-neutral-400'}`}>
          {formatTime(match.timeLeft)}
        </div>
      </header>

      {/* Timer Controls */}
      <div className="grid grid-cols-3 gap-3">
        <ActionButton 
          icon={match.isActive ? Pause : Play} 
          label={match.isActive ? 'Pause' : 'Start'} 
          color={match.isActive ? 'bg-orange-500/20 text-orange-500' : 'bg-brand/20 text-brand'}
          onClick={() => onControl(match.isActive ? 'PAUSE' : 'START')}
        />
        <ActionButton 
          icon={Timer} 
          label="+30s" 
          onClick={() => onControl('ADD_TIME', 30)}
        />
        <ActionButton 
          icon={RotateCcw} 
          label="Reset" 
          color="bg-red-500/10 text-red-500"
          onClick={() => {
            if(confirm('Are you sure you want to reset the match?')) onControl('RESET');
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 mt-2">
        {/* Side A Control */}
        <div className="flex flex-col gap-3">
          <div className="p-5 rounded-[2rem] bg-neutral-900/40 border border-brand/20 text-center">
            <h2 className="text-lg font-bold text-brand truncate">{match.robotA?.name}</h2>
            <div className="text-6xl font-black my-2">{match.scoreA}</div>
            <p className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Institution: {match.robotA?.institution}</p>
          </div>
          <ActionButton 
            icon={Plus} 
            label="Point" 
            size="py-10"
            color="bg-brand text-black"
            onClick={() => onControl('ADD_SCORE_A')}
          />
          <ActionButton 
            icon={ShieldAlert} 
            label="Penalty" 
            color="bg-neutral-900 text-red-500"
            onClick={() => {
              const p = prompt('Penalty reason?');
              if(p) onControl('ADD_PENALTY_A', p);
            }}
          />
        </div>

        {/* Side B Control */}
        <div className="flex flex-col gap-3">
          <div className="p-5 rounded-[2rem] bg-neutral-900/40 border border-purple-500/20 text-center">
            <h2 className="text-lg font-bold text-purple-500 truncate">{match.robotB?.name}</h2>
            <div className="text-6xl font-black my-2">{match.scoreB}</div>
            <p className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">Institution: {match.robotB?.institution}</p>
          </div>
          <ActionButton 
            icon={Plus} 
            label="Point" 
            size="py-10"
            color="bg-purple-500 text-black"
            onClick={() => onControl('ADD_SCORE_B')}
          />
          <ActionButton 
            icon={ShieldAlert} 
            label="Penalty" 
            color="bg-neutral-900 text-red-500"
            onClick={() => {
              const p = prompt('Penalty reason?');
              if(p) onControl('ADD_PENALTY_B', p);
            }}
          />
        </div>
      </div>

      <footer className="mt-auto pt-4 text-center">
        <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Connected to Match ID: {match.id}</p>
      </footer>
    </div>
  );
};

export default RefereeControl;
