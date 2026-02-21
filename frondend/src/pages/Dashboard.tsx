import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Pin, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { MatchState } from '../App'
interface MatchCardProps {
  match: MatchState;
  isPinned?: boolean;
  onPin: () => void;
}

const MatchCard = ({ match, isPinned, onPin }: MatchCardProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timerColor = match.timeLeft < 30 ? 'text-red-500' : 'text-brand';
  const progressColor = match.timeLeft < 30 ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-brand shadow-[0_0_20px_rgba(230,57,70,0.4)]';

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      whileHover={{ y: -4 }}
      className={`relative rounded flex flex-col items-center justify-between overflow-hidden transition-all duration-500 border  h-full w-full ${isPinned
        ? 'bg-white border-brand/20 p-12 ring-5 ring-brand/20 scale-100 z-20'
        : 'bg-white/80 backdrop-blur-sm border-white p-6 opacity-90 hover:opacity-100 z-10'
        }`}
    >
      {/* Background Accent */}
      {isPinned && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
      )}

      {/* Pin Toggle */}
      <button
        onClick={onPin}
        className={`absolute top-6 right-6 p-3 rounded-2xl transition-all z-30 ${isPinned ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-neutral-100/50 text-neutral-300 hover:text-brand hover:bg-white'
          }`}
      >
        <Pin size={isPinned ? 20 : 16} />
      </button>

      {/* Top Header */}
      <div className="w-full flex flex-col items-center gap-2 mb-4">
        {match.isActive && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-brand text-white rounded-full shadow-lg shadow-brand/20">
            <Activity size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase">En Vivo</span>
          </div>
        )}
        <span className={`font-black uppercase text-neutral-400 ${isPinned ? 'text-sm' : 'text-sm'}`}>
          {match.category} <span className="mx-2 opacity-30">|</span> {match.round}
        </span>
      </div>

      {/* Main Content: Scores & Names */}
      <div className={`grid grid-cols-3 w-full items-center ${isPinned ? 'gap-8 flex-1' : 'gap-3 mb-1'} min-h-0 flex-1`}>
        {/* Robot A */}
        <div className="text-center flex flex-col gap-1 min-h-0">
          <h3 className={`font-black leading-[1.1] text-black overflow-hidden break-words line-clamp-2 ${isPinned ? 'text-5xl' : 'text-base'}`}>
            {match.robotA?.name || '---'}
          </h3>

        </div>

        {/* Score Center */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={match.scoreA}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`font-black tabular-nums text-black leading-none drop-shadow-sm ${isPinned ? 'text-[10rem]' : 'text-5xl'}`}
              >
                {match.scoreA}
              </motion.span>
            </AnimatePresence>

            <div className={`bg-neutral-100 rounded-full flex items-center justify-center ${isPinned ? 'w-4 h-4' : 'w-2 h-2'}`} />

            <AnimatePresence mode="wait">
              <motion.span
                key={match.scoreB}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`font-black tabular-nums text-black leading-none drop-shadow-sm ${isPinned ? 'text-[10rem]' : 'text-5xl'}`}
              >
                {match.scoreB}
              </motion.span>
            </AnimatePresence>
          </div>

        </div>

        {/* Robot B */}
        <div className="text-center flex flex-col gap-1 min-h-0">
          <h3 className={`font-black leading-[1.1] text-black overflow-hidden break-words line-clamp-2 ${isPinned ? 'text-5xl' : 'text-base'}`}>
            {match.robotB?.name || '---'}
          </h3>

        </div>

      </div>
      {isPinned && (match.penaltiesA.length > 0 || match.penaltiesB.length > 0) && (
        <div className="mt-8 flex justify-between items-center w-full px-4 relative z-20">
          {/* Penalties Robot A (Aligned with beginning) */}
          <div className="flex gap-2.5">
            <AnimatePresence mode="popLayout">
              {match.penaltiesA.slice(0, 3).map((_, i) => (
                <motion.div
                  key={`penalty-a-${i}`}
                  initial={{ opacity: 0, scale: 0.5, x: -30, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: -20 }}
                  className="w-7 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-md border-2 border-red-700 flex items-center justify-center"
                >
                  <div className="w-1 h-5 bg-white/20 rounded-full" />
                </motion.div>
              ))}
            </AnimatePresence>
            {match.penaltiesA.length > 3 && (
              <div className="flex items-center text-red-600 font-black text-xl ml-1">+{match.penaltiesA.length - 3}</div>
            )}
          </div>

          {/* Penalties Robot B (Aligned with end) */}
          <div className="flex gap-2.5 flex-row-reverse">
            <AnimatePresence mode="popLayout">
              {match.penaltiesB.slice(0, 3).map((_, i) => (
                <motion.div
                  key={`penalty-b-${i}`}
                  initial={{ opacity: 0, scale: 0.5, x: 30, rotate: 15 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: 20 }}
                  className="w-7 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-md border-2 border-red-700 flex items-center justify-center"
                >
                  <div className="w-1 h-5 bg-white/20 rounded-full" />
                </motion.div>
              ))}
            </AnimatePresence>
            {match.penaltiesB.length > 3 && (
              <div className="flex items-center text-red-600 font-black text-xl mr-1">+{match.penaltiesB.length - 3}</div>
            )}
          </div>
        </div>
      )}

      {/* Footer: Timer & Status */}
      <div className="w-full mt-auto space-y-2 py-2">
        {/* Timer Bar */}
        <div className={`w-full bg-neutral-100 rounded-full overflow-hidden ${isPinned ? 'h-4' : 'h-1.5'}`}>
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${(match.timeLeft / 180) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
            className={`h-full transition-colors duration-500 ${progressColor}`}
          />
        </div>

        <div className="flex flex-col items-center">
          <div className={`font-black tabular-nums leading-none ${isPinned ? 'text-8xl' : 'text-3xl'} ${timerColor}`}>
            {formatTime(match.timeLeft)}
          </div>
          <div className="flex gap-4 mt-1">
            {!isPinned && (
              <>
                <span className={`text-xs font-black ${match.penaltiesA.length > 0 ? 'text-red-500' : 'text-neutral-400'}`}>F: {match.penaltiesA.length}</span>
                <div className="w-px h-3 bg-neutral-100" />
                <span className={`text-xs font-black ${match.penaltiesB.length > 0 ? 'text-red-500' : 'text-neutral-400'}`}>F: {match.penaltiesB.length}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = ({ matches }: { matches: MatchState[] }) => {
  const [pinnedMatchId, setPinnedMatchId] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/sponsors')
      .then(res => res.json())
      .then(setSponsors)
      .catch(console.error);
  }, []);

  const activeMatches = matches.filter(m => m.isActive || m.showInDashboard);
  const pinnedMatch = activeMatches.find(m => m.id === pinnedMatchId) || activeMatches[0];
  const otherMatches = activeMatches.filter(m => m.id !== pinnedMatch?.id);

  const getGridArea = (matchId: string) => {
    if (matchId === pinnedMatch?.id) return "col-start-2 col-end-4 row-start-1 row-end-3";

    const idx = otherMatches.findIndex(m => m.id === matchId);
    const slots = [
      "col-start-1 row-start-1",
      "col-start-4 row-start-1",
      "col-start-1 row-start-2",
      "col-start-4 row-start-2",
      "col-start-1 row-start-3",
      "col-start-2 row-start-3",
      "col-start-3 row-start-3",
      "col-start-4 row-start-3",
    ];
    return slots[idx] || "hidden";
  };

  return (
    <div className="h-screen w-screen bg-[#f8f9fa] text-black flex flex-col overflow-hidden select-none font-sans relative">
      {/* Background Grid Pattern - Stable and Persistent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

      {activeMatches.length > 0 ? (
        <main className="flex-1 p-6 grid grid-cols-4 grid-rows-3 gap-6 max-h-full min-h-0 relative z-10">
          {activeMatches.map((match) => {
            const gridArea = getGridArea(match.id);
            if (gridArea === "hidden") return null;

            return (
              <div
                key={match.id}
                className={`transition-all duration-700 ease-in-out ${gridArea}`}
                style={{ display: gridArea === 'hidden' ? 'none' : 'flex' }}
              >
                <MatchCard
                  match={match}
                  isPinned={match.id === pinnedMatch?.id}
                  onPin={() => setPinnedMatchId(match.id === pinnedMatch?.id ? null : match.id)}
                />
              </div>
            );
          })}
        </main>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-20 z-10 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 5 }}
            className="p-20 rounded-[5rem] bg-white border border-neutral-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] mb-12"
          >
            <Trophy size={160} className="text-neutral-100" />
          </motion.div>
          <h2 className="text-7xl font-black text-black mb-6 uppercase">Arena en Reposo</h2>
          <p className="text-neutral-400 font-bold uppercase text-lg bg-white px-8 py-3 rounded-full border border-neutral-100">Esperando el inicio de la competencia</p>
        </div>
      )}

      {/* Sponsors Carousel */}
      <footer className="h-28 bg-white/80 backdrop-blur-md border-t border-neutral-100 relative overflow-hidden flex items-center z-30">
        <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-white to-transparent z-10" />

        {sponsors.length > 0 ? (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-24 px-12 whitespace-nowrap"
          >
            {/* Duplicating many times to ensure no gaps ever appear regardless of screen width */}
            {[...sponsors, ...sponsors, ...sponsors, ...sponsors].map((sponsor, idx) => (
              <div key={`${sponsor.id}-${idx}`} className="flex items-center gap-6 group">
                <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-110">
                  {sponsor.logoUrl ? (
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="w-full h-full object-contain filter drop-shadow-sm"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <Trophy size={32} className="text-neutral-200" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-md font-black uppercase text-black leading-tight">{sponsor.name}</span>
                  <span className={`text-sm font-bold ${sponsor.tier === 'GOLD' ? 'text-yellow-600' :
                    sponsor.tier === 'SILVER' ? 'text-slate-400' : 'text-orange-600'
                    }`}>{sponsor.tier}</span>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="w-full flex items-center justify-around text-neutral-300 font-black uppercase text-xs px-24">
            <div className="flex items-center gap-12">
              <span>Robot League 2026</span>
              <div className="w-2 h-2 rounded-full bg-neutral-100" />
              <span>Cato-Bots Patrocinadores Oficiales</span>
              <div className="w-2 h-2 rounded-full bg-neutral-100" />
              <span>Transmisión en Vivo</span>
            </div>
            <div className="hidden lg:flex items-center gap-12">
              <span>Robot League 2026</span>
              <div className="w-2 h-2 rounded-full bg-neutral-100" />
              <span>Cato-Bots Patrocinadores Oficiales</span>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default Dashboard;
