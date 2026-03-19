import { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Shuffle,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MatchState } from "../../App";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useAuth } from "../../context/AuthContext";

interface RoundControlProps {
  matches: MatchState[];
}

export const RoundControl = ({ matches }: RoundControlProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "warning" | "info" | "danger" | "success";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "warning" | "info" | "danger" | "success" = "warning",
  ) => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm });
  };

  // Filter only round-based categories AND assigned to this referee
  const roundBasedMatches = useMemo(() => {
    return matches.filter(m => {
        const matchesReferee = m.refereeId === user?.id;
        const cat = (m.category || "").toLowerCase();
        const matchesType = cat.includes("laberinto") || 
               cat.includes("seguidor") || 
               cat.includes("biobot") || 
               cat.includes("innovaci");
        return matchesReferee && matchesType;
    });
  }, [matches, user?.id]);

  const categories = useMemo(() => {
    const cats = new Set(roundBasedMatches.map(m => m.category));
    return Array.from(cats);
  }, [roundBasedMatches]);

  const rounds = useMemo(() => {
    const rs = new Set(roundBasedMatches.filter(m => categoryFilter === 'all' || m.category === categoryFilter).map(m => m.round));
    return Array.from(rs);
  }, [roundBasedMatches, categoryFilter]);

  const filteredMatches = useMemo(() => {
    return roundBasedMatches.filter(m => {
        const matchesSearch = (m.robotA?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = categoryFilter === "all" || m.category === categoryFilter;
        const matchesRound = roundFilter === "all" || m.round === roundFilter;
        return matchesSearch && matchesCat && matchesRound;
    });
  }, [roundBasedMatches, searchTerm, categoryFilter, roundFilter]);

  const handleShuffle = () => {
    const pending = filteredMatches.filter(m => !m.isFinished);
    if (pending.length === 0) {
        openConfirm("Sin Robots Pendientes", "Todos los robots en este grupo ya han pasado por la pista.", () => {}, "info");
        return;
    }
    
    const randomMatch = pending[Math.floor(Math.random() * pending.length)];
    openConfirm(
      "Resultado del Sorteo",
      `¡El robot seleccionado para pasar es: ${randomMatch.robotA?.name}!`,
      () => {
        // Find match in list and scroll/highlight? 
        // For now just show the name.
      },
      "success"
    );
  };

  return (
    <div className="min-h-screen bg-cb-green-vibrant bg-noise p-2 md:p-6 sm:p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate("/referee")}
          className="flex items-center gap-2 text-cb-black-pure font-tech font-black text-xs uppercase mb-4 hover:opacity-70 transition-all"
        >
          <ChevronLeft size={16} strokeWidth={3} /> Volver a mi lista
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-cb-black-pure pb-6">
           <div>
              <h1 className="text-3xl md:text-5xl text-cb-black-pure font-tech font-black uppercase italic leading-none">
                Gestión de <span className="bg-cb-black-pure text-cb-yellow-neon px-2">Rondas</span>
              </h1>
              <p className="text-xs font-tech font-bold text-cb-black-pure/70 uppercase mt-2">
                 Categorías por tiempos e intentos reglamentarios
              </p>
           </div>
           
           <button 
             onClick={handleShuffle}
             className="bg-cb-black-pure text-cb-yellow-neon px-8 py-4 border-4 border-cb-black-pure font-tech font-black uppercase shadow-[6px_6px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
           >
             <Shuffle size={20} /> Sorteo de Turno
           </button>
        </div>
      </header>

      {/* Filters & Search */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
         <aside className="lg:col-span-1 space-y-4">
            <div className="bg-cb-white-tech border-4 border-cb-black-pure p-4 shadow-block-sm">
               <h3 className="text-xs font-tech font-black uppercase text-cb-black-pure mb-3 flex items-center gap-2">
                  <Filter size={14} /> Filtros de Lista
               </h3>
               
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-tech font-black text-neutral-500 uppercase">Buscar Robot</label>
                    <div className="mt-1 relative">
                        <input 
                          type="text" 
                          placeholder="NOMBRE..." 
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full bg-white border-2 border-cb-black-pure p-2 font-tech text-sm focus:outline-none focus:ring-2 focus:ring-cb-yellow-neon"
                        />
                        <Search className="absolute right-2 top-2 text-neutral-400" size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-tech font-black text-neutral-500 uppercase">Categoría</label>
                    <select 
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="w-full mt-1 bg-white border-2 border-cb-black-pure p-2 font-tech text-xs uppercase"
                    >
                        <option value="all">Todas</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-tech font-black text-neutral-500 uppercase">Ronda</label>
                    <select 
                      value={roundFilter}
                      onChange={e => setRoundFilter(e.target.value)}
                      className="w-full mt-1 bg-white border-2 border-cb-black-pure p-2 font-tech text-xs uppercase"
                    >
                        <option value="all">Todas</option>
                        {rounds.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            <div className="bg-cb-black-pure border-4 border-cb-black-pure p-4 shadow-[4px_4px_0_#CBFF00]">
               <h3 className="text-xs font-tech font-black uppercase text-cb-yellow-neon mb-3 italic">Estadísticas de Ronda</h3>
               <div className="grid grid-cols-2 gap-2">
                   <div className="text-center">
                       <p className="text-[8px] font-tech font-black text-neutral-400 uppercase">Participantes</p>
                       <p className="text-2xl font-tech font-black text-white">{filteredMatches.length}</p>
                   </div>
                   <div className="text-center">
                       <p className="text-[8px] font-tech font-black text-cb-green-vibrant/60 uppercase">Listos</p>
                       <p className="text-2xl font-tech font-black text-cb-green-vibrant">{filteredMatches.filter(m => m.isFinished).length}</p>
                   </div>
               </div>
            </div>
         </aside>

         <section className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {filteredMatches.length > 0 ? (
                 filteredMatches.map(m => (
                    <div 
                      key={m.id}
                      className={`group border-4 border-cb-black-pure p-4 shadow-block-sm transition-all duration-150 hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${m.isFinished ? 'bg-neutral-200 opacity-80' : 'bg-cb-white-tech'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[9px] font-tech font-black bg-cb-black-pure text-cb-yellow-neon px-2 py-0.5 border-2 border-cb-black-pure uppercase">
                              {m.category}
                           </span>
                           <span className="text-[9px] font-tech font-black text-cb-black-pure uppercase opacity-40">
                              {m.round}
                           </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <div className={`w-12 h-12 flex items-center justify-center border-4 border-cb-black-pure shadow-[2px_2px_0_#000] rotate-3 group-hover:rotate-0 transition-transform ${m.isFinished ? 'bg-cb-black-pure text-cb-yellow-neon' : 'bg-cb-yellow-neon text-cb-black-pure'}`}>
                              {m.isFinished ? <CheckCircle2 size={24} /> : <Zap size={24} />}
                           </div>
                           <div className="min-w-0">
                              <h4 className="text-xl font-tech font-black text-cb-black-pure uppercase truncate">
                                 {m.robotA?.name || "Sin nombre"}
                              </h4>
                              <p className="text-[10px] font-tech font-bold text-neutral-500 uppercase truncate">
                                 {m.robotA?.institution || "Sin institución"}
                              </p>
                           </div>
                        </div>

                        <div className="mt-4 pt-3 border-t-2 border-cb-black-pure/10 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="text-center">
                                 <p className="text-[8px] font-tech font-bold text-neutral-400 uppercase">Mejor Tiempo</p>
                                 <p className="text-sm font-tech font-black text-cb-black-pure">
                                    {m.scoreA > 0 ? `${m.scoreA.toFixed(2)}s` : "---"}
                                 </p>
                              </div>
                           </div>
                           
                           <button 
                             onClick={() => {
                                // En el referee control se maneja por ID, así que redirigimos y dejamos que se maneje
                                navigate(`/referee?match=${m.id}`);
                             }}
                             className={`px-4 py-2 border-2 border-cb-black-pure font-tech font-black uppercase text-[10px] flex items-center gap-1 transition-all ${m.isFinished ? 'bg-cb-black-pure text-white' : 'bg-cb-black-pure text-cb-yellow-neon hover:bg-cb-yellow-neon hover:text-cb-black-pure'}`}
                           >
                              {m.isFinished ? "Ver Detalles" : "Llamar a Pista"} <ArrowRight size={14} />
                           </button>
                        </div>
                    </div>
                 ))
               ) : (
                 <div className="col-span-full py-20 text-center bg-cb-black-pure/5 border-4 border-dashed border-cb-black-pure rounded-xl">
                    <Zap size={40} className="mx-auto mb-4 text-cb-black-pure opacity-10" />
                    <p className="font-tech font-black uppercase text-cb-black-pure opacity-30 tracking-widest">
                       Sin resultados para los filtros actuales
                    </p>
                 </div>
               )}
            </div>
         </section>
      </main>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type as any}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
};
