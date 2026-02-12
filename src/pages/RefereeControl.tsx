import { useState } from 'react';
import { Play, Pause, RotateCcw, Plus, ShieldAlert, Timer, Trophy, ChevronLeft, Target, LogOut } from 'lucide-react';
import type { MatchState } from '../App';
import { useAuth } from '../context/AuthContext';

interface RefereeControlProps {
  matches: MatchState[];
  onControl: (matchId: string, action: string, payload?: any) => void;
}

const ActionButton = ({ icon: Icon, label, onClick, color = 'bg-white', textColor = 'text-black', size = 'py-6' }: any) => (
  <button 
    onClick={onClick}
    className={`${color} ${textColor} w-full ${size} rounded-[2rem] border border-neutral-100 shadow-lg shadow-neutral-200/40 font-bold uppercase text-sm flex flex-col items-center justify-center gap-3 active:scale-95 transition-all hover:shadow-xl`}
  >
    <Icon size={24} />
    {label}
  </button>
);

const RefereeControl = ({ matches, onControl }: RefereeControlProps) => {
  const { user, logout } = useAuth();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const myMatches = matches.filter(m => m.refereeId === user?.id);
  const selectedMatch = myMatches.find(m => m.id === selectedMatchId);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedMatch) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8 flex flex-col">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
                <Target size={24} />
             </div>
             <div>
                <h1 className="text-2xl text-neutral-500 font-black tracking-tight">CONTROL <span className="text-brand">ÁRBITRO</span></h1>
                <p className="text-sm font-black text-neutral-400 uppercase">Panel de Operaciones</p>
             </div>
          </div>
          <button onClick={logout} className="p-4 bg-white rounded-2xl border border-neutral-100 text-red-500 shadow-sm hover:shadow-md transition-all">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 max-w-2xl mx-auto w-full">
          <h2 className="text-md font-black text-neutral-400 uppercase mb-6 px-4">Encuentros Asignados</h2>
          <div className="grid gap-4">
            {myMatches.length > 0 ? myMatches.map(m => (
              <button 
                key={m.id}
                onClick={() => setSelectedMatchId(m.id)}
                className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg shadow-neutral-200/40 hover:scale-[1.02] transition-all group active:scale-95"
              >
                <div className="text-left">
                  <span className="text-sm font-black text-brand uppercase mb-2 block">{m.category} | {m.round}</span>
                  <p className="text-2xl font-black text-black group-hover:text-brand transition-colors">
                    {m.robotA?.name || '---'} vs {m.robotB?.name || '---'}
                  </p>
                </div>
                <ChevronLeft size={24} className="rotate-180 text-neutral-200 group-hover:text-brand transition-colors" />
              </button>
            )) : (
              <div className="p-12 text-center bg-white rounded-[3rem] border border-neutral-100 shadow-sm">
                <p className="text-neutral-400 font-bold">No tienes encuentros asignados para hoy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 flex flex-col max-w-3xl mx-auto">
      <header className="mb-8">
        <button onClick={() => setSelectedMatchId(null)} className="flex items-center gap-2 text-neutral-400 font-black text-sm uppercase mb-6 hover:text-black transition-colors">
          <ChevronLeft size={16} /> Volver a la lista
        </button>
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-4xl text-neutral-500 font-black uppercase">{selectedMatch.category}</h1>
          <span className="bg-brand text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedMatch.round}</span>
        </div>
        <div className={`w-full py-8 rounded-[2rem] font-mono text-7xl font-black text-center tabular-nums border shadow-inner ${selectedMatch.isActive ? 'bg-brand/5 border-brand/20 text-brand' : 'bg-neutral-50 border-neutral-100 text-neutral-400'}`}>
          {formatTime(selectedMatch.timeLeft)}
        </div>
      </header>

      {/* Timer Controls */}
      <div className="grid grid-cols-3 gap-4 mb-4">
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
            <h2 className="text-md font-black text-brand uppercase truncate px-2">{selectedMatch.robotA?.name}</h2>
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
            onClick={() => onControl(selectedMatch.id, 'ADD_PENALTY_A')}
          />
        </div>

        {/* Side B Control */}
        <div className="flex flex-col gap-4">
          <div className="p-6 rounded-[2.5rem] bg-white border border-neutral-100 text-center shadow-lg shadow-neutral-200/40 relative overflow-hidden">
            <h2 className="text-md font-black text-neutral-400 uppercase truncate px-2">{selectedMatch.robotB?.name}</h2>
            <div className="text-7xl font-black my-4 text-black">{selectedMatch.scoreB}</div>
          </div>
          <ActionButton 
            icon={Plus} 
            label="Punto" 
            size="py-12"
            color="bg-neutral-100"
            onClick={() => onControl(selectedMatch.id, 'ADD_SCORE_B')}
          />
          <ActionButton 
            icon={ShieldAlert} 
            label="Falta" 
            textColor="text-red-500"
            onClick={() => onControl(selectedMatch.id, 'ADD_PENALTY_B')}
          />
        </div>
      </div>

      {/* Finishing Status */}
      <div className="mt-8">
        {!selectedMatch.isFinished ? (
          <button 
            onClick={() => {
              if (confirm('¿Finalizar encuentro y declarar ganador?')) onControl(selectedMatch.id, 'FINISH');
            }}
            className="w-full bg-black text-white py-8 rounded-[2rem] font-black uppercase shadow-2xl shadow-black/20 hover:bg-neutral-900 transition-all flex items-center justify-center gap-4 active:scale-95"
          >
            <Trophy size={24} className="text-brand" />
            Finalizar Encuentro
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-brand text-white p-8 rounded-[2rem] text-center font-black uppercase shadow-xl shadow-brand/20">
              <Trophy size={32} className="mx-auto mb-4" />
              ¡Encuentro Terminado!
            </div>
            <button 
              onClick={() => onControl(selectedMatch.id, 'UNFINISH')}
              className="w-full bg-white border border-neutral-100 text-red-500 py-6 rounded-[2rem] font-black uppercase text-sm active:scale-95"
            >
              Anular Finalización
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefereeControl;
