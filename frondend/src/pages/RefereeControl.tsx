import { useEffect, useMemo, useState, type ElementType } from "react";
import { ConfirmModal } from "../components/ConfirmModal";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  ShieldAlert,
  Timer,
  ChevronLeft,
  LogOut,
  Terminal,
  Trophy,
  Clock,
  Layers,
} from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import type { MatchState } from "../App";
import { useAuth } from "../context/AuthContext";
import { MinisumoControl } from "./Referee/MinisumoControl";
import { MazeControl } from "./Referee/MazeControl";
import { BioBotsControl } from "./Referee/BioBotsControl";
import { SumoControl } from "./Referee/SumoControl";
import { RobofutControl } from "./Referee/RobofutControl";
import { BattleBotsControl } from "./Referee/BattleBotsControl";

interface RefereeControlProps {
  matches: MatchState[];
  onControl: (matchId: string, action: string, payload?: any) => void;
}

type MatchVisualStatus = "LIVE" | "READY" | "PENDING" | "FINISHED";

const getMatchVisualStatus = (match: MatchState): MatchVisualStatus => {
  if (match.isFinished) return "FINISHED";
  if (match.isActive) return "LIVE";
  if (match.robotA && match.robotB) return "READY";
  return "PENDING";
};

const statusConfig: Record<
  MatchVisualStatus,
  { label: string; className: string }
> = {
  LIVE: {
    label: "En competencia",
    className: "bg-red-600 text-white border-red-800",
  },
  READY: {
    label: "Listo para iniciar",
    className: "bg-cb-yellow-neon text-cb-black-pure border-cb-black-pure",
  },
  PENDING: {
    label: "Pendiente competidores",
    className: "bg-neutral-300 text-cb-black-pure border-cb-black-pure",
  },
  FINISHED: {
    label: "Finalizado",
    className: "bg-cb-black-pure text-cb-yellow-neon border-cb-black-pure",
  },
};

const normalizePhaseKey = (round?: string | null) => {
  const value = (round || "").trim().toLowerCase();
  if (!value) return "sin-fase";
  if (value.includes("oct")) return "octavos";
  if (
    value.includes("quart") ||
    value.includes("cuart") ||
    value.includes("quarter")
  )
    return "quarters";
  if (value.includes("semi")) return "semis";
  if (value.includes("final")) return "final";
  return value;
};

const phaseLabel: Record<string, string> = {
  octavos: "Octavos",
  quarters: "Quarters",
  semis: "Semis",
  final: "Final",
  "sin-fase": "Sin Fase",
};

