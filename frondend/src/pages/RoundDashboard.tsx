import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Bot, Star, LayoutGrid, LayoutList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import type { MatchState } from '../App';

interface RoundDashboardProps {
  matches: MatchState[];
}

export default function RoundDashboard({ matches }: RoundDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sponsors, setSponsors] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/sponsors')
      .then(res => res.json())
      .then(setSponsors)
      .catch(console.error);
  }, []);

  // Filter round-based categories
  const roundBasedMatches = useMemo(() => {
    return matches.filter((m: MatchState) => {
      const cat = (m.category || "").toLowerCase();
      const isRoundCat = cat.includes("laberinto") || 
                       cat.includes("seguidor") || 
                       cat.includes("biobot") || 
                       cat.includes("innovaci");
      const isRoundStyle = !m.robotB && m.robotA;
      // Requisito: Solo mostrar match si tiene al menos el robot principal asignado
      return (isRoundCat || isRoundStyle) && m.robotA;
    });
  }, [matches]);

  const categories = useMemo(() => {
    const cats = new Set(roundBasedMatches.map((m: MatchState) => m.category).filter(Boolean));
    return Array.from(cats);
  }, [roundBasedMatches]);

  const levels = useMemo(() => {
    const rs = new Set(roundBasedMatches
      .filter((m: MatchState) => selectedCategory === 'all' || m.category === selectedCategory)
      .map((m: MatchState) => m.level || "")
      .filter(Boolean));
    return Array.from(rs);
  }, [roundBasedMatches, selectedCategory]);

  const filteredMatches = useMemo(() => {
    const filtered = roundBasedMatches.filter((m: MatchState) => {
      const matchesCat = selectedCategory === "all" || m.category === selectedCategory;
      const matchesLvl = selectedLevel === "all" || m.level === selectedLevel;
      return matchesCat && matchesLvl;
    });

    return filtered.sort((a: MatchState, b: MatchState) => {
      if (a.scoreA === 0) return 1;
      if (b.scoreA === 0) return -1;
      return a.scoreA - b.scoreA;
    });
  }, [roundBasedMatches, selectedCategory, selectedLevel]);

  const activeRobot = useMemo(() => 
    filteredMatches.find((m: MatchState) => m.isActive) || null,
  [filteredMatches]);

  useEffect(() => {
    if (selectedCategory !== 'all' && !categories.includes(selectedCategory)) {
        setSelectedCategory("all");
    }
  }, [categories, selectedCategory]);

  return (
    <div className="h-screen w-screen bg-cb-black-pure text-cb-white-tech flex flex-col overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-cb-yellow-neon/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-cb-green-vibrant/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 bg-[#0a0a0a] border-b-4 border-cb-yellow-neon z-30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo-yellow.png" alt="CatoBots" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl md:text-2xl font-tech font-black uppercase tracking-wider leading-none">
              Ranking <span className="text-cb-yellow-neon">Rondas</span>
            </h1>
            <p className="text-[10px] font-tech font-bold text-neutral-500 uppercase tracking-widest mt-0.5">Arena de Habilidad y Tiempos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 border-2 border-cb-white-tech text-[10px] font-tech font-black uppercase text-cb-white-tech hover:bg-cb-white-tech hover:text-cb-black-pure transition-all mr-4 shadow-block-sm focus:outline-none"
          >
             <LayoutGrid size={14} /> Vista Batallas
          </Link>

          <div className="flex gap-1.5 p-1 bg-cb-black-pure border border-neutral-800">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-1.5 transition-all ${viewMode === 'grid' ? 'bg-cb-yellow-neon text-cb-black-pure' : 'text-neutral-500 hover:text-cb-white-tech'}`}
             >
                <LayoutGrid size={18} />
             </button>
             <button 
               onClick={() => setViewMode('table')}
               className={`p-1.5 transition-all ${viewMode === 'table' ? 'bg-cb-yellow-neon text-cb-black-pure' : 'text-neutral-500 hover:text-cb-white-tech'}`}
             >
                <LayoutList size={18} />
             </button>
          </div>
          <div className="w-px h-8 bg-neutral-800 mx-1" />
          <div className="flex gap-2">
            <select 
               value={selectedCategory}
               onChange={e => setSelectedCategory(e.target.value)}
               className="bg-[#111] border-2 border-neutral-700 text-xs font-tech font-black text-cb-white-tech uppercase px-4 py-2 focus:border-cb-yellow-neon outline-none"
            >
               <option value="all">TODAS LAS CAT.</option>
               {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
            {levels.length > 1 && (
               <select 
                 value={selectedLevel}
                 onChange={e => setSelectedLevel(e.target.value)}
                 className="bg-[#111] border-2 border-neutral-700 text-xs font-tech font-black text-cb-white-tech uppercase px-4 py-2 focus:border-cb-yellow-neon outline-none"
               >
                 <option value="all">TODOS LOS NIVELES</option>
                 {levels.map((l: string) => <option key={l} value={l}>{l}</option>)}
               </select>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
        {/* Active robot banner */}
        <AnimatePresence mode="wait">
          {activeRobot && (
            <motion.div 
               initial={{ y: -50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: -50, opacity: 0 }}
               className="bg-cb-yellow-neon p-4 flex items-center justify-between border-4 border-cb-black-pure shadow-block-sm overflow-hidden relative"
            >
               <div className="absolute left-0 top-0 bottom-0 w-2 bg-cb-black-pure" />
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-cb-black-pure text-cb-yellow-neon flex items-center justify-center border-4 border-cb-black-pure shadow-[4px_4px_0_#FFF]">
                     <Zap size={32} />
                  </div>
                  <div>
                     <p className="text-[10px] font-tech font-black text-cb-black-pure/60 uppercase tracking-widest">En Pista Ahora</p>
                     <h2 className="text-3xl font-tech font-black text-cb-black-pure uppercase leading-none">{activeRobot.robotA?.name}</h2>
                     <p className="text-xs font-tech font-bold text-cb-black-pure uppercase mt-1">{activeRobot.robotA?.institution}</p>
                  </div>
               </div>

               <div className="text-right mr-4 relative z-10">
                  <p className="text-[10px] font-tech font-black text-cb-black-pure/60 uppercase">Ronda Actual</p>
                  <p className="text-2xl font-tech font-black text-cb-black-pure uppercase">{activeRobot.round}</p>
               </div>
               
               {/* Animated Background Line */}
               <div className="absolute inset-0 bg-warning-tape opacity-10 -rotate-1 pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ranking List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredMatches.map((m: MatchState, idx: number) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-[#0a0a0a] border-2 transition-all group ${m.isActive ? 'border-cb-yellow-neon bg-cb-yellow-neon/5' : 'border-neutral-800 hover:border-neutral-700'}`}
                >
                  <div className="p-4 space-y-3">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                           <div className={`w-6 h-6 flex items-center justify-center font-tech font-black text-xs ${idx === 0 && m.scoreA > 0 ? 'bg-cb-yellow-neon text-cb-black-pure' : 'bg-neutral-800 text-neutral-400'}`}>
                             {idx + 1}
                           </div>
                           <span className="text-[9px] font-tech font-black uppercase text-neutral-500 tracking-tighter">{m.category}</span>
                        </div>
                        {m.scoreA > 0 && idx === 0 && <Star size={14} className="text-cb-yellow-neon fill-cb-yellow-neon" />}
                     </div>

                     <div>
                        <h4 className="text-lg font-tech font-black uppercase text-cb-white-tech truncate group-hover:text-cb-yellow-neon transition-colors">{m.robotA?.name}</h4>
                        <p className="text-[10px] font-tech text-neutral-500 uppercase truncate">{m.robotA?.institution}</p>
                     </div>

                     <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
                        <div>
                           <p className="text-[8px] font-tech font-black text-neutral-600 uppercase">Mejor Marca</p>
                           <p className={`text-xl font-tech font-black leading-none ${m.scoreA > 0 ? 'text-cb-green-vibrant' : 'text-neutral-700'}`}>
                              {m.scoreA > 0 ? `${m.scoreA.toFixed(2)}s` : "---"}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-tech font-black text-neutral-600 uppercase">Estado</p>
                           <p className={`text-[10px] font-tech font-black uppercase ${m.isFinished ? 'text-neutral-400' : (m.isActive ? 'text-cb-yellow-neon' : 'text-neutral-600')}`}>
                              {m.isFinished ? 'Concluido' : (m.isActive ? 'En Pista' : 'Pendiente')}
                           </p>
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border-2 border-neutral-800 overflow-hidden">
               <table className="w-full text-left font-tech uppercase">
                  <thead className="bg-[#111] border-b-2 border-neutral-800 text-[10px] text-neutral-500 font-black tracking-widest">
                     <tr>
                        <th className="px-6 py-4 w-16">#</th>
                        <th className="px-6 py-4">Robot</th>
                        <th className="px-6 py-4">Institución</th>
                        <th className="px-6 py-4">Categoría</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Mejor Marca</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                     {filteredMatches.map((m: MatchState, idx: number) => (
                        <tr key={m.id} className={`hover:bg-white/[0.02] transition-colors ${m.isActive ? 'bg-cb-yellow-neon/5' : ''}`}>
                           <td className="px-6 py-4">
                              <span className={`text-xs font-black ${idx === 0 && m.scoreA > 0 ? 'text-cb-yellow-neon' : 'text-neutral-500'}`}>{idx + 1}</span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 {idx === 0 && m.scoreA > 0 && <Trophy size={14} className="text-cb-yellow-neon" />}
                                 <span className={`text-sm font-black ${m.isActive ? 'text-cb-yellow-neon' : 'text-cb-white-tech'}`}>{m.robotA?.name}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-xs text-neutral-400 font-bold">{m.robotA?.institution}</td>
                           <td className="px-6 py-4 text-[10px] text-neutral-500 font-black">{m.category} / {m.level}</td>
                           <td className="px-6 py-4">
                             <span className={`text-[9px] font-black px-2 py-0.5 border ${m.isActive ? 'border-cb-yellow-neon text-cb-yellow-neon' : (m.isFinished ? 'border-neutral-700 text-neutral-500' : 'border-neutral-800 text-neutral-600')}`}>
                                {m.isActive ? 'EN PISTA' : (m.isFinished ? 'CONCLUIDO' : 'PENDIENTE')}
                             </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <span className={`text-lg font-black ${m.scoreA > 0 ? 'text-cb-green-vibrant' : 'text-neutral-800'}`}>
                                 {m.scoreA > 0 ? `${m.scoreA.toFixed(2)}s` : "---"}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}

          {filteredMatches.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-700 border-4 border-dashed border-neutral-900 rounded-lg">
               <Bot size={48} className="mb-4 opacity-10" />
               <p className="font-tech font-black uppercase tracking-[.3em] opacity-30 text-sm">Sin Robots Registrados</p>
            </div>
          )}
        </div>
      </main>

      {/* Sponsors Carousel */}
      <footer className="h-16 md:h-20 bg-cb-black-pure border-t-2 border-neutral-800 relative z-30 flex items-center overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-cb-black-pure to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-cb-black-pure to-transparent z-10" />
        
        <div className="flex whitespace-nowrap animate-marquee items-center gap-8 md:gap-16 px-4">
          {[...sponsors, ...sponsors].map((sponsor, idx) => (
            <div key={`${sponsor.id}-${idx}`} className="flex items-center gap-4 group">
              {sponsor.logo && (
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.name} 
                  className="h-8 md:h-10 w-auto grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all opacity-80" 
                />
              )}
              <span className="text-cb-white-tech font-tech font-black text-[10px] md:text-sm uppercase tracking-tighter opacity-50 group-hover:opacity-100">
                {sponsor.name}
              </span>
            </div>
          ))}
          {(!sponsors || sponsors.length === 0) && (
             <span className="text-cb-white-tech font-tech font-bold text-[10px] uppercase opacity-20 tracking-widest">
                CatoBots Arena IV Edición • Competencia Nacional de Robótica • Transmisión Oficial • Arena IV Edición
             </span>
          )}
        </div>
      </footer>
    </div>
  );
}
