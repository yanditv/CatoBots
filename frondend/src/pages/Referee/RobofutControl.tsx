import { useState, useEffect, type ElementType } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Activity,
  MoreVertical,
  XCircle,
  Save,
  Wrench,
  Clock,
  AlertTriangle,
  RotateCw,
  Zap,
  Undo,
  Dices,
  Flag,
  UserCheck,
  Megaphone,
  Handshake,
} from "lucide-react";
import type { MatchState } from "../../App";

interface RobofutControlProps {
  match: MatchState;
  onControl: (matchId: string, action: string, payload?: any) => void;
  formatTime: (seconds: number) => string;
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  color,
  textColor,
  disabled,
  className = "",
  size = "py-5",
}: {
  icon: ElementType;
  label: string;
  onClick: () => void;
  color: string;
  textColor: string;
  disabled?: boolean;
  className?: string;
  size?: string;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`${color} ${textColor} w-full ${size} rounded-none border-3 border-cb-black-pure font-tech font-black uppercase text-xs md:text-sm flex flex-col items-center justify-center gap-1 md:gap-2 active:scale-95 transition-all duration-150 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none ${className}`}
  >
    <Icon size={24} strokeWidth={2.5} className="mb-1" />
    <span className="leading-tight text-center px-1">{label}</span>
  </button>
);

