import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Pin, Activity } from 'lucide-react'
import { useState, useEffect, useMemo, useRef } from 'react'
import type { MatchState } from '../App'
import { api } from '../config/api'
interface MatchCardProps {
  match: MatchState;
  isPinned?: boolean;
  canPin?: boolean;
  onPin: () => void;
}

const MatchCard = ({ match, isPinned, canPin = true, onPin }: MatchCardProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timerColor = match.timeLeft < 30 ? 'text-red-500' : 'text-cb-yellow-neon';
  const progressColor = match.timeLeft < 30 ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-cb-yellow-neon shadow-[0_0_20px_rgba(255,240,0,0.4)]';
  const headerTextColor = isPinned ? 'text-cb-black-pure' : 'text-cb-white-tech';
  const robotNameColor = isPinned ? 'text-cb-black-pure' : 'text-cb-white-tech';
  const institutionColor = isPinned ? 'text-neutral-600' : 'text-neutral-400';

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      whileHover={{ y: -4 }}
      className={`relative rounded-none flex flex-col items-center justify-between overflow-hidden transition-all duration-150 border-4 h-full w-full ${isPinned
        ? 'bg-cb-white-tech border-cb-black-pure p-8 shadow-block-lg'
        : 'bg-cb-gray-industrial border-cb-black-pure p-4 opacity-90 hover:opacity-100'
        }`}
    >
      {/* Background Accent */}
      {isPinned && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-cb-yellow-neon/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
      )}

      {/* Pin Toggle */}
      <button
        onClick={onPin}
        aria-label={isPinned ? 'Quitar destacado' : 'Destacar combate'}
        disabled={!canPin}
        title={canPin ? undefined : 'El destacado se desactiva cuando hay muchos combates activos'}
        className={`absolute top-3 right-3 p-2 border-2 border-cb-black-pure transition-all z-30 disabled:opacity-40 disabled:cursor-not-allowed ${isPinned ? 'bg-cb-yellow-neon text-cb-black-pure shadow-block-sm' : 'bg-cb-black-pure text-cb-white-tech hover:bg-cb-yellow-neon hover:text-cb-black-pure'
          }`}
      >
        <Pin size={isPinned ? 16 : 14} />
      </button>

      {/* Top Header */}
      <div className="w-full flex flex-col items-center gap-2 mb-3">
        {match.isActive && (
          <div className="flex items-center gap-2 px-3 py-1 bg-cb-yellow-neon text-cb-black-pure border-2 border-cb-black-pure shadow-block-sm">
            <Activity size={12} className="animate-pulse" />
            <span className="text-xs font-tech font-black uppercase">En Vivo</span>
          </div>
        )}
        <span className={`font-tech font-black uppercase ${headerTextColor} ${isPinned ? 'text-sm' : 'text-xs'}`}>
          {match.category || 'Sin categoría'} <span className="mx-2 opacity-50">|</span> {match.round || 'Sin ronda'}
        </span>
      </div>

      {/* Main Content: Scores & Names */}
      <div className={`grid grid-cols-3 w-full items-center ${isPinned ? 'gap-6 flex-1' : 'gap-2 mb-1'} min-h-0 flex-1`}>
        {/* Robot A */}
        <div className="text-center flex flex-col gap-1 min-h-0">
          <h3
            title={match.robotA?.name || 'Pendiente'}
            className={`font-tech font-black leading-[1.1] overflow-hidden break-words line-clamp-2 ${robotNameColor} ${isPinned ? 'text-3xl lg:text-4xl' : 'text-sm'}`}
          >
            {match.robotA?.name || 'Pendiente'}
          </h3>
          <span className={`text-[10px] md:text-xs font-tech font-bold uppercase tracking-wide ${institutionColor} line-clamp-1`}>
            {match.robotA?.institution || 'Sin institución'}
          </span>
        </div>

        {/* Score Center */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-3 lg:gap-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={match.scoreA}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`font-tech font-black tabular-nums text-cb-yellow-neon leading-none drop-shadow-[2px_2px_0_#000] ${isPinned ? 'text-6xl lg:text-8xl' : 'text-4xl'}`}
              >
                {match.scoreA}
              </motion.span>
            </AnimatePresence>

            <div className={`bg-cb-black-pure rounded-full ${isPinned ? 'w-3 h-3' : 'w-2 h-2'}`} />

            <AnimatePresence mode="wait">
              <motion.span
                key={match.scoreB}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`font-tech font-black tabular-nums text-cb-yellow-neon leading-none drop-shadow-[2px_2px_0_#000] ${isPinned ? 'text-6xl lg:text-8xl' : 'text-4xl'}`}
              >
                {match.scoreB}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Robot B */}
        <div className="text-center flex flex-col gap-1 min-h-0">
          <h3
            title={match.robotB?.name || 'Pendiente'}
            className={`font-tech font-black leading-[1.1] overflow-hidden break-words line-clamp-2 ${robotNameColor} ${isPinned ? 'text-3xl lg:text-4xl' : 'text-sm'}`}
          >
            {match.robotB?.name || 'Pendiente'}
          </h3>
          <span className={`text-[10px] md:text-xs font-tech font-bold uppercase tracking-wide ${institutionColor} line-clamp-1`}>
            {match.robotB?.institution || 'Sin institución'}
          </span>
        </div>
      </div>
      {isPinned && (match.penaltiesA.length > 0 || match.penaltiesB.length > 0) && (
        <div className="mt-4 flex justify-between items-center w-full px-2 relative z-20">
          {/* Penalties Robot A */}
          <div className="flex gap-1.5">
            <AnimatePresence mode="popLayout">
              {match.penaltiesA.slice(0, 3).map((_, i) => (
                <motion.div
                  key={`penalty-a-${i}`}
                  initial={{ opacity: 0, scale: 0.5, x: -20, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: -20 }}
                  className="w-5 h-8 bg-red-600 border-2 border-cb-black-pure flex items-center justify-center"
                >
                  <div className="w-1 h-4 bg-white/30 rounded-full" />
                </motion.div>
              ))}
            </AnimatePresence>
            {match.penaltiesA.length > 3 && (
              <div className="flex items-center text-red-500 font-tech font-black text-sm ml-1">+{match.penaltiesA.length - 3}</div>
            )}
          </div>

          {/* Penalties Robot B */}
          <div className="flex gap-1.5 flex-row-reverse">
            <AnimatePresence mode="popLayout">
              {match.penaltiesB.slice(0, 3).map((_, i) => (
                <motion.div
                  key={`penalty-b-${i}`}
                  initial={{ opacity: 0, scale: 0.5, x: 20, rotate: 15 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: 20 }}
                  className="w-5 h-8 bg-red-600 border-2 border-cb-black-pure flex items-center justify-center"
                >
                  <div className="w-1 h-4 bg-white/30 rounded-full" />
                </motion.div>
              ))}
            </AnimatePresence>
            {match.penaltiesB.length > 3 && (
              <div className="flex items-center text-red-500 font-tech font-black text-sm mr-1">+{match.penaltiesB.length - 3}</div>
            )}
          </div>
        </div>
      )}

      {/* Footer: Timer & Status */}
      <div className="w-full mt-auto space-y-2 pt-2">
        {/* Timer Bar */}
        <div className={`w-full bg-cb-black-pure border-2 border-cb-black-pure overflow-hidden ${isPinned ? 'h-3' : 'h-1.5'}`}>
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${(match.timeLeft / 180) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
            className={`h-full transition-colors duration-150 ${progressColor}`}
          />
        </div>

        <div className="flex flex-col items-center">
          <div className={`font-tech font-black tabular-nums leading-none ${isPinned ? 'text-5xl lg:text-6xl' : 'text-2xl'} ${timerColor}`}>
            {formatTime(match.timeLeft)}
          </div>
          <div className="flex gap-3 mt-1">
            {!isPinned && (
              <>
                <span className={`text-xs font-tech font-bold ${match.penaltiesA.length > 0 ? 'text-red-500' : 'text-neutral-400'}`}>F: {match.penaltiesA.length}</span>
                <div className="w-px h-3 bg-cb-black-pure" />
                <span className={`text-xs font-tech font-bold ${match.penaltiesB.length > 0 ? 'text-red-500' : 'text-neutral-400'}`}>F: {match.penaltiesB.length}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = ({ matches }: { matches: MatchState[] }) => {
  const [viewMode, setViewMode] = useState<'zoom' | 'mosaico'>('zoom');
  const [focusedMatchId, setFocusedMatchId] = useState<string | null>(null);
  const [manualFocusId, setManualFocusId] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const startSequenceRef = useRef<Record<string, number>>({});
  const knownActiveIdsRef = useRef<Set<string>>(new Set());
  const nextSequenceRef = useRef(1);
  
  useEffect(() => {
    api.get('/api/sponsors')
      .then(res => res.json())
      .then(setSponsors)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const currentActiveIds = new Set(matches.filter(match => match.isActive).map(match => match.id));

    currentActiveIds.forEach((id) => {
      if (!knownActiveIdsRef.current.has(id)) {
        startSequenceRef.current[id] = nextSequenceRef.current++;
      }
    });

    knownActiveIdsRef.current = currentActiveIds;
  }, [matches]);

  const getStartSequence = (matchId: string) => startSequenceRef.current[matchId] || 0;

  const activeMatches = useMemo(
    () =>
      matches
        .filter(m => m.isActive || m.showInDashboard)
        .sort((a, b) =>
          Number(b.isActive) - Number(a.isActive) ||
          getStartSequence(b.id) - getStartSequence(a.id) ||
          a.timeLeft - b.timeLeft
        ),
    [matches]
  );

  const liveMatches = activeMatches.filter(match => match.isActive);
  const categories = [...new Set(activeMatches.map(match => match.category).filter(Boolean))];
  const currentPool = liveMatches.length > 0 ? liveMatches : activeMatches;

  const smartFocusedId = useMemo(() => {
    if (currentPool.length === 0) return null;

    const newestStarted = [...currentPool].sort(
      (a, b) => getStartSequence(b.id) - getStartSequence(a.id)
    )[0];
    const closestToFinish = [...currentPool]
      .filter(match => match.timeLeft > 0)
      .sort((a, b) => a.timeLeft - b.timeLeft)[0] || currentPool[0];
    const currentFocused = currentPool.find(match => match.id === focusedMatchId);

    if (manualFocusId && currentPool.some(match => match.id === manualFocusId)) {
      return manualFocusId;
    }

    if (!currentFocused) {
      return newestStarted?.id || closestToFinish.id;
    }

    const hasNewerMatch = newestStarted && getStartSequence(newestStarted.id) > getStartSequence(currentFocused.id);
    if (hasNewerMatch) return newestStarted.id;

    if ((currentFocused.isFinished || !currentFocused.isActive || currentFocused.timeLeft <= 5) && closestToFinish.id !== currentFocused.id) {
      return closestToFinish.id;
    }

    return currentFocused.id;
  }, [currentPool, focusedMatchId, manualFocusId]);

  useEffect(() => {
    if (manualFocusId && !activeMatches.some(match => match.id === manualFocusId)) {
      setManualFocusId(null);
    }
    if (focusedMatchId && !activeMatches.some(match => match.id === focusedMatchId)) {
      setFocusedMatchId(null);
    }
  }, [activeMatches, manualFocusId, focusedMatchId]);

  useEffect(() => {
    if (smartFocusedId !== focusedMatchId) {
      setFocusedMatchId(smartFocusedId);
    }
  }, [smartFocusedId, focusedMatchId]);

  const focusedMatch = activeMatches.find(match => match.id === focusedMatchId) || activeMatches[0] || null;
  const sideMatches = activeMatches.filter(match => match.id !== focusedMatch?.id);

  const toggleManualFocus = (matchId: string) => {
    if (manualFocusId === matchId) {
      setManualFocusId(null);
      return;
    }
    setManualFocusId(matchId);
    setFocusedMatchId(matchId);
  };

  return (
    <div className="h-screen w-screen bg-cb-green-vibrant bg-noise text-cb-black-pure flex flex-col overflow-hidden select-none font-sans relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" />

      {activeMatches.length > 0 ? (
        <main className="flex-1 p-3 md:p-6 min-h-0 relative z-10 flex flex-col gap-3 md:gap-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="px-3 py-1 border-2 border-cb-black-pure bg-cb-yellow-neon text-cb-black-pure font-tech font-black uppercase text-xs md:text-sm">
              Combates: {activeMatches.length}
            </span>
            <span className="px-3 py-1 border-2 border-cb-black-pure bg-cb-black-pure text-cb-yellow-neon font-tech font-black uppercase text-[10px] md:text-xs">
              Centro: {manualFocusId ? 'Manual' : 'Auto Inteligente'}
            </span>
            <button
              onClick={() => setViewMode('zoom')}
              className={`px-3 py-1 border-2 border-cb-black-pure font-tech font-black uppercase text-[10px] md:text-xs transition-colors ${viewMode === 'zoom' ? 'bg-cb-yellow-neon text-cb-black-pure' : 'bg-cb-white-tech text-cb-black-pure'}`}
            >
              Vista Zoom
            </button>
            <button
              onClick={() => setViewMode('mosaico')}
              className={`px-3 py-1 border-2 border-cb-black-pure font-tech font-black uppercase text-[10px] md:text-xs transition-colors ${viewMode === 'mosaico' ? 'bg-cb-yellow-neon text-cb-black-pure' : 'bg-cb-white-tech text-cb-black-pure'}`}
            >
              Vista Mosaico
            </button>
            {categories.map((category) => (
              <span
                key={category}
                className="px-2.5 py-1 border-2 border-cb-black-pure bg-cb-white-tech text-cb-black-pure font-tech font-black uppercase text-[10px] md:text-xs"
              >
                {category}
              </span>
            ))}
          </div>

          {viewMode === 'zoom' ? (
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)] gap-3 md:gap-5">
              <div className="min-h-0">
                {focusedMatch ? (
                  <div className="h-full">
                    <MatchCard
                      match={focusedMatch}
                      isPinned={true}
                      canPin={true}
                      onPin={() => toggleManualFocus(focusedMatch.id)}
                    />
                  </div>
                ) : null}
              </div>

              <div className="min-h-0 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-3 md:gap-4 auto-rows-[minmax(200px,1fr)]">
                  {sideMatches.map((match) => (
                    <div
                      key={match.id}
                      className="cursor-pointer"
                      onClick={() => setFocusedMatchId(match.id)}
                    >
                      <MatchCard
                        match={match}
                        isPinned={false}
                        canPin={true}
                        onPin={() => toggleManualFocus(match.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-[minmax(260px,1fr)] gap-3 md:gap-5">
                {activeMatches.map((match) => (
                  <div key={match.id} className={`transition-all duration-150 ease-in-out ${match.id === focusedMatch?.id ? 'ring-4 ring-cb-yellow-neon/70' : ''}`}>
                    <MatchCard
                      match={match}
                      isPinned={false}
                      canPin={true}
                      onPin={() => toggleManualFocus(match.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 z-10 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: [0, -3, 3, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 5 }}
            className="p-8 md:p-16 mb-8 md:mb-12 flex items-center justify-center"
          >
            <img src="/logo-yellow.png" alt="CatoBots Logo" className="h-32 md:h-48 w-auto object-contain drop-shadow-[8px_8px_0_#000]" />
          </motion.div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-tech font-black text-cb-black-pure mb-4 md:mb-6 uppercase drop-shadow-[4px_4px_0_#FFF]">Arena en Reposo</h2>
          <p className="font-tech font-bold uppercase text-sm md:text-lg bg-cb-black-pure text-cb-yellow-neon px-6 md:px-8 py-2 md:py-3 border-4 border-cb-black-pure shadow-block-sm">Esperando el inicio de la competencia</p>
        </div>
      )}

      {/* Sponsors Carousel */}
      <footer className="h-20 md:h-28 bg-cb-black-pure border-t-4 border-cb-yellow-neon relative overflow-hidden flex items-center z-30">
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-cb-black-pure to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-cb-black-pure to-transparent z-10" />
        
        {/* Warning tape decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-warning-tape" />

        {sponsors.length > 0 ? (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-16 md:gap-24 px-8 md:px-12 whitespace-nowrap"
          >
            {[...sponsors, ...sponsors, ...sponsors, ...sponsors].map((sponsor, idx) => (
              <div key={`${sponsor.id}-${idx}`} className="flex items-center gap-4 md:gap-6 group">
                <div className="w-12 md:w-16 h-12 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110">
                  {sponsor.logoUrl ? (
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="w-full h-full object-contain filter drop-shadow-sm"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <Trophy size={24} className="text-neutral-600" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-md font-tech font-black uppercase text-cb-white-tech leading-tight">{sponsor.name}</span>
                  <span className={`text-xs font-tech font-bold ${sponsor.tier === 'GOLD' ? 'text-cb-yellow-neon' :
                    sponsor.tier === 'SILVER' ? 'text-neutral-400' : 'text-orange-500'
                    }`}>{sponsor.tier}</span>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="w-full flex items-center justify-around text-neutral-400 font-tech font-black uppercase text-xs px-8 md:px-24">
            <div className="flex items-center rounded-lg p-2 border-2 border-cb-yellow-neon">
                <img src="/logo-yellow.png" alt="CatoBots Logo" className="h-6 md:h-8 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-8 md:gap-12">
              <span className="hidden md:inline">CatoBots IV</span>
              <div className="w-2 h-2 bg-cb-yellow-neon" />
              <span>Patrocinadores</span>
              <div className="w-2 h-2 bg-cb-yellow-neon" />
              <span>Transmisión en Vivo</span>
            </div>
            <div className="hidden lg:flex items-center gap-8 md:gap-12">
              <span>CatoBots IV</span>
              <div className="w-2 h-2 bg-cb-yellow-neon" />
              <span>Patrocinadores</span>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default Dashboard;
