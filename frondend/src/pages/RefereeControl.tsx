import { useEffect, useMemo, useState, type ElementType } from 'react';
import { Play, Pause, RotateCcw, Plus, ShieldAlert, Timer, Trophy, ChevronLeft, LogOut, Terminal, Clock3, Swords, AlertTriangle, CircleCheckBig } from 'lucide-react';
import type { MatchState } from '../App';
import { useAuth } from '../context/AuthContext';

interface RefereeControlProps {
  matches: MatchState[];
  onControl: (matchId: string, action: string, payload?: any) => void;
}

type MatchVisualStatus = 'LIVE' | 'READY' | 'PENDING' | 'FINISHED';

const getMatchVisualStatus = (match: MatchState): MatchVisualStatus => {
  if (match.isFinished) return 'FINISHED';
  if (match.isActive) return 'LIVE';
  if (match.robotA && match.robotB) return 'READY';
  return 'PENDING';
};

const statusConfig: Record<MatchVisualStatus, { label: string; className: string }> = {
  LIVE: { label: 'En competencia', className: 'bg-red-600 text-white border-red-800' },
  READY: { label: 'Listo para iniciar', className: 'bg-cb-yellow-neon text-cb-black-pure border-cb-black-pure' },
  PENDING: { label: 'Pendiente competidores', className: 'bg-neutral-300 text-cb-black-pure border-cb-black-pure' },
  FINISHED: { label: 'Finalizado', className: 'bg-cb-black-pure text-cb-yellow-neon border-cb-black-pure' },
};

const normalizePhaseKey = (round?: string | null) => {
  const value = (round || '').trim().toLowerCase();
  if (!value) return 'sin-fase';
  if (value.includes('oct')) return 'octavos';
  if (value.includes('quart') || value.includes('cuart') || value.includes('quarter')) return 'quarters';
  if (value.includes('semi')) return 'semis';
  if (value.includes('final')) return 'final';
  return value;
};

const phaseLabel: Record<string, string> = {
  octavos: 'Octavos',
  quarters: 'Quarters',
  semis: 'Semis',
  final: 'Final',
  'sin-fase': 'Sin Fase',
};

const phaseOrder = ['octavos', 'quarters', 'semis', 'final', 'sin-fase'];