export const RobofutControl = ({
  match,
  onControl,
  formatTime,
}: RobofutControlProps) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [half, setHalf] = useState<1 | 2>(1);
  const [isPenaltyPhase, setIsPenaltyPhase] = useState(false);

  // Timers
  const [auxTimer, setAuxTimer] = useState<number | null>(null); // Prep, Court Change, Break, Calling
  const [isAuxRunning, setIsAuxRunning] = useState(false);

  const [violationsA, setViolationsA] = useState(0);
  const [violationsB, setViolationsB] = useState(0);

  // Penalties tracking
  const [penaltyScoreA, setPenaltyScoreA] = useState(0);
  const [penaltyScoreB, setPenaltyScoreB] = useState(0);
  const [penaltyTakedA, setPenaltyTakedA] = useState(0);
  const [penaltyTakedB, setPenaltyTakedB] = useState(0);

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

  // Initialize time to 2 mins for Robofut half
  useEffect(() => {
    if (
      match.timeLeft === 180 &&
      !match.isActive &&
      match.scoreA === 0 &&
      match.scoreB === 0
    ) {
      onControl(match.id, "SET_TIME", 120);
    }
  }, [match.timeLeft, match.isActive, onControl, match.id]);

  // Aux Timer Hook
  useEffect(() => {
    let interval: any;
    if (isAuxRunning && auxTimer !== null && auxTimer > 0) {
      interval = setInterval(() => setAuxTimer((prev) => prev! - 1), 1000);
    } else if (isAuxRunning && auxTimer === 0) {
      setIsAuxRunning(false);
      // alert callback could go here
    }
    return () => clearInterval(interval);
  }, [isAuxRunning, auxTimer]);

  const handleGoal = (who: "A" | "B") => {
    onControl(match.id, `ADD_SCORE_${who}`, 1);
  };

  const handleUndoGoal = (who: "A" | "B") => {
      const current = who === "A" ? match.scoreA : match.scoreB;
      if (current > 0) {
          onControl(match.id, `SET_SCORE_${who}`, current - 1);
      }
  };

  const addInfraction = (who: "A" | "B") => {
    const current = who === "A" ? violationsA : violationsB;
    if (current + 1 >= 3) {
      openConfirm(
        "Límite de Infracciones",
        `El Robot ${who} ha llegado a 3 infracciones. Pierde el partido por reglamento.`,
        () => {
           onControl(match.id, "PAUSE");
           alert("PARTIDO FINALIZADO POR 3 PENALIZACIONES.");
        },
        "danger",
      );
    }
    if (who === "A") setViolationsA(v => v + 1);
    else setViolationsB(v => v + 1);
  };

  const startAuxTimer = (seconds: number) => {
      setAuxTimer(seconds);
      setIsAuxRunning(true);
      setShowMoreActions(false);
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {/* 1. STICKY HEADER: Timer & Primary Controls */}
      <div className="sticky top-0 z-50 bg-neutral-100 border-4 border-cb-black-pure shadow-md p-2 flex items-center justify-between gap-2">
        <button
          className={`flex-shrink-0 w-16 h-12 flex items-center justify-center border-2 border-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all ${match.isActive ? "bg-cb-yellow-neon text-cb-black-pure" : "bg-cb-green-vibrant text-cb-black-pure"}`}
          onClick={() => {
            onControl(match.id, match.isActive ? "PAUSE" : "START");
          }}
        >
          {match.isActive ? (
            <Pause size={24} strokeWidth={3} />
          ) : (
            <Play size={24} strokeWidth={3} />
          )}
        </button>

        <div className="flex-1 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-cb-black-pure shadow-[2px_2px_0_#CBFF00] relative">
          <span className="absolute top-0 left-1 text-[10px] text-cb-green-vibrant font-tech">
            ROBOFUT / {isPenaltyPhase ? "PÉNALES" : `TIEMPO ${half}`}
          </span>
          <div
            className={`font-mono font-black text-3xl tracking-widest ${match.timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-cb-white-tech"}`}
          >
            {formatTime(match.timeLeft)}
          </div>
        </div>

        <button
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-white text-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all"
          onClick={() => setShowMoreActions(!showMoreActions)}
        >
          <MoreVertical size={24} strokeWidth={3} />
        </button>
      </div>

      {/* AUX TIMER BANNER */}
      {auxTimer !== null && (
        <div className="bg-cb-yellow-neon text-cb-black-pure font-tech font-bold uppercase p-3 border-4 border-cb-black-pure flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Clock size={20} /> TIEMPO: {formatTime(auxTimer)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAuxRunning(!isAuxRunning)}
              className="bg-cb-black-pure text-white px-3 py-1 hover:bg-neutral-800 transition shadow-[2px_2px_0_#000]"
            >
              {isAuxRunning ? "PAUSAR" : "INICIAR"}
            </button>
            <button
              onClick={() => {
                setAuxTimer(null);
                setIsAuxRunning(false);
              }}
              className="bg-white text-cb-black-pure px-3 py-1 hover:bg-neutral-200 transition shadow-[2px_2px_0_#000]"
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* 2. EXPANDABLE "MORE ACTIONS" PANEL */}
      {showMoreActions && (
        <div className="bg-neutral-200 border-b-4 border-cb-black-pure p-2 grid grid-cols-2 lg:grid-cols-4 gap-2 shadow-inner">
           <ActionButton
            icon={Megaphone}
            size="py-3"
            label="Llamado (10m)"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => startAuxTimer(600)}
          />
          <ActionButton
            icon={UserCheck}
            size="py-3"
            label="Presentarse (60s)"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => startAuxTimer(60)}
          />
          <ActionButton
            icon={RotateCw}
            size="py-3"
            label="Prep (30s)"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => startAuxTimer(30)}
          />
           <ActionButton
            icon={Handshake}
            size="py-3"
            label="Registrar Saludo"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
                setShowMoreActions(false);
                alert("SALUDO REGISTRADO.");
            }}
          />
          <ActionButton
            icon={Dices}
            size="py-3"
            label="Sorteo Cancha"
            color="bg-cb-yellow-neon"
            textColor="text-cb-black-pure"
            onClick={() => {
                const res = Math.random() > 0.5 ? "A" : "B";
                alert(`SORTEO: Lado de Cancha preferente para el Robot ${res}`);
                setShowMoreActions(false);
            }}
          />
          <ActionButton
            icon={RotateCcw}
            size="py-3"
            label="Cambio Cancha (30s)"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
                setHalf(2);
                onControl(match.id, "PAUSE");
                onControl(match.id, "SET_TIME", 120);
                startAuxTimer(30);
            }}
          />
           <ActionButton
            icon={Wrench}
            size="py-3"
            label="Reparación (2m)"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => startAuxTimer(120)}
          />
          <ActionButton
            icon={Zap}
            size="py-3"
            label="Iniciar Pénales"
            color="bg-cb-black-pure"
            textColor="text-cb-white-tech"
            onClick={() => {
                setIsPenaltyPhase(true);
                setShowMoreActions(false);
            }}
          />
           <ActionButton
            icon={RotateCcw}
            size="py-3"
            label="Reiniciar Match"
            color="bg-red-600"
            textColor="text-white"
            onClick={() => {
              openConfirm("Reiniciar", "¿Reiniciar todo a 0-0 y Tiempo 1?", () => {
                   onControl(match.id, "RESET", 120);
                   setHalf(1);
                   setShowMoreActions(false);
              }, "danger");
            }}
          />
        </div>
      )}

      {/* 3. CORE FIELD CONTROLS (Goles & Infracciones) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 px-2 mt-2">
        {/* Robot A */}
        <div className="flex-1 p-3 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm flex flex-col items-center">
          <h2 className="text-xl font-tech font-black uppercase text-cb-black-pure truncate mb-2">
            {match.robotA?.name || "EQUIPO A"}
          </h2>
          
          <div className="w-full bg-cb-black-pure border-2 border-cb-black-pure py-4 mb-4 flex flex-col items-center">
             <span className="text-[10px] text-cb-green-vibrant font-tech mb-1">MARCADOR GOLES</span>
             <span className="text-5xl font-mono font-black text-cb-white-tech">{match.scoreA}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mb-3">
             <ActionButton
               size="py-2"
               icon={Trophy}
               label="¡GOL!"
               color="bg-cb-green-vibrant"
               textColor="text-cb-black-pure"
               onClick={() => handleGoal("A")}
             />
             <ActionButton
               size="py-2"
               icon={Undo}
               label="Quitar Gol"
               color="bg-white"
               textColor="text-cb-black-pure"
               onClick={() => handleUndoGoal("A")}
             />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label={`Infracción (${violationsA}/3)`}
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              onClick={() => addInfraction("A")}
            />
            <ActionButton
              size="py-2"
              icon={XCircle}
              label="Penalidad Grave"
              color="bg-red-500"
              textColor="text-white"
              onClick={() => {
                openConfirm("Penalización Grave", "Descalificación directa por agresión, daños o fraude.", () => {}, "danger");
              }}
            />
          </div>
        </div>

        {/* Robot B */}
        <div className="flex-1 p-3 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm flex flex-col items-center">
          <h2 className="text-xl font-tech font-black uppercase text-cb-black-pure truncate mb-2">
            {match.robotB?.name || "EQUIPO B"}
          </h2>
          
          <div className="w-full bg-cb-black-pure border-2 border-cb-black-pure py-4 mb-4 flex flex-col items-center">
             <span className="text-[10px] text-cb-green-vibrant font-tech mb-1">MARCADOR GOLES</span>
             <span className="text-5xl font-mono font-black text-cb-white-tech">{match.scoreB}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mb-3">
             <ActionButton
               size="py-2"
               icon={Trophy}
               label="¡GOL!"
               color="bg-cb-green-vibrant"
               textColor="text-cb-black-pure"
               onClick={() => handleGoal("B")}
             />
             <ActionButton
               size="py-2"
               icon={Undo}
               label="Quitar Gol"
               color="bg-white"
               textColor="text-cb-black-pure"
               onClick={() => handleUndoGoal("B")}
             />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label={`Infracción (${violationsB}/3)`}
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              onClick={() => addInfraction("B")}
            />
            <ActionButton
              size="py-2"
              icon={XCircle}
              label="Penalidad Grave"
              color="bg-red-500"
              textColor="text-white"
              onClick={() => {
                 openConfirm("Penalización Grave", "Descalificación directa por agresión, daños o fraude.", () => {}, "danger");
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. PENALTY PHASE UI (Conditional) */}
      {isPenaltyPhase && (
        <div className="mt-4 px-2 space-y-4">
           <div className="bg-cb-black-pure border-4 border-cb-yellow-neon p-4 text-center">
              <h3 className="text-cb-yellow-neon font-tech font-black text-xl mb-3 uppercase flex items-center justify-center gap-2">
                 <Zap size={24}/> DEFINICIÓN POR PÉNALES <Zap size={24}/>
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                 <div className="text-white border-r-2 border-dashed border-neutral-700 pr-2">
                    <div className="text-xs uppercase text-neutral-400">PÉNALES A</div>
                    <div className="text-4xl font-black text-cb-green-vibrant">{penaltyScoreA} / {penaltyTakedA}</div>
                    <div className="flex gap-1 justify-center mt-2">
                       <button onClick={() => {setPenaltyScoreA(s=>s+1); setPenaltyTakedA(t=>t+1)}} className="bg-cb-green-vibrant text-cb-black-pure px-3 py-2 flex items-center gap-1 font-bold"><Trophy size={16}/> GOL</button>
                       <button onClick={() => setPenaltyTakedA(t=>t+1)} className="bg-red-500 text-white px-3 py-2 flex items-center gap-1 font-bold"><XCircle size={16}/> FALLO</button>
                    </div>
                 </div>
                 <div className="text-white pl-2">
                    <div className="text-xs uppercase text-neutral-400">PÉNALES B</div>
                    <div className="text-4xl font-black text-cb-green-vibrant">{penaltyScoreB} / {penaltyTakedB}</div>
                    <div className="flex gap-1 justify-center mt-2">
                        <button onClick={() => {setPenaltyScoreB(s=>s+1); setPenaltyTakedB(t=>t+1)}} className="bg-cb-green-vibrant text-cb-black-pure px-3 py-2 flex items-center gap-1 font-bold"><Trophy size={16}/> GOL</button>
                        <button onClick={() => setPenaltyTakedB(t=>t+1)} className="bg-red-500 text-white px-3 py-2 flex items-center gap-1 font-bold"><XCircle size={16}/> FALLO</button>
                    </div>
                 </div>
              </div>
              
              <div className="flex gap-2">
                  <button onClick={() => setIsPenaltyPhase(false)} className="flex-1 border-2 border-white text-white py-2 font-black uppercase text-xs">Cerrar Pénales</button>
                  <button onClick={() => {setPenaltyScoreA(0); setPenaltyTakedA(0); setPenaltyScoreB(0); setPenaltyTakedB(0)}} className="flex-1 border-2 border-white text-white py-2 font-black uppercase text-xs">Reiniciar Tandas</button>
              </div>
           </div>
        </div>
      )}

      {/* 5. BOTTOM RESOLUTION BAR */}
      <div className="mt-4 px-2">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          <ActionButton
            icon={RotateCw}
            label="Balón al Centro"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => alert("BALÓN AL CENTRO. ROBOTS EN POSICIÓN.")}
          />
          <ActionButton
            icon={Flag}
            label="Out / Saque"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
                onControl(match.id, "PAUSE");
                alert("BALÓN FUERA. PAUSA PARA REPOSICIÓN.");
            }}
          />
          <ActionButton
            icon={Activity}
            label="Declarar Ganador"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
               openConfirm("Finalizar Partido", "¿Confirmar resultado final y declarar al equipo ganador según goles o penalías?", () => {
                   onControl(match.id, "FINISH");
               }, "success" as any);
            }}
          />
           <ActionButton
            icon={Save}
            label="Guardar Datos"
            className="md:col-span-1 hidden md:flex"
            color="bg-cb-green-vibrant"
            textColor="text-cb-black-pure"
            onClick={() => alert("ESTADO DEL PARTIDO GUARDADO.")}
          />
        </div>
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
