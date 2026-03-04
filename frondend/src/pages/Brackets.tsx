import { motion } from 'framer-motion';
import { Trophy, Crown, Zap } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

interface Robot {
  id: string;
  name: string;
  institution: string;
  Institution?: { name: string };
}

interface Match {
  id: string;
  robotA?: Robot;
  robotB?: Robot;
  scoreA: number;
  scoreB: number;
  isFinished: boolean;
  round: string;
  winnerId?: string;
  category: string;
  level: string;
  nextMatchId?: string;
  positionInNextMatch?: 'A' | 'B';
}

// Phase color palette — aggresssive grunge
const PHASE_COLORS: Record<string, { bg: string; border: string; text: string; accent: string; glow: string }> = {
  '32VOS':    { bg: 'bg-[#0d1117]', border: 'border-cyan-500',    text: 'text-cyan-400',    accent: 'bg-cyan-500',    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]' },
  '16VOS':    { bg: 'bg-[#0d1117]', border: 'border-blue-500',    text: 'text-blue-400',    accent: 'bg-blue-500',    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
  'OCTAVOS':  { bg: 'bg-[#0d1117]', border: 'border-indigo-500',  text: 'text-indigo-400',  accent: 'bg-indigo-500',  glow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]' },
  'QUARTERS': { bg: 'bg-[#0d1117]', border: 'border-purple-500',  text: 'text-purple-400',  accent: 'bg-purple-500',  glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
  'SEMIS':    { bg: 'bg-[#0d1117]', border: 'border-orange-500',  text: 'text-orange-400',  accent: 'bg-orange-500',  glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' },
  'FINAL':    { bg: 'bg-[#0d1117]', border: 'border-cb-yellow-neon', text: 'text-cb-yellow-neon', accent: 'bg-cb-yellow-neon', glow: 'shadow-[0_0_30px_rgba(255,234,0,0.4)]' },
};

const getPhaseColor = (round: string) => PHASE_COLORS[round] || PHASE_COLORS['OCTAVOS'];

let socket: Socket;

const Brackets = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
    })
    socket.on('all_matches', (data: Match[]) => setMatches(data));
    return () => { socket.disconnect(); };
  }, []);

  const categories = useMemo(() => [...new Set(matches.map(m => m.category))], [matches]);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) setSelectedCategory(categories[0]);
  }, [categories, selectedCategory]);

  const filteredMatches = useMemo(() =>
    matches.filter(m => !selectedCategory || m.category === selectedCategory),
    [matches, selectedCategory]);

  const matchMap = useMemo(() => {
    const map = new Map<string, Match>();
    filteredMatches.forEach(m => map.set(m.id, m));
    return map;
  }, [filteredMatches]);

  const childrenMap = useMemo(() => {
    const map = new Map<string, Match[]>();
    filteredMatches.forEach(m => {
      if (m.nextMatchId) {
        if (!map.has(m.nextMatchId)) map.set(m.nextMatchId, []);
        map.get(m.nextMatchId)?.push(m);
      }
    });
    return map;
  }, [filteredMatches]);

  const rootMatch = useMemo(() =>
    filteredMatches.find(m => m.round === 'FINAL') || null
    , [filteredMatches]);

  const sides = useMemo(() => {
    if (!rootMatch) return { left: [], right: [] };
    const children = childrenMap.get(rootMatch.id) || [];

    const getSubtree = (matchId: string): string[] => {
      const ids = [matchId];
      const subs = childrenMap.get(matchId) || [];
      subs.forEach(s => ids.push(...getSubtree(s.id)));
      return ids;
    };

    const semiA = children.find(c => c.positionInNextMatch === 'A');
    const semiB = children.find(c => c.positionInNextMatch === 'B');

    return {
      left: semiA ? getSubtree(semiA.id) : [],
      right: semiB ? getSubtree(semiB.id) : []
    };
  }, [rootMatch, childrenMap]);

  const roundOrder = ['32VOS', '16VOS', 'OCTAVOS', 'QUARTERS', 'SEMIS'];

  // === MATCH NODE ===
  const MatchNode = ({ match, side }: { match: Match, side: 'left' | 'right' }) => {
    const isWinnerA = match.isFinished && match.winnerId === match.robotA?.id;
    const isWinnerB = match.isFinished && match.winnerId === match.robotB?.id;
    const phase = getPhaseColor(match.round);

    return (
      <motion.div
        layout
        className={`relative w-48 sm:w-56 bg-[#111] border-3 ${phase.border} overflow-hidden transition-all duration-300 z-10 ${phase.glow}`}
      >
        {/* Round Header */}
        <div className={`px-3 py-1.5 flex justify-between items-center text-[10px] font-tech font-black uppercase tracking-widest ${phase.accent} text-cb-black-pure`}>
          <span>{match.round}</span>
          {!match.isFinished && (
            <div className="flex items-center gap-1 animate-pulse">
              <Zap size={10} fill="currentColor" /> VIVO
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="p-2 space-y-1">
          {/* Robot A */}
          <div className={`flex justify-between items-center px-3 py-2 transition-all border-2 ${
            isWinnerA
              ? `${phase.accent} text-cb-black-pure border-transparent shadow-[3px_3px_0_#000]`
              : 'bg-[#0a0a0a] text-cb-white-tech border-neutral-800'
          }`}>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-tech font-black uppercase truncate">{match.robotA?.name || 'TBD'}</p>
              <p className={`text-[10px] font-tech truncate ${isWinnerA ? 'text-black/60' : 'text-neutral-500'}`}>
                {match.robotA?.Institution?.name || '-'}
              </p>
            </div>
            <span className="font-tech font-black text-sm ml-2">{match.scoreA}</span>
          </div>

          {/* Robot B */}
          <div className={`flex justify-between items-center px-3 py-2 transition-all border-2 ${
            isWinnerB
              ? `${phase.accent} text-cb-black-pure border-transparent shadow-[3px_3px_0_#000]`
              : 'bg-[#0a0a0a] text-cb-white-tech border-neutral-800'
          }`}>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-tech font-black uppercase truncate">{match.robotB?.name || 'TBD'}</p>
              <p className={`text-[10px] font-tech truncate ${isWinnerB ? 'text-black/60' : 'text-neutral-500'}`}>
                {match.robotB?.Institution?.name || '-'}
              </p>
            </div>
            <span className="font-tech font-black text-sm ml-2">{match.scoreB}</span>
          </div>
        </div>

        {/* Connector Line */}
        {match.nextMatchId && (
          <div className={`absolute top-1/2 -translate-y-1/2 flex items-center ${side === 'left' ? '-right-8' : '-left-8'}`}>
            <div className={`h-0.5 w-8 ${match.isFinished ? phase.accent : 'bg-neutral-700'}`} />
            <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 border-2 ${match.isFinished ? phase.border : 'border-neutral-700'} bg-[#111] ${side === 'left' ? 'right-0' : 'left-0'}`} />
          </div>
        )}
      </motion.div>
    );
  };

  // === ROUND COLUMN ===
  const RoundColumn = ({ side, round, matchIds }: { side: 'left' | 'right', round: string, matchIds: string[] }) => {
    const colMatches = matchIds.map(id => matchMap.get(id)!).filter(m => m && m.round === round);
    if (colMatches.length === 0) return null;
    const phase = getPhaseColor(round);

    return (
      <div className="flex flex-col justify-around h-full gap-4 relative">
        {/* Round Label */}
        <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-tech font-black uppercase tracking-[0.3em] ${phase.text} whitespace-nowrap`}>
          {round}
        </div>
        {colMatches.map((m) => (
          <div key={m.id} className="relative flex items-center justify-center p-2">
            <MatchNode match={m} side={side} />
          </div>
        ))}
      </div>
    );
  };

  // === PHASE LEGEND ===
  const PhaseLegend = () => {
    const activeRounds = [...new Set(filteredMatches.map(m => m.round))];
    const allRounds = [...roundOrder, 'FINAL'].filter(r => activeRounds.includes(r));

    return (
      <div className="flex items-center gap-3 flex-wrap">
        {allRounds.map(r => {
          const phase = getPhaseColor(r);
          return (
            <div key={r} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 ${phase.accent}`} />
              <span className="text-[9px] font-tech font-black uppercase tracking-widest text-neutral-400">{r}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-cb-black-pure flex flex-col overflow-hidden relative">
      {/* Noise Overlay */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none z-50" />

      {/* Header */}
      <header className="px-8 py-4 bg-[#0a0a0a] border-b-3 border-cb-yellow-neon z-30 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <img src="/logo-yellow.png" alt="CatoBots" className="h-12 w-auto object-contain" />
          <div>
            <h1 className="text-2xl font-tech font-black uppercase tracking-wider text-cb-white-tech leading-none">
              Llaves del <span className="text-cb-yellow-neon">Torneo</span>
            </h1>
            <p className="text-[10px] font-tech font-bold text-neutral-500 uppercase tracking-widest mt-0.5">CatoBots IV Edición — Clasificación en Vivo</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <PhaseLegend />
          <div className="w-px h-8 bg-neutral-700" />
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 font-tech font-black text-[10px] uppercase tracking-widest transition-all duration-75 border-2 ${
                  selectedCategory === cat
                    ? 'bg-cb-yellow-neon text-cb-black-pure border-cb-black-pure shadow-[3px_3px_0_#10B961]'
                    : 'text-neutral-500 border-neutral-700 hover:text-cb-yellow-neon hover:border-cb-yellow-neon'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Bracket Area */}
      <main className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        {rootMatch ? (
          <div className="w-full h-full flex items-center justify-between gap-0 max-w-[1920px] mx-auto overflow-hidden">

            {/* LEFT SIDE BRACKET */}
            <div className="flex h-full items-center gap-1">
              {roundOrder.filter(r => sides.left.some(id => matchMap.get(id)?.round === r)).map(r => (
                <RoundColumn key={r} side="left" round={r} matchIds={sides.left} />
              ))}
            </div>

            {/* CENTERPIECE: FINAL */}
            <div className="flex flex-col items-center justify-center gap-8 w-[26rem] z-20 px-6 relative">

              {/* Trophy Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-cb-yellow-neon/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

              {/* Trophy Animation */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="relative"
              >
                <Trophy size={72} className={`${rootMatch.isFinished ? 'text-cb-yellow-neon drop-shadow-[0_0_30px_rgba(255,234,0,0.5)]' : 'text-neutral-700'}`} />
              </motion.div>

              {/* Final Card */}
              <div className={`w-full bg-[#111] border-4 ${rootMatch.isFinished ? 'border-cb-yellow-neon shadow-[0_0_40px_rgba(255,234,0,0.2)]' : 'border-neutral-700'} p-6 relative`}>

                {/* Finalist A */}
                <div className={`p-5 transition-all relative border-3 mb-3 ${
                  rootMatch.winnerId === rootMatch.robotA?.id
                    ? 'bg-cb-yellow-neon text-cb-black-pure border-cb-black-pure shadow-[4px_4px_0_#10B961]'
                    : 'bg-[#0a0a0a] border-neutral-800'
                }`}>
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-tech font-black uppercase tracking-widest mb-1 ${rootMatch.winnerId === rootMatch.robotA?.id ? 'text-black/50' : 'text-neutral-600'}`}>Finalista A</span>
                    <p className="text-xl font-tech font-black uppercase tracking-tight">{rootMatch.robotA?.name || 'TBD'}</p>
                    <p className={`text-[10px] font-tech font-bold mt-1 ${rootMatch.winnerId === rootMatch.robotA?.id ? 'text-black/60' : 'text-neutral-500'}`}>{rootMatch.robotA?.institution || '-'}</p>
                    <p className="text-5xl font-tech font-black mt-3 leading-none">{rootMatch.scoreA}</p>
                  </div>
                  {rootMatch.winnerId === rootMatch.robotA?.id && <Crown className="absolute -top-3 -left-3 text-cb-yellow-neon drop-shadow-md rotate-[-30deg]" fill="currentColor" size={28} />}
                </div>

                {/* VS Bar */}
                <div className="flex items-center gap-4 py-2">
                  <div className="h-0.5 flex-1 bg-neutral-800" />
                  <span className="text-sm font-tech font-black text-cb-yellow-neon uppercase tracking-widest">Final</span>
                  <div className="h-0.5 flex-1 bg-neutral-800" />
                </div>

                {/* Finalist B */}
                <div className={`p-5 transition-all relative border-3 mt-3 ${
                  rootMatch.winnerId === rootMatch.robotB?.id
                    ? 'bg-cb-yellow-neon text-cb-black-pure border-cb-black-pure shadow-[4px_4px_0_#10B961]'
                    : 'bg-[#0a0a0a] border-neutral-800'
                }`}>
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-tech font-black uppercase tracking-widest mb-1 ${rootMatch.winnerId === rootMatch.robotB?.id ? 'text-black/50' : 'text-neutral-600'}`}>Finalista B</span>
                    <p className="text-xl font-tech font-black uppercase tracking-tight">{rootMatch.robotB?.name || 'TBD'}</p>
                    <p className={`text-[10px] font-tech font-bold mt-1 ${rootMatch.winnerId === rootMatch.robotB?.id ? 'text-black/60' : 'text-neutral-500'}`}>{rootMatch.robotB?.institution || '-'}</p>
                    <p className="text-5xl font-tech font-black mt-3 leading-none">{rootMatch.scoreB}</p>
                  </div>
                  {rootMatch.winnerId === rootMatch.robotB?.id && <Crown className="absolute -top-3 -right-3 text-cb-yellow-neon drop-shadow-md rotate-[30deg]" fill="currentColor" size={28} />}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE BRACKET */}
            <div className="flex h-full items-center gap-1">
              {roundOrder.filter(r => sides.right.some(id => matchMap.get(id)?.round === r)).reverse().map(r => (
                <RoundColumn key={r} side="right" round={r} matchIds={sides.right} />
              ))}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center max-w-sm text-center">
            <div className="w-32 h-32 bg-neutral-900 border-3 border-neutral-700 flex items-center justify-center mb-8 animate-pulse">
              <Trophy size={48} className="text-neutral-600" />
            </div>
            <h3 className="text-2xl font-tech font-black uppercase text-neutral-500 tracking-wider">Circuito Preparado</h3>
            <p className="text-[10px] font-tech font-bold text-neutral-600 uppercase tracking-widest mt-3 leading-relaxed">Esperando la generación de llaves para esta categoría.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-8 py-2 bg-[#0a0a0a] border-t border-neutral-800 flex justify-between items-center">
        <span className="text-[9px] font-tech font-bold text-neutral-600 uppercase tracking-widest">CatoBots IV — powered by TEOBU S.A</span>
        <span className="text-[9px] font-tech font-bold text-neutral-600 uppercase tracking-widest">Actualización en tiempo real</span>
      </footer>
    </div>
  );
};

export default Brackets;
