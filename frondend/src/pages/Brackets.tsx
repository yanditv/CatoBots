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

  const MatchNode = ({ match, side }: { match: Match, side: 'left' | 'right' }) => {
    const isWinnerA = match.isFinished && match.winnerId === match.robotA?.id;
    const isWinnerB = match.isFinished && match.winnerId === match.robotB?.id;

    return (
      <motion.div
        layout
        className={`relative w-48 sm:w-56 bg-white border-2 rounded-lg shadow-xl overflow-hidden transition-all duration-500 z-10 ${match.isFinished ? 'border-neutral-100' : 'border-brand ring-4 ring-brand/10'
          }`}
      >
        <div className={`px-3 py-1 flex justify-center items-center text-xs font-black uppercase ${match.isFinished ? 'bg-neutral-50 text-neutral-400' : 'bg-brand text-white'
          }`}>
          <span>{match.round}</span>
          {!match.isFinished && <div className="flex items-center gap-1.5 animate-pulse"><Zap size={10} fill="currentColor" /> VIVO</div>}
        </div>
        <div className="p-2 space-y-1.5 bg-white">
          <div className={`flex justify-between items-center px-3 py-2 rounded-xl transition-all ${isWinnerA ? 'bg-brand text-white shadow-lg' : 'bg-neutral-50 text-neutral-600'
            }`}>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase truncate">{match.robotA?.name || 'TBD'}</p>
              <p className={`text-xs font-bold truncate ${isWinnerA ? 'text-white/80' : 'text-neutral-400'}`}>
                {match.robotA?.Institution?.name || '-'}
              </p>
            </div>
            <span className="font-mono font-black text-sm ml-2">{match.scoreA}</span>
          </div>
          <div className={`flex justify-between items-center px-3 py-2 rounded-xl transition-all ${isWinnerB ? 'bg-brand text-white shadow-lg' : 'bg-neutral-50 text-neutral-600'
            }`}>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase truncate">{match.robotB?.name || 'TBD'}</p>
              <p className={`text-xs font-bold truncate ${isWinnerB ? 'text-white/80' : 'text-neutral-400'}`}>
                {match.robotB?.Institution?.name || '-'}
              </p>
            </div>
            <span className="font-mono font-black text-sm ml-2">{match.scoreB}</span>
          </div>
        </div>

        {/* Flow Connectors */}
        {match.nextMatchId && (
          <div className={`absolute top-1/2 -translate-y-1/2 flex items-center ${side === 'left' ? '-right-10' : '-left-10'}`}>
            {/* Horizontal Line out */}
            <div className={`h-0.5 bg-neutral-200 ${match.isFinished ? 'bg-brand/30' : ''} ${side === 'left' ? 'w-10' : 'w-10'}`}></div>

            {/* Vertical fork indicator */}
            <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-neutral-200 bg-white ${match.isFinished ? 'border-brand' : ''} ${side === 'left' ? 'right-0' : 'left-0'}`}></div>
          </div>
        )}
      </motion.div>
    );
  };

  const RoundColumn = ({ side, round, matchIds }: { side: 'left' | 'right', round: string, matchIds: string[] }) => {
    const colMatches = matchIds.map(id => matchMap.get(id)!).filter(m => m && m.round === round);
    if (colMatches.length === 0) return null;

    return (
      <div className="flex flex-col justify-around h-full gap-4 relative">
        {colMatches.map((m) => (
          <div key={m.id} className="relative flex items-center justify-center p-2">
            <MatchNode match={m} side={side} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-neutral-100 flex flex-col overflow-hidden font-sans relative">
      <header className="px-8 py-4 bg-white/90 backdrop-blur-2xl border-b z-30 flex justify-between items-center shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-6">
          <div className="text-black px-5 py-2.5 rounded-2xl transform hover:scale-105 transition-transform cursor-default">
            <h1 className="text-2xl font-black tracking-tighter leading-none">
              Cato<span className="text-brand">Bots IV</span>
            </h1>
          </div>
        </div>

        <div className="flex p-1.5 rounded-2xl gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedCategory === cat
                  ? 'bg-white text-black shadow-lg shadow-black/5 ring-1 ring-black/5'
                  : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        {rootMatch ? (
          <div className="w-full h-full flex items-center justify-between gap-0 max-w-[1920px] mx-auto overflow-hidden">

            {/* LEFT SIDE BRACKET */}
            <div className="flex h-full items-center">
              {roundOrder.filter(r => sides.left.some(id => matchMap.get(id)?.round === r)).map(r => (
                <RoundColumn key={r} side="left" round={r} matchIds={sides.left} />
              ))}
            </div>

            {/* CENTERPIECE: THE FINALISTS & TROPHY */}
            <div className="flex flex-col items-center justify-center gap-12 w-[28rem] z-20 px-8 relative">

              {/* Visual Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-brand/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

              <div className="relative text-center w-full">
                {/* Final Header */}
                <div className="absolute -top-25 left-1/2 -translate-x-1/2 flex flex-col items-center w-full">
                  <motion.div
                    animate={{
                      y: [0, -12, 0],
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, 0, -2, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  >
                    <Trophy size={80} className={`${rootMatch.isFinished ? 'text-yellow-400 drop-shadow-[0_0_30px_rgba(255,191,0,0.4)]' : 'text-brand/30'}`} />
                  </motion.div>
                </div>

                {/* Main Final Card */}
                <div className={`bg-white p-8 rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border-[6px] transition-all relative z-10 ${rootMatch.isFinished ? 'border-brand' : 'border-neutral-50'}`}>
                  <div className="space-y-8">
                    {/* Finalist A */}
                    <div className={`p-6 rounded-[2.5rem] transition-all relative ${rootMatch.winnerId === rootMatch.robotA?.id ? 'bg-brand text-white scale-110 shadow-2xl shadow-brand/30' : 'bg-neutral-50'}`}>
                      <div className="flex flex-col items-center">
                        <span className={`text-md font-black uppercase mb-2 ${rootMatch.winnerId === rootMatch.robotA?.id ? 'text-white/60' : 'text-neutral-400'}`}>Finalista A</span>
                        <p className="text-xl font-black uppercase tracking-tight text-neutral-700">{rootMatch.robotA?.name || 'TBD'}</p>
                        <p className={`text-md font-bold mt-1 opacity-70 ${rootMatch.winnerId === rootMatch.robotA?.id ? 'text-white' : 'text-neutral-500'}`}>{rootMatch.robotA?.institution || '-'}</p>
                        <p className="text-6xl font-black mt-4 font-mono leading-none text-neutral-700">{rootMatch.scoreA}</p>
                      </div>
                      {rootMatch.winnerId === rootMatch.robotA?.id && <Crown className="absolute -top-1 -left-1 text-yellow-400 drop-shadow-md rotate-[-30deg]" fill="currentColor" size={32} />}
                    </div>

                    {/* Bridge */}
                    <div className="flex items-center gap-6 px-4">
                      <div className="h-0.5 flex-1 bg-neutral-100"></div>
                      <span className="text-lg font-black text-neutral-600 italic">FINAL</span>
                      <div className="h-0.5 flex-1 bg-neutral-100"></div>
                    </div>

                    {/* Finalist B */}
                    <div className={`p-6 rounded-[2.5rem] transition-all relative ${rootMatch.winnerId === rootMatch.robotB?.id ? 'bg-brand text-white scale-110 shadow-2xl shadow-brand/30' : 'bg-neutral-50'}`}>
                      <div className="flex flex-col items-center">
                        <span className={`text-md font-black uppercase mb-2 ${rootMatch.winnerId === rootMatch.robotB?.id ? 'text-white' : 'text-neutral-400'}`}>Finalista B</span>
                        <p className="text-xl font-black uppercase tracking-tight text-neutral-700">{rootMatch.robotB?.name || 'TBD'}</p>
                        <p className={`text-md font-bold mt-1 opacity-70 ${rootMatch.winnerId === rootMatch.robotB?.id ? 'text-white' : 'text-neutral-500'}`}>{rootMatch.robotB?.institution || '-'}</p>
                        <p className="text-6xl font-black mt-4 font-mono leading-none text-neutral-700">{rootMatch.scoreB}</p>
                      </div>
                      {rootMatch.winnerId === rootMatch.robotB?.id && <Crown className="absolute -top-1 -right-1 text-yellow-400 drop-shadow-md rotate-[30deg]" fill="currentColor" size={32} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE BRACKET */}
            <div className="flex h-full items-center">
              {roundOrder.filter(r => sides.right.some(id => matchMap.get(id)?.round === r)).reverse().map(r => (
                <RoundColumn key={r} side="right" round={r} matchIds={sides.right} />
              ))}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center max-w-sm text-center">
            <div className="w-32 h-32 bg-neutral-200/50 rounded-[3rem] flex items-center justify-center mb-8 animate-pulse">
              <Trophy size={48} className="text-neutral-300" />
            </div>
            <h3 className="text-2xl font-black uppercase text-neutral-300 tracking-tight">Circuito Preparado</h3>
            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mt-2 leading-relaxed">Esperando la generación de llaves para esta categoría.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Brackets;