const phaseOrder = ["octavos", "quarters", "semis", "final", "sin-fase"];

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
  color = "bg-cb-white-tech",
  textColor = "text-cb-black-pure",
  size = "py-5",
  disabled = false,
}: ActionButtonProps) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`${color} ${textColor} w-full ${size} rounded-none border-3 border-cb-black-pure font-tech font-black uppercase text-xs md:text-sm flex flex-col items-center justify-center gap-1 md:gap-2 active:scale-95 transition-all duration-150 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none`}
  >
    <Icon size={24} strokeWidth={2.5} className="mb-1" />
    <span className="leading-tight text-center px-1">{label}</span>
  </button>
);

 const RefereeControl = ({ matches, onControl }: RefereeControlProps) => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(searchParams.get("match") || null);
  const [phaseFilter, setPhaseFilter] = useState<string>("all");

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "warning" | "info" | "danger";
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
    type: "warning" | "info" | "danger" = "warning",
  ) => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const myMatches = useMemo(
    () => matches.filter((m) => m.refereeId === user?.id),
    [matches, user?.id],
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
    () =>
      phaseFilter === "all"
        ? groupedMatches
        : groupedMatches.filter((group) => group.phase === phaseFilter),
    [groupedMatches, phaseFilter],
  );

   useEffect(() => {
    const mId = searchParams.get("match");
    if (mId) setSelectedMatchId(mId);
  }, [searchParams]);

  useEffect(() => {
    if (
      phaseFilter !== "all" &&
      !groupedMatches.some((group) => group.phase === phaseFilter)
    ) {
      setPhaseFilter("all");
    }
  }, [groupedMatches, phaseFilter]);
  // Mantener el encuentro seleccionado incluso si cambió de estado/asignación
  const allAssignedMatches = matches.filter(
    (m) =>
      m.refereeId === user?.id || (selectedMatchId && m.id === selectedMatchId),
  );
  const selectedMatch = allAssignedMatches.find(
    (m) => m.id === selectedMatchId,
  );
  const selectedStatus = selectedMatch
    ? getMatchVisualStatus(selectedMatch)
    : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!selectedMatch) {
    return (
      <div className="min-h-screen bg-cb-green-vibrant bg-noise p-2 sm:p-4 md:p-8 flex flex-col items-center">
        {/* Header */}
        <header className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-16 sm:w-20 md:w-28 h-auto flex items-center justify-center p-1 sm:p-2 bg-cb-black-pure border-2 border-cb-black-pure shadow-[3px_3px_0_#CBFF00]">
              <img
                src="/logo-yellow.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl text-cb-black-pure font-tech font-black uppercase tracking-tighter leading-none">
                Control <span className="bg-cb-black-pure text-cb-yellow-neon px-1">Árbitro</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-tech font-bold text-cb-black-pure uppercase mt-1 opacity-80">
                Operaciones del Torneo v4.0
              </p>
            </div>
          </div>
           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
             <Link
               to="/referee/rounds"
               className="w-full sm:w-auto px-6 py-3 bg-cb-yellow-neon border-3 border-cb-black-pure text-cb-black-pure hover:bg-white transition-all flex items-center justify-center gap-2 font-tech font-black uppercase text-xs shadow-block-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
             >
               <Layers size={16} strokeWidth={2.5} />
               Gestión de Rondas
             </Link>
             <button
               onClick={logout}
               className="w-full sm:w-auto px-6 py-3 bg-cb-black-pure border-3 border-cb-black-pure text-cb-white-tech hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 font-tech font-black uppercase text-xs shadow-block-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
             >
               <LogOut size={16} strokeWidth={2.5} />
               Cerrar Sesión
             </button>
           </div>
        </header>

        <div className="w-full max-w-4xl flex-1 flex flex-col">
          <h2 className="text-[10px] sm:text-xs font-tech font-black text-cb-black-pure uppercase mb-4 px-1 opacity-60">
            Bitácora de Encuentros Asignados
          </h2>
          
          {/* Quick Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 px-1">
            <div className="bg-cb-white-tech border-2 border-cb-black-pure p-2 md:p-3 shadow-[2px_2px_0_#000]">
                <p className="text-[8px] font-tech font-black text-cb-black-pure/50 uppercase">Asignados</p>
                <p className="text-xl font-tech font-black text-cb-black-pure">{myMatches.length}</p>
            </div>
            <div className="bg-cb-black-pure border-2 border-cb-black-pure p-2 md:p-3 shadow-[2px_2px_0_#CBFF00]">
                <p className="text-[8px] font-tech font-black text-cb-yellow-neon/60 uppercase">En Vivo</p>
                <p className="text-xl font-tech font-black text-cb-yellow-neon">
                  {myMatches.filter((m) => m.isActive && !m.isFinished).length}
                </p>
            </div>
            <div className="bg-neutral-800 border-2 border-cb-black-pure p-2 md:p-3 shadow-[2px_2px_0_#000]">
                <p className="text-[8px] font-tech font-black text-white/50 uppercase">Terminados</p>
                <p className="text-xl font-tech font-black text-white">
                  {myMatches.filter((m) => m.isFinished).length}
                </p>
            </div>
            <div className="bg-cb-yellow-neon border-2 border-cb-black-pure p-2 md:p-3 shadow-[2px_2px_0_#000]">
                <p className="text-[8px] font-tech font-black text-cb-black-pure/50 uppercase">Pendientes</p>
                <p className="text-xl font-tech font-black text-cb-black-pure">
                  {myMatches.filter((m) => !m.isActive && !m.isFinished).length}
                </p>
            </div>
          </div>

          <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max px-1">
              <span className="text-[10px] font-tech font-black uppercase text-cb-black-pure whitespace-nowrap mr-2">
                Filtrar fase:
              </span>
              <button
                onClick={() => setPhaseFilter("all")}
                className={`px-3 py-1.5 border-2 border-cb-black-pure font-tech font-black uppercase text-[10px] transition-all ${phaseFilter === "all" ? "bg-cb-black-pure text-cb-yellow-neon shadow-[3px_3px_0_#CBFF00]" : "bg-cb-white-tech text-cb-black-pure shadow-[2px_2px_0_#000]"}`}
              >
                Todas ({myMatches.length})
              </button>
              {groupedMatches.map((group) => (
                <button
                  key={group.phase}
                  onClick={() => setPhaseFilter(group.phase)}
                  className={`px-3 py-1.5 border-2 border-cb-black-pure font-tech font-black uppercase text-[10px] transition-all ${phaseFilter === group.phase ? "bg-cb-black-pure text-cb-yellow-neon shadow-[3px_3px_0_#CBFF00]" : "bg-cb-white-tech text-cb-black-pure shadow-[2px_2px_0_#000]"}`}
                >
                  {group.label} ({group.matches.length})
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:gap-8 min-h-[40vh] mb-8">
            {myMatches.length > 0 ? (
              filteredGroups.map((phaseGroup) => (
                <section key={phaseGroup.phase} className="space-y-4">
                  <div className="flex items-center gap-3 border-l-8 border-cb-black-pure pl-3">
                    <h3 className="text-sm md:text-lg font-tech font-black uppercase text-cb-black-pure italic tracking-tighter">
                      Fase: {phaseGroup.label}
                    </h3>
                    <div className="h-[2px] flex-1 bg-cb-black-pure/10" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {phaseGroup.matches.map((m) => {
                      const visualStatus = getMatchVisualStatus(m);
                      const status = statusConfig[visualStatus];
                      const hasCompetitors = Boolean(m.robotA && m.robotB);

                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMatchId(m.id)}
                          className="bg-cb-white-tech border-4 border-cb-black-pure p-4 sm:p-5 flex justify-between items-center gap-4 shadow-block-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 group relative overflow-hidden"
                        >
                          {m.isActive && !m.isFinished && (
                              <div className="absolute top-0 right-0 p-1 bg-red-600 text-white font-tech font-black text-[7px] uppercase tracking-widest px-2">LIVE NOW</div>
                          )}
                          <div className="text-left min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                              <span className="text-[8px] md:text-[10px] font-tech font-black text-cb-yellow-neon uppercase bg-cb-black-pure px-2 py-0.5 border-2 border-cb-black-pure">
                                {m.category || "---"}
                              </span>
                              <span className="text-[8px] md:text-[10px] font-tech font-black text-cb-black-pure uppercase bg-transparent px-2 py-0.5 border-2 border-cb-black-pure opacity-40">
                                {m.round || "---"}
                              </span>
                              <span
                                className={`text-[8px] md:text-[10px] font-tech font-black uppercase px-2 py-0.5 border-2 ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <p className="text-lg md:text-xl font-tech font-black text-cb-black-pure group-hover:text-neutral-600 transition-colors truncate">
                                    {m.robotA?.name || "???"}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="h-[1px] w-4 bg-cb-black-pure opacity-30" />
                                    <span className="text-[10px] font-tech font-bold text-cb-black-pure/40 italic">VS</span>
                                    <div className="h-[1px] flex-1 bg-cb-black-pure opacity-30" />
                                </div>
                                <p className="text-lg md:text-xl font-tech font-black text-cb-black-pure group-hover:text-neutral-600 transition-colors truncate">
                                    {m.robotB?.name || "???"}
                                </p>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2 text-[9px] font-tech font-black uppercase">
                              <span className="px-2 py-1 bg-neutral-100 border-2 border-cb-black-pure text-cb-black-pure flex items-center gap-1">
                                <Clock size={10} strokeWidth={3} /> {formatTime(m.timeLeft)}
                              </span>
                              <span className="px-2 py-1 bg-cb-black-pure border-2 border-cb-black-pure text-cb-yellow-neon">
                                RESULT: {m.scoreA} - {m.scoreB}
                              </span>
                              {!hasCompetitors && (
                                <span className="px-2 py-1 bg-red-100 border-2 border-red-200 text-red-600">
                                  WAITING COMPETITORS
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="hidden sm:flex flex-col items-center justify-center p-3 border-2 border-cb-black-pure bg-cb-black-pure text-cb-yellow-neon group-hover:bg-cb-yellow-neon group-hover:text-cb-black-pure transition-colors shrink-0 shadow-[2px_2px_0_#CBFF00]">
                             <ChevronLeft size={18} className="rotate-180" strokeWidth={4} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))
            ) : (
              <div className="p-8 md:p-12 text-center bg-cb-black-pure border-4 border-cb-black-pure shadow-divider">
                <Terminal
                  size={32}
                  className="mx-auto mb-4 text-cb-yellow-neon animate-pulse"
                  strokeWidth={2.5}
                />
                <p className="text-cb-white-tech font-tech font-black uppercase text-sm tracking-widest">
                  STREAMS OFFLINE: NO MATCHES ASSIGNED
                </p>
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


  return (
    <div className="min-h-screen bg-cb-green-vibrant bg-noise p-3 md:p-6 flex flex-col max-w-2xl md:max-w-4xl mx-auto">
      <header className="mb-4 md:mb-6">
        <button
          onClick={() => setSelectedMatchId(null)}
          className="flex items-center gap-2 text-cb-black-pure font-tech font-black text-xs md:text-sm uppercase mb-4 hover:text-cb-yellow-neon transition-colors"
        >
          <ChevronLeft size={16} /> Volver a la lista
        </button>
        <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
          <div>
            <h1 className="text-2xl md:text-4xl text-cb-black-pure font-tech font-black uppercase">
              {selectedMatch.category || "Sin categoría"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-cb-yellow-neon text-cb-black-pure px-3 py-1 border-2 border-cb-black-pure font-tech text-xs font-black uppercase tracking-widest shadow-block-sm">
              {selectedMatch.round || "Sin ronda"}
            </span>
            {selectedStatus && (
              <span
                className={`px-3 py-1 border-2 font-tech text-xs font-black uppercase tracking-widest ${statusConfig[selectedStatus].className}`}
              >
                {statusConfig[selectedStatus].label}
              </span>
            )}
          </div>
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-3 md:gap-4">
          <div
            className={`w-full py-6 md:py-8 font-mono text-5xl md:text-7xl font-black text-center tabular-nums border-4 border-cb-black-pure shadow-block-sm ${selectedMatch.isActive ? "bg-cb-yellow-neon text-cb-black-pure" : "bg-cb-black-pure text-cb-yellow-neon"}`}
          >
            {formatTime(selectedMatch.timeLeft)}
          </div>
          <div className="bg-cb-white-tech border-4 border-cb-black-pure p-3 md:p-4 shadow-block-sm">
            <h3 className="text-xs font-tech font-black uppercase text-cb-black-pure mb-2">
              Información útil
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs font-tech font-black uppercase">
              <div className="border-2 border-cb-black-pure bg-cb-black-pure px-2 py-2 text-cb-yellow-neon flex items-center gap-2">
                <Swords size={14} />
                <span>
                  Score: {selectedMatch.scoreA}-{selectedMatch.scoreB}
                </span>
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
              <div
                className={`col-span-2 border-2 border-cb-black-pure px-2 py-2 flex items-center gap-2 ${hasBothCompetitors ? "bg-cb-yellow-neon text-cb-black-pure" : "bg-neutral-300 text-cb-black-pure"}`}
              >
                <CircleCheckBig size={14} />
                <span>
                  {hasBothCompetitors
                    ? "Competidores listos"
                    : "Competidores incompletos"}
                </span>
              </div>
            </div>
          </div>
        </div> */}
      </header>

      {/* Category Specific Controls */}
      {(() => {
        const cat = (selectedMatch.category || "").toLowerCase();
        if (cat.includes("battlebots") || cat.includes("palitos")) {
          return (
            <BattleBotsControl
              match={selectedMatch}
              onControl={onControl}
              formatTime={formatTime}
            />
          );
        }
        if (cat.includes("minisumo")) {
          return (
            <MinisumoControl
              match={selectedMatch}
              onControl={onControl}
              formatTime={formatTime}
            />
          );
        }
        if (cat.includes("sumo")) {
          return (
            <SumoControl
              match={selectedMatch}
              onControl={onControl}
              formatTime={formatTime}
            />
          );
        }
        if (cat.includes("laberinto") || cat.includes("seguidor")) {
          return (
            <MazeControl
              match={selectedMatch}
              onControl={onControl}
              formatTime={formatTime}
            />
          );
        }
        if (cat.includes("robogut") || cat.includes("robofut") || cat.includes("futbol")) {
          return (
            <RobofutControl
              match={selectedMatch}
              onControl={onControl}
              formatTime={formatTime}
            />
          );
        }
        if (cat.includes("biobot")) {
          return <BioBotsControl match={selectedMatch} onControl={onControl} formatTime={formatTime} />;
        }

        // Fallback (Generic Controls for Robofut, Scratch, etc)
        return (
          <>
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
              <ActionButton
                icon={selectedMatch.isActive ? Pause : Play}
                label={selectedMatch.isActive ? "Pausar" : "Iniciar"}
                color={
                  selectedMatch.isActive
                    ? "bg-red-600 text-white"
                    : "bg-cb-green-vibrant text-cb-black-pure"
                }
                textColor={
                  selectedMatch.isActive ? "text-white" : "text-cb-black-pure"
                }
                onClick={() =>
                  onControl(
                    selectedMatch.id,
                    selectedMatch.isActive ? "PAUSE" : "START",
                  )
                }
              />
              <ActionButton
                icon={Timer}
                label="+30 Seg"
                onClick={() => onControl(selectedMatch.id, "ADD_TIME", 30)}
              />
              <ActionButton
                icon={RotateCcw}
                label="Reiniciar"
                color="bg-cb-black-pure"
                textColor="text-cb-white-tech"
                onClick={() => {
                  openConfirm(
                    "Reiniciar encuentro",
                    "¿Estás seguro de reiniciar el encuentro? Todos los puntajes volverán a cero.",
                    () => onControl(selectedMatch.id, "RESET"),
                    "danger"
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-1">
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex-1 p-3 md:p-6 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm relative overflow-hidden flex flex-col justify-center items-center">
                  <div className="absolute top-0 left-0 w-full h-2 bg-cb-yellow-neon" />
                  <h2 className="text-sm md:text-xl font-tech font-black text-cb-black-pure uppercase truncate px-2 w-full">
                    {selectedMatch.robotA?.name || "Pendiente"}
                  </h2>
                  <p className="text-[10px] md:text-xs font-tech font-bold text-neutral-600 uppercase truncate px-2 mt-1 w-full">
                    {selectedMatch.robotA?.institution || "Sin institución"}
                  </p>
                  <div className="text-6xl md:text-8xl font-tech font-black my-2 md:my-4 text-cb-black-pure drop-shadow-[2px_2px_0_#000]">
                    {selectedMatch.scoreA}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 h-20 md:h-28">
                  <ActionButton
                    icon={Plus}
                    label="Punto"
                    size="h-full"
                    color="bg-cb-black-pure"
                    textColor="text-cb-yellow-neon"
                    onClick={() => onControl(selectedMatch.id, "ADD_SCORE_A")}
                  />
                  <ActionButton
                    icon={ShieldAlert}
                    label="Falta"
                    size="h-full"
                    color="bg-red-600"
                    textColor="text-white"
                    onClick={() => onControl(selectedMatch.id, "ADD_PENALTY_A")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex-1 p-3 md:p-6 bg-cb-gray-industrial border-4 border-cb-black-pure text-center shadow-block-sm relative overflow-hidden flex flex-col justify-center items-center">
                  <h2 className="text-sm md:text-xl font-tech font-black text-cb-white-tech uppercase truncate px-2 w-full">
                    {selectedMatch.robotB?.name || "Pendiente"}
                  </h2>
                  <p className="text-[10px] md:text-xs font-tech font-bold text-neutral-400 uppercase truncate px-2 mt-1 w-full">
                    {selectedMatch.robotB?.institution || "Sin institución"}
                  </p>
                  <div className="text-6xl md:text-8xl font-tech font-black my-2 md:my-4 text-cb-white-tech drop-shadow-[2px_2px_0_#FFF]">
                    {selectedMatch.scoreB}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 h-20 md:h-28">
                  <ActionButton
                    icon={Plus}
                    label="Punto"
                    size="h-full"
                    color="bg-cb-white-tech"
                    textColor="text-cb-black-pure"
                    onClick={() => onControl(selectedMatch.id, "ADD_SCORE_B")}
                  />
                  <ActionButton
                    icon={ShieldAlert}
                    label="Falta"
                    size="h-full"
                    color="bg-red-600"
                    textColor="text-white"
                    onClick={() => onControl(selectedMatch.id, "ADD_PENALTY_B")}
                  />
                </div>
              </div>
            </div>
          </>
        );
      })()}

      <div className="mt-4 md:mt-6">
        {!selectedMatch.isFinished ? (
          <button
            onClick={() => {
              openConfirm(
                "Finalizar Encuentro",
                "¿Finalizar encuentro y declarar ganador?",
                () => onControl(selectedMatch.id, "FINISH"),
                "warning"
              );
            }}
            className="w-full bg-cb-yellow-neon text-cb-black-pure py-5 md:py-6 border-4 border-cb-black-pure font-tech font-black uppercase shadow-[6px_6px_0_#000] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-150 flex items-center justify-center gap-3"
          >
            <Trophy size={22} strokeWidth={2.5} />
            Finalizar Encuentro
          </button>
        ) : (
          <div className="flex flex-col gap-2 md:gap-3">
            <div className="bg-cb-yellow-neon text-cb-black-pure p-4 md:p-6 border-4 border-cb-black-pure text-center font-tech font-black uppercase shadow-block-sm flex flex-col items-center">
              <Trophy size={28} className="mb-2" strokeWidth={2.5} />
              ¡Encuentro Terminado!
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <button
                onClick={() => onControl(selectedMatch.id, "REVEAL_WINNER")}
                className="w-full bg-blue-600 text-white py-4 border-3 border-cb-black-pure font-tech font-black uppercase hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-[4px_4px_0_#000] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
              >
                <Play size={20} strokeWidth={2.5} />
                Revelar Ganador (Dashboard)
              </button>
              <button
                onClick={() => onControl(selectedMatch.id, "UNFINISH")}
                className="w-full bg-cb-black-pure text-cb-white-tech py-4 border-3 border-cb-black-pure font-tech font-black uppercase hover:bg-red-600 transition-colors active:scale-95"
              >
                Anular Finalización
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
};

export default RefereeControl;
