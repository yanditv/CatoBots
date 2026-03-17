import { useState, useEffect } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ActionButton } from "../../components/ActionButton";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Trophy,
  MoreVertical,
  Target,
} from "lucide-react";
import type { MatchState } from "../../App";

interface BioBotsControlProps {
  match: MatchState;
  onControl: (matchId: string, action: string, payload?: any) => void;
  formatTime: (seconds: number) => string;
}

export const BioBotsControl = ({
  match,
  onControl,
  formatTime,
}: BioBotsControlProps) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  
  // Logic state
  const [currentObjectId, setCurrentObjectId] = useState(1); // 1 to 6
  const [currentAttemptId, setCurrentAttemptId] = useState(1); // 1 or 2
  const [isResting, setIsResting] = useState(false);
  const [progress, setProgress] = useState<Record<number, string>>({
    1: "PENDIENTE",
    2: "PENDIENTE",
    3: "PENDIENTE",
    4: "PENDIENTE",
    5: "PENDIENTE",
    6: "PENDIENTE",
  });

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

  // Initial Sync: Ensure time is set to 60s (1 min) if the trial hasn't started
  useEffect(() => {
    if (
      match.timeLeft === 180 && // Default server time
      !match.isActive &&
      currentObjectId === 1 &&
      currentAttemptId === 1 &&
      !isResting
    ) {
      onControl(match.id, "SET_TIME", 60);
    }
  }, [match.timeLeft, match.isActive, onControl, match.id]);

  // Timer sync: Auto-pause and handle transitions
  useEffect(() => {
    if (match.timeLeft === 0 && match.isActive) {
      onControl(match.id, "PAUSE");
      if (isResting) {
        handleEndRest();
      } else {
        openConfirm(
          "Tiempo Agotado",
          `El minuto para el Objeto ${currentObjectId} ha terminado. ¿Registrar como fallo?`,
          () => handleResult(false),
          "danger"
        );
      }
    }
  }, [match.timeLeft, match.isActive, isResting]);

  const handleResult = (success: boolean) => {
    onControl(match.id, "PAUSE");
    
    if (success) {
      const points = currentAttemptId === 1 ? 15 : 10;
      setProgress(prev => ({ ...prev, [currentObjectId]: `ÉXITO (Int. ${currentAttemptId})` }));
      onControl(match.id, "BIO_OBJECT_RESULT", { 
        objectId: currentObjectId, 
        attemptId: currentAttemptId, 
        success: true, 
        points 
      });
      startRestPhase();
    } else {
      if (currentAttemptId === 1) {
        onControl(match.id, "BIO_OBJECT_RESULT", { 
          objectId: currentObjectId, 
          attemptId: currentAttemptId, 
          success: false 
        });
        openConfirm(
          "Intento Fallido",
          "¿Iniciar segundo intento para este objeto?",
          () => {
            setCurrentAttemptId(2);
            onControl(match.id, "SET_TIME", 60);
          },
          "warning"
        );
      } else {
        setProgress(prev => ({ ...prev, [currentObjectId]: "FALLIDO" }));
        onControl(match.id, "BIO_OBJECT_RESULT", { 
          objectId: currentObjectId, 
          attemptId: currentAttemptId, 
          success: false 
        });
        startRestPhase();
      }
    }
  };

  const startRestPhase = () => {
    if (currentObjectId < 6) {
      setIsResting(true);
      onControl(match.id, "BIO_REST_START", { objectId: currentObjectId });
      onControl(match.id, "SET_TIME", 300); // 5 minutes rest
      onControl(match.id, "START");
    } else {
      openConfirm(
        "Prueba Finalizada",
        "Se han completado los 6 objetos. ¿Finalizar encuentro?",
        () => onControl(match.id, "FINISH"),
        "info"
      );
    }
  };

  const handleEndRest = () => {
    setIsResting(false);
    setCurrentObjectId(prev => prev + 1);
    setCurrentAttemptId(1);
    onControl(match.id, "SET_TIME", 60);
  };

  const startWork = () => {
    onControl(match.id, "BIO_OBJECT_START", { objectId: currentObjectId, attemptId: currentAttemptId });
    onControl(match.id, "START");
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {/* 1. HEADER (Styled like BattleBots) */}
      <div className="sticky top-0 z-50 bg-neutral-100 border-b-4 border-cb-black-pure shadow-md p-2 flex items-center justify-between gap-2">
        <button
          className={`flex-shrink-0 w-16 h-12 flex items-center justify-center border-2 border-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all ${match.isActive ? "bg-cb-yellow-neon text-cb-black-pure" : "bg-cb-green-vibrant text-cb-black-pure"}`}
          onClick={() => onControl(match.id, match.isActive ? "PAUSE" : "START")}
        >
          {match.isActive ? <Pause size={24} strokeWidth={3} /> : <Play size={24} strokeWidth={3} />}
        </button>

        <div className="flex-1 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-cb-black-pure shadow-[2px_2px_0_#CBFF00] relative">
          <span className="absolute top-0 left-1 text-[10px] text-cb-green-vibrant font-tech uppercase">
             {isResting ? "TIEMPO DE ESPERA" : `BIOBOTS 1LB | OBJETO ${currentObjectId}`}
          </span>
          <div className={`font-mono font-black text-3xl tracking-widest ${match.timeLeft <= 10 ? "text-red-500" : "text-cb-white-tech"}`}>
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

      {/* 2. REST BANNER (Like Accident/Prolongation in BattleBots) */}
      {isResting && (
        <div className="bg-cb-yellow-neon border-x-4 border-cb-black-pure p-3 flex justify-between items-center px-4 mx-2 mt-2">
          <span className="font-tech font-black text-xs text-cb-black-pure uppercase flex items-center gap-2">
            <Clock size={16} /> Descanso Reglamentario: {formatTime(match.timeLeft)}
          </span>
          <button
            onClick={handleEndRest}
            className="bg-cb-black-pure text-white px-3 py-1 text-[10px] font-tech font-black uppercase border-2 border-cb-black-pure active:scale-95 transition-transform"
          >
            Continuar con Objeto {currentObjectId + 1}
          </button>
        </div>
      )}

      {/* 3. MORE ACTIONS */}
      {showMoreActions && (
        <div className="bg-neutral-200 border-b-4 border-cb-black-pure p-2 grid grid-cols-2 gap-2 shadow-inner mx-2">
          <ActionButton
            icon={RotateCcw}
            size="py-3"
            label="Reiniciar Todo"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm("Reiniciar Prueba", "¿Borrar todo el progreso y reiniciar?", () => {
                onControl(match.id, "RESET", 60);
                setCurrentObjectId(1);
                setCurrentAttemptId(1);
                setIsResting(false);
                setProgress({ 1: "PENDIENTE", 2: "PENDIENTE", 3: "PENDIENTE", 4: "PENDIENTE", 5: "PENDIENTE", 6: "PENDIENTE" });
                setShowMoreActions(false);
              }, "danger");
            }}
          />
          <ActionButton
             icon={Target}
             size="py-3"
             label="Saltar Objeto"
             color="bg-white"
             textColor="text-cb-black-pure"
             onClick={() => {
                setProgress(prev => ({ ...prev, [currentObjectId]: "OMITIDO" }));
                startRestPhase();
                setShowMoreActions(false);
             }}
          />
        </div>
      )}

      {/* 4. MAIN CONTROL CARD (Mirroring BattleBots layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-2 mt-2">
        {/* Robot Performance Card */}
        <div className="bg-cb-white-tech border-4 border-cb-black-pure p-4 md:p-6 text-center flex flex-col items-center">
            <h2 className="text-xs md:text-sm font-tech font-black uppercase text-cb-black-pure/60 mb-1">
                COMPETIDOR EN PISTA
            </h2>
            <h3 className="text-xl md:text-2xl font-tech font-black text-cb-black-pure border-b-4 border-cb-black-pure pb-2 w-full truncate">
                {match.robotA?.name || "---"}
            </h3>
            
            <div className="text-7xl md:text-8xl font-tech font-black my-6 text-cb-black-pure drop-shadow-[2px_2px_0_#FFF]">
                {match.scoreA}
            </div>

            <p className="font-tech font-bold text-xs text-cb-black-pure/50 uppercase mb-4">
                PUNTAJE ACUMULADO
            </p>

            <div className="grid grid-cols-2 gap-2 w-full">
                <ActionButton
                    icon={AlertTriangle}
                    label="Amonestación (-5)"
                    color="bg-cb-yellow-neon"
                    textColor="text-cb-black-pure"
                    disabled={!match.isActive || isResting}
                    onClick={() => {
                        onControl(match.id, "ADD_SCORE_A", -5);
                        onControl(match.id, "ADD_PENALTY_A", "Falta");
                    }}
                />
                <ActionButton
                    icon={RotateCcw}
                    label="Borrar Puntos"
                    color="bg-cb-black-pure"
                    textColor="text-white"
                    onClick={() => openConfirm("Limpiar Puntaje", "¿Borrar puntos del robot?", () => onControl(match.id, "SET_SCORE_A", 0))}
                />
            </div>
        </div>

        {/* Task Control Card */}
        <div className="bg-cb-white-tech border-4 border-cb-black-pure p-4 md:p-6">
            <div className="flex justify-between items-center border-b-4 border-cb-black-pure pb-2 mb-4">
                <h2 className="font-tech font-black text-lg text-cb-black-pure uppercase">
                    TAREA {currentObjectId} / 6
                </h2>
                <div className="bg-cb-black-pure text-cb-yellow-neon px-3 py-1 font-tech font-black text-xs">
                    INTENTO {currentAttemptId}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {!match.isActive && !isResting ? (
                    <button
                        onClick={startWork}
                        className="w-full bg-cb-green-vibrant text-cb-black-pure border-4 border-cb-black-pure py-10 font-tech font-black text-2xl uppercase shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        <Play className="inline-block mr-2" size={32} />
                        INICIAR INTENTO
                    </button>
                ) : (
                    <>
                        <button
                            disabled={!match.isActive || isResting}
                            onClick={() => handleResult(true)}
                            className="w-full bg-cb-green-vibrant text-cb-black-pure border-4 border-cb-black-pure py-8 font-tech font-black text-2xl uppercase shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            <CheckCircle className="inline-block mr-2" size={32} />
                            OBJETO LEVANTADO
                        </button>
                        
                        <button
                            disabled={!match.isActive || isResting}
                            onClick={() => handleResult(false)}
                            className="w-full bg-red-600 text-white border-4 border-cb-black-pure py-4 font-tech font-black text-xl uppercase shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            <XCircle className="inline-block mr-2" size={24} />
                            FALLO DE INTENTO
                        </button>
                    </>
                )}
            </div>

            {/* Quick Progress List (Small version of your list) */}
            <div className="mt-6 border-t-2 border-neutral-200 pt-4">
                <p className="font-tech font-black text-[10px] text-cb-black-pure/40 uppercase mb-2 tracking-widest text-center">ESTADO DE OBJETOS</p>
                <div className="grid grid-cols-6 gap-1">
                    {[1, 2, 3, 4, 5, 6].map(id => (
                        <div 
                            key={id} 
                            className={`h-2 border-2 border-cb-black-pure ${
                                currentObjectId === id ? "bg-cb-yellow-neon shadow-[0_0_8px_#CBFF00]" :
                                progress[id].includes("ÉXITO") ? "bg-cb-green-vibrant" :
                                progress[id] === "PENDIENTE" ? "bg-neutral-200" : "bg-red-500"
                            }`}
                            title={`Objeto ${id}: ${progress[id]}`}
                        />
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* 5. FULL PROGRESS LOG (At the bottom, simple list) */}
      <div className="px-2 pb-4">
        <div className="bg-cb-gray-industrial border-4 border-cb-black-pure p-3">
             <h2 className="font-tech font-black text-white text-xs uppercase mb-3 border-b-2 border-white/10 pb-1">BITÁCORA DE PROGRESO</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                 {[1, 2, 3, 4, 5, 6].map(id => (
                     <div key={id} className="flex items-center justify-between bg-cb-black-pure/40 p-2 border-2 border-cb-black-pure">
                        <span className="font-tech font-bold text-cb-white-tech text-[10px] uppercase">OBJETO {id}</span>
                        <span className={`font-tech font-black text-[10px] ${
                            progress[id].includes("ÉXITO") ? "text-cb-green-vibrant" : 
                            progress[id] === "FALLIDO" ? "text-red-500" : "text-white/40"
                        }`}>
                            {progress[id]}
                        </span>
                     </div>
                 ))}
             </div>
        </div>
      </div>

      {/* 6. FINALIZE (BattleBots Style) */}
      <div className="px-2 mb-4">
           <ActionButton
              icon={Trophy}
              label="Declarar Finalizada"
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              disabled={Object.values(progress).some(v => v === "PENDIENTE") && currentObjectId <= 6}
              onClick={() => {
                openConfirm("Finalizar Prueba", "¿Guardar resultados y cerrar?", () => onControl(match.id, "FINISH"), "info");
              }}
           />
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