interface ActionButtonProps {
  icon: ElementType;
  label: string;
  onClick: () => void;
  color?: string;
  textColor?: string;
  size?: string;
  disabled?: boolean;
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  color = 'bg-cb-white-tech',
  textColor = 'text-cb-black-pure',
  size = 'py-5',
  disabled = false
}: ActionButtonProps) => (
  <button 
    disabled={disabled}
    onClick={onClick}
    className={`${color} ${textColor} w-full ${size} rounded-none border-3 border-cb-black-pure font-tech font-black uppercase text-xs md:text-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-all duration-150 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
  >
    <Icon size={22} strokeWidth={2.5} />
    {label}
  </button>
);

const RefereeControl = ({ matches, onControl }: RefereeControlProps) => {
  const { user, logout } = useAuth();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  const myMatches = useMemo(
    () => matches.filter(m => m.refereeId === user?.id),
    [matches, user?.id]
  );
  const groupedMatches = useMemo(() => {
    const groups = new Map<string, MatchState[]>();
    myMatches.forEach((match) => {
      const key = normalizePhaseKey(match.round);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(match);
    });

    const sortByStatus = (a: MatchState, b: MatchState) =>
      Number(b.isActive) - Number(a.isActive) ||
      Number(a.isFinished) - Number(b.isFinished) ||
      a.timeLeft - b.timeLeft;

    return [...groups.entries()]
      .sort((a, b) => {
        const indexA = phaseOrder.indexOf(a[0]);
        const indexB = phaseOrder.indexOf(b[0]);
        const safeA = indexA === -1 ? 999 : indexA;
        const safeB = indexB === -1 ? 999 : indexB;
        return safeA - safeB || a[0].localeCompare(b[0]);
      })
      .map(([phase, phaseMatches]) => ({
        phase,
        label: phaseLabel[phase] || phase.toUpperCase(),
        matches: [...phaseMatches].sort(sortByStatus),
      }));
  }, [myMatches]);
  const filteredGroups = useMemo(
    () => (phaseFilter === 'all' ? groupedMatches : groupedMatches.filter(group => group.phase === phaseFilter)),
    [groupedMatches, phaseFilter]
  );

  useEffect(() => {
    if (phaseFilter !== 'all' && !groupedMatches.some(group => group.phase === phaseFilter)) {
      setPhaseFilter('all');
    }
  }, [groupedMatches, phaseFilter]);
  // Mantener el encuentro seleccionado incluso si cambió de estado/asignación
  const allAssignedMatches = matches.filter(m => m.refereeId === user?.id || (selectedMatchId && m.id === selectedMatchId));
  const selectedMatch = allAssignedMatches.find(m => m.id === selectedMatchId);
  const selectedStatus = selectedMatch ? getMatchVisualStatus(selectedMatch) : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedMatch) {
    return (
      <div className="min-h-screen bg-cb-green-vibrant bg-noise p-4 md:p-8 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-20 md:w-32 h-auto flex items-center justify-center p-2">
                <img src="/logo-yellow.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[4px_4px_0_#000]" />
             </div>
             <div>
                <h1 className="text-lg md:text-2xl text-cb-black-pure font-tech font-black uppercase tracking-wider">Control <span className="text-cb-yellow-neon">Árbitro</span></h1>
                <p className="text-xs md:text-sm font-tech font-bold text-cb-black-pure uppercase">Panel de Operaciones</p>
             </div>
          </div>
          <button onClick={logout} className="p-3 bg-cb-black-pure border-3 border-cb-black-pure text-cb-white-tech hover:bg-red-600 hover:text-white transition-colors shadow-block-sm">
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 max-w-2xl mx-auto w-full">
          <h2 className="text-xs md:text-sm font-tech font-black text-cb-black-pure uppercase mb-4 px-2">Encuentros Asignados</h2>
          <div className="flex flex-wrap items-center gap-2 mb-4 px-2">
            <span className="text-[10px] md:text-xs font-tech font-black uppercase px-2 py-1 border-2 border-cb-black-pure bg-cb-yellow-neon text-cb-black-pure">
              Total: {myMatches.length}
            </span>
            <span className="text-[10px] md:text-xs font-tech font-black uppercase px-2 py-1 border-2 border-cb-black-pure bg-red-600 text-white">
              En vivo: {myMatches.filter(m => m.isActive && !m.isFinished).length}
            </span>
            <span className="text-[10px] md:text-xs font-tech font-black uppercase px-2 py-1 border-2 border-cb-black-pure bg-cb-black-pure text-cb-yellow-neon">
              Finalizados: {myMatches.filter(m => m.isFinished).length}
            </span>
          </div>
          {myMatches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4 px-2">
              <span className="text-[10px] md:text-xs font-tech font-black uppercase text-cb-black-pure">Filtrar fase:</span>
              <button
                onClick={() => setPhaseFilter('all')}
                className={`px-2 py-1 border-2 border-cb-black-pure font-tech font-black uppercase text-[10px] md:text-xs ${phaseFilter === 'all' ? 'bg-cb-yellow-neon text-cb-black-pure' : 'bg-cb-white-tech text-cb-black-pure'}`}
              >
                Todas ({myMatches.length})
              </button>
              {groupedMatches.map((group) => (
                <button
                  key={group.phase}
                  onClick={() => setPhaseFilter(group.phase)}
                  className={`px-2 py-1 border-2 border-cb-black-pure font-tech font-black uppercase text-[10px] md:text-xs ${phaseFilter === group.phase ? 'bg-cb-yellow-neon text-cb-black-pure' : 'bg-cb-white-tech text-cb-black-pure'}`}
                >
                  {group.label} ({group.matches.length})
                </button>
              ))}
            </div>
          )}
          <div className="grid gap-4 md:gap-5">
            {myMatches.length > 0 ? filteredGroups.map((phaseGroup) => (
              <section key={phaseGroup.phase} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs md:text-sm font-tech font-black uppercase text-cb-black-pure">
                    Fase: {phaseGroup.label}
                  </h3>
                  <span className="text-[10px] md:text-xs font-tech font-black uppercase px-2 py-1 border-2 border-cb-black-pure bg-cb-white-tech text-cb-black-pure">
                    {phaseGroup.matches.length} encuentros
                  </span>
                </div>
                <div className="grid gap-3 md:gap-4">
                  {phaseGroup.matches.map((m) => {
                    const visualStatus = getMatchVisualStatus(m);
                    const status = statusConfig[visualStatus];
                    const hasCompetitors = Boolean(m.robotA && m.robotB);

                    return (
                      <button 
                        key={m.id}
                        onClick={() => setSelectedMatchId(m.id)}
                        className="bg-cb-white-tech border-4 border-cb-black-pure p-4 md:p-5 flex justify-between items-center gap-3 shadow-block-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 group"
                      >
                        <div className="text-left min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[10px] md:text-xs font-tech font-black text-cb-yellow-neon uppercase bg-cb-black-pure px-2 py-1 border-2 border-cb-black-pure">
                              {m.category || 'Sin categoría'} | {m.round || 'Sin ronda'}
                            </span>
                            <span className={`text-[10px] md:text-xs font-tech font-black uppercase px-2 py-1 border-2 ${status.className}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-base md:text-2xl font-tech font-black text-cb-black-pure group-hover:text-cb-yellow-neon transition-colors truncate">
                            {m.robotA?.name || '---'} <span className="text-cb-black-pure mx-1">VS</span> {m.robotB?.name || '---'}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-tech font-bold uppercase">
                            <span className="px-2 py-1 bg-cb-black-pure border-2 border-cb-black-pure text-cb-yellow-neon">
                              Tiempo: {formatTime(m.timeLeft)}
                            </span>
                            <span className="px-2 py-1 bg-cb-black-pure border-2 border-cb-black-pure text-cb-yellow-neon">
                              Score: {m.scoreA} - {m.scoreB}
                            </span>
                            <span className="px-2 py-1 bg-cb-black-pure border-2 border-cb-black-pure text-cb-yellow-neon">
                              Faltas: {m.penaltiesA.length + m.penaltiesB.length}
                            </span>
                            {!hasCompetitors && (
                              <span className="px-2 py-1 bg-neutral-200 border-2 border-cb-black-pure text-cb-black-pure">
                                Pendiente de competidores
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronLeft size={24} className="rotate-180 text-cb-black-pure group-hover:text-cb-yellow-neon transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </section>
            )) : (
              <div className="p-8 md:p-12 text-center bg-cb-black-pure border-4 border-cb-black-pure shadow-block-sm">
                <Terminal size={32} className="mx-auto mb-4 text-cb-yellow-neon" strokeWidth={2.5} />
                <p className="text-cb-white-tech font-tech font-bold uppercase">No tienes encuentros asignados para hoy.</p>
              </div>
            )}
            {myMatches.length > 0 && filteredGroups.length === 0 && (
              <div className="p-6 text-center bg-cb-white-tech border-4 border-cb-black-pure shadow-block-sm">
                <p className="text-cb-black-pure font-tech font-black uppercase text-xs md:text-sm">
                  No hay encuentros en la fase seleccionada.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const hasBothCompetitors = Boolean(selectedMatch.robotA && selectedMatch.robotB);

  return (
    <div className="min-h-screen bg-cb-green-vibrant bg-noise p-3 md:p-6 flex flex-col max-w-2xl md:max-w-4xl mx-auto">
      <header className="mb-4 md:mb-6">
        <button onClick={() => setSelectedMatchId(null)} className="flex items-center gap-2 text-cb-black-pure font-tech font-black text-xs md:text-sm uppercase mb-4 hover:text-cb-yellow-neon transition-colors">
          <ChevronLeft size={16} /> Volver a la lista
        </button>
        <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
          <div>
            <h1 className="text-2xl md:text-4xl text-cb-black-pure font-tech font-black uppercase">{selectedMatch.category || 'Sin categoría'}</h1>
            <p className="text-xs md:text-sm font-tech font-black text-cb-black-pure uppercase mt-1">
              Árbitro asignado: {user?.username || 'N/A'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-cb-yellow-neon text-cb-black-pure px-3 py-1 border-2 border-cb-black-pure font-tech text-xs font-black uppercase tracking-widest shadow-block-sm">
              {selectedMatch.round || 'Sin ronda'}
            </span>
            {selectedStatus && (
              <span className={`px-3 py-1 border-2 font-tech text-xs font-black uppercase tracking-widest ${statusConfig[selectedStatus].className}`}>
                {statusConfig[selectedStatus].label}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-3 md:gap-4">
          <div className={`w-full py-6 md:py-8 font-mono text-5xl md:text-7xl font-black text-center tabular-nums border-4 border-cb-black-pure shadow-block-sm ${selectedMatch.isActive ? 'bg-cb-yellow-neon text-cb-black-pure' : 'bg-cb-black-pure text-cb-yellow-neon'}`}>
            {formatTime(selectedMatch.timeLeft)}
          </div>
          <div className="bg-cb-white-tech border-4 border-cb-black-pure p-3 md:p-4 shadow-block-sm">
            <h3 className="text-xs font-tech font-black uppercase text-cb-black-pure mb-2">Información útil</h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs font-tech font-black uppercase">
              <div className="border-2 border-cb-black-pure bg-cb-black-pure px-2 py-2 text-cb-yellow-neon flex items-center gap-2">
                <Swords size={14} />
                <span>Score: {selectedMatch.scoreA}-{selectedMatch.scoreB}</span>
              </div>
              <div className="border-2 border-cb-black-pure bg-cb-black-pure px-2 py-2 text-cb-yellow-neon flex items-center gap-2">
                <Clock3 size={14} />
                <span>Tiempo: {formatTime(selectedMatch.timeLeft)}</span>
              </div>
              <div className="border-2 border-cb-black-pure bg-cb-black-pure px-2 py-2 text-cb-yellow-neon flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>Faltas A: {selectedMatch.penaltiesA.length}</span>
              </div>
              <div className="border-2 border-cb-black-pure bg-cb-black-pure px-2 py-2 text-cb-yellow-neon flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>Faltas B: {selectedMatch.penaltiesB.length}</span>
              </div>
              <div className={`col-span-2 border-2 border-cb-black-pure px-2 py-2 flex items-center gap-2 ${hasBothCompetitors ? 'bg-cb-yellow-neon text-cb-black-pure' : 'bg-neutral-300 text-cb-black-pure'}`}>
                <CircleCheckBig size={14} />
                <span>{hasBothCompetitors ? 'Competidores listos' : 'Competidores incompletos'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Timer Controls */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
        <ActionButton 
          icon={selectedMatch.isActive ? Pause : Play} 
          label={selectedMatch.isActive ? 'Pausar' : 'Iniciar'} 
          color={selectedMatch.isActive ? 'bg-red-600 text-white' : 'bg-cb-green-vibrant text-cb-black-pure'}
          textColor={selectedMatch.isActive ? 'text-white' : 'text-cb-black-pure'}
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
          color="bg-cb-black-pure"
          textColor="text-cb-white-tech"
          onClick={() => {
            if(confirm('¿Reiniciar encuentro? Todos los puntajes vuelven a cero.')) onControl(selectedMatch.id, 'RESET');
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-1">
        {/* Side A Control */}
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="p-4 md:p-6 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-cb-yellow-neon" />
            <h2 className="text-xs md:text-sm font-tech font-black text-cb-black-pure uppercase truncate px-2">{selectedMatch.robotA?.name || 'Pendiente'}</h2>
            <p className="text-[10px] md:text-xs font-tech font-bold text-neutral-600 uppercase truncate px-2 mt-1">
              {selectedMatch.robotA?.institution || 'Sin institución'}
            </p>
            <div className="text-5xl md:text-7xl font-tech font-black my-3 md:my-4 text-cb-black-pure">{selectedMatch.scoreA}</div>
          </div>
          <ActionButton 
            icon={Plus} 
            label="Punto" 
            size="py-8 md:py-10"
            color="bg-cb-black-pure"
            textColor="text-cb-yellow-neon"
            onClick={() => onControl(selectedMatch.id, 'ADD_SCORE_A')}
          />
          <ActionButton 
            icon={ShieldAlert} 
            label="Falta" 
            color="bg-red-600"
            textColor="text-white"
            onClick={() => onControl(selectedMatch.id, 'ADD_PENALTY_A')}
          />
        </div>

        {/* Side B Control */}
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="p-4 md:p-6 bg-cb-gray-industrial border-4 border-cb-black-pure text-center shadow-block-sm relative overflow-hidden">
            <h2 className="text-xs md:text-sm font-tech font-black text-cb-white-tech uppercase truncate px-2">{selectedMatch.robotB?.name || 'Pendiente'}</h2>
            <p className="text-[10px] md:text-xs font-tech font-bold text-neutral-400 uppercase truncate px-2 mt-1">
              {selectedMatch.robotB?.institution || 'Sin institución'}
            </p>
            <div className="text-5xl md:text-7xl font-tech font-black my-3 md:my-4 text-cb-white-tech">{selectedMatch.scoreB}</div>
          </div>
          <ActionButton 
            icon={Plus} 
            label="Punto" 
            size="py-8 md:py-10"
            color="bg-cb-white-tech"
            textColor="text-cb-black-pure"
            onClick={() => onControl(selectedMatch.id, 'ADD_SCORE_B')}
          />
          <ActionButton 
            icon={ShieldAlert} 
            label="Falta" 
            color="bg-red-600"
            textColor="text-white"
            onClick={() => onControl(selectedMatch.id, 'ADD_PENALTY_B')}
          />
        </div>
      </div>

      {/* Finishing Status */}
      <div className="mt-4 md:mt-6">
        {!selectedMatch.isFinished ? (
          <button 
            onClick={() => {
              if (confirm('¿Finalizar encuentro y declarar ganador?')) onControl(selectedMatch.id, 'FINISH');
            }}
            className="w-full bg-cb-yellow-neon text-cb-black-pure py-5 md:py-6 border-4 border-cb-black-pure font-tech font-black uppercase shadow-[6px_6px_0_#000] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-150 flex items-center justify-center gap-3"
          >
            <Trophy size={22} strokeWidth={2.5} />
            Finalizar Encuentro
          </button>
        ) : (
          <div className="flex flex-col gap-2 md:gap-3">
            <div className="bg-cb-yellow-neon text-cb-black-pure p-5 md:p-6 border-4 border-cb-black-pure text-center font-tech font-black uppercase shadow-block-sm flex flex-col items-center">
              <Trophy size={28} className="mb-2" strokeWidth={2.5} />
              ¡Encuentro Terminado!
            </div>
            <button 
              onClick={() => onControl(selectedMatch.id, 'UNFINISH')}
              className="w-full bg-cb-black-pure text-cb-white-tech py-4 border-3 border-cb-black-pure font-tech font-black uppercase hover:bg-red-600 transition-colors"
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
