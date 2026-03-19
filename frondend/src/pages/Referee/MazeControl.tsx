import { useState, useEffect } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ActionButton } from "../../components/ActionButton";
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Flag,
  TimerReset,
  MoreVertical,
  XCircle,
  Ban,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import type { MatchState } from "../../App";

interface MazeControlProps {
  match: MatchState;
  onControl: (matchId: string, action: string, payload?: any) => void;
  formatTime: (seconds: number) => string;
}

export const MazeControl = ({
  match,
  onControl,
}: MazeControlProps) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  // Local precision timer
  const [localTime, setLocalTime] = useState(0); // milliseconds
  const [isRunning, setIsRunning] = useState(false);

  // Intentos tracking
  const [currentAttempt, setCurrentAttempt] = useState<1 | 2 | 3>(1);
  const [globalRestarts, setGlobalRestarts] = useState(0);
  const [attemptScores, setAttemptScores] = useState<{
    [key: number]: { time: number; restarts: number; graveFaults: number; zone: number; isFinished: boolean };
  }>({
    1: { time: 0, restarts: 0, graveFaults: 0, zone: 0, isFinished: false },
    2: { time: 0, restarts: 0, graveFaults: 0, zone: 0, isFinished: false },
    3: { time: 0, restarts: 0, graveFaults: 0, zone: 0, isFinished: false },
  });

  const [penaltyHistory, setPenaltyHistory] = useState<{
    type: "Reaparición" | "Falta Grave";
    seconds: number;
    timestamp: number;
    attempt: number;
  }[]>([]);

  // Format precisely
  const formatMazeTime = (ms: number) => {
      const totalSeconds = ms / 1000;
      const mins = Math.floor(totalSeconds / 60);
      const secs = Math.floor(totalSeconds % 60);
      const millis = Math.floor((ms % 1000) / 10);
      return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  // Timer Hook
  useEffect(() => {
    let interval: any;
    if (isRunning) {
        interval = setInterval(() => {
            setLocalTime(prev => prev + 10);
        }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Alerta tiempo superado (3 min = 180000 ms)
  useEffect(() => {
    if (localTime >= 180000 && isRunning) {
      setIsRunning(false);
      onControl(match.id, "PAUSE");
      openConfirm(
        "Tiempo Agotado",
        "El robot superó los 3 minutos máximos permitidos.",
        () => {},
        "danger"
      );
    }
  }, [localTime, isRunning, onControl, match.id]);

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

   const handleRestartEvent = () => {
    if (globalRestarts >= 2) {
      openConfirm(
        "Límite de Reapariciones",
        "Ya se han utilizado las 2 reapariciones permitidas para este robot en todos sus intentos.",
        () => {},
        "warning",
      );
      return;
    }

    const penalty = globalRestarts === 0 ? 5 : 10;
    
    // Stop local timer for recolocation? User didn't specify, 
    // but usually time keeps running unless it's a "total pause".
    // I will Pause to be safe as per previous logic.
    setIsRunning(false);
    onControl(match.id, "PAUSE");

        setLocalTime(prev => prev + (penalty * 1000));
        setPenaltyHistory(prev => [
            ...prev,
            { type: "Reaparición", seconds: penalty, timestamp: Date.now(), attempt: currentAttempt }
        ]);
        setAttemptScores((prev) => ({
          ...prev,
          [currentAttempt]: {
            ...prev[currentAttempt],
            restarts: prev[currentAttempt].restarts + penalty,
          },
        }));
        setGlobalRestarts(v => v + 1);
  };

  const handleGraveFault = () => {
    const currentFaults = attemptScores[currentAttempt].graveFaults;
    if (currentFaults >= 3) {
        // descalificación automática
        openConfirm(
            "DESCALIFICACIÓN",
            "4ta Falta Grave. El robot queda descalificado de la ronda.",
            () => {
              onControl(match.id, "MAZE_DISQUALIFY", { reason: "4 Faltas Graves" });
              onControl(match.id, "FINISH");
            },
            "danger"
          );
        return;
    }
    
    const penalties = [5, 10, 15];
    const penaltyValue = penalties[currentFaults];

        setLocalTime(prev => prev + (penaltyValue * 1000));
        setPenaltyHistory(prev => [
            ...prev,
            { type: "Falta Grave", seconds: penaltyValue, timestamp: Date.now(), attempt: currentAttempt }
        ]);
        setAttemptScores((prev) => ({
          ...prev,
          [currentAttempt]: {
            ...prev[currentAttempt],
            graveFaults: prev[currentAttempt].graveFaults + penaltyValue,
          },
        }));
  };

  const setZone = (z: number) => {
      setAttemptScores(prev => ({
          ...prev,
          [currentAttempt]: { ...prev[currentAttempt], zone: z }
      }));
  };

  // Removed handleFault in favor of handleGraveFault according to new rules



  const finishAttempt = () => {
    setIsRunning(false);
    onControl(match.id, "PAUSE");
    
    const totalSeconds = localTime / 1000;
    const penaltyTimeSum = attemptScores[currentAttempt].restarts + attemptScores[currentAttempt].graveFaults;
    const baseSeconds = totalSeconds - penaltyTimeSum;

    onControl(match.id, "MAZE_FINISH", {
      attemptId: currentAttempt,
      baseTime: baseSeconds,
      penaltyTime: penaltyTimeSum,
      timeTaken: totalSeconds,
      zone: attemptScores[currentAttempt].zone
    });

    setAttemptScores((prev) => ({
      ...prev,
      [currentAttempt]: {
        ...prev[currentAttempt],
        time: totalSeconds,
        isFinished: true,
      },
    }));
  };

  const formatScoreAsTimeStr = (scoreSeconds: number) => {
    if (scoreSeconds === 0) return "---";
    return formatMazeTime(scoreSeconds * 1000);
  };

  const nextAttempt = () => {
      if (currentAttempt < 3) {
          setCurrentAttempt((currentAttempt + 1) as any);
          setLocalTime(0);
          setIsRunning(false);
          setPenaltyHistory([]);
          onControl(match.id, "SET_TIME", 0);
      }
  };

  const saveBestAndFinish = () => {
    // Busca el tiempo más bajo mayor a 0
    let bestTime = Infinity;
    for (let i = 1; i <= 3; i++) {
        if (attemptScores[i].time > 0 && attemptScores[i].time < bestTime) {
            bestTime = attemptScores[i].time;
        }
    }
    
    const finalTime = bestTime === Infinity ? 180 : bestTime;

    openConfirm(
      "Declarar y Guardar",
      `¿Finalizar evaluación? El mejor tiempo registrado es ${formatScoreAsTimeStr(finalTime)}.`,
      () => {
        onControl(match.id, "SET_SCORE_A", finalTime);
        onControl(match.id, "FINISH");
      },
      "success" as any
    );
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {/* 1. STICKY HEADER: Timer & Primary Controls */}
      <div className="sticky top-0 z-50 bg-neutral-100 border-4 border-cb-black-pure shadow-md p-2 flex items-center justify-between gap-2">
        <button
          className={`flex-shrink-0 w-16 h-12 flex items-center justify-center border-2 border-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all ${isRunning ? "bg-cb-yellow-neon text-cb-black-pure" : "bg-cb-green-vibrant text-cb-black-pure"}`}
          onClick={() => {
            if (!isRunning) {
              onControl(match.id, "START");
              setIsRunning(true);
            } else {
              onControl(match.id, "PAUSE");
              setIsRunning(false);
            }
          }}
        >
          {isRunning ? (
            <Pause size={24} strokeWidth={3} />
          ) : (
            <Play size={24} strokeWidth={3} />
          )}
        </button>

        <div className="flex-1 h-12 flex items-center justify-center bg-cb-black-pure border-2 border-cb-black-pure relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
          <span className="absolute top-0 left-1 text-[10px] text-cb-green-vibrant font-tech">
             INTENTO {currentAttempt} / LABERINTO
          </span>
          <div
            className={`font-mono font-black text-3xl tracking-widest ${localTime >= 150000 ? "text-red-500 animate-pulse" : "text-cb-white-tech"}`}
          >
            {formatMazeTime(localTime)}
          </div>
        </div>

        <button
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-white text-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all"
          onClick={() => setShowMoreActions(!showMoreActions)}
        >
          <MoreVertical size={24} strokeWidth={3} />
        </button>
      </div>

      {/* ATTEMPTS PROGRESS */}
      <div className="flex w-full mt-2 gap-1 px-2">
        {([1, 2, 3] as (1 | 2 | 3)[]).map((num) => (
          <div
            key={num}
            className={`flex-1 py-1 px-2 border-3 border-cb-black-pure text-center ${currentAttempt === num ? 'bg-cb-yellow-neon' : 'bg-cb-white-tech'} shadow-[2px_2px_0_#000]`}
          >
             <div className="text-[9px] font-tech font-black text-cb-black-pure uppercase opacity-60">Intento {num}</div>
             <div className="text-xs font-mono font-black text-cb-black-pure">
               {attemptScores[num].time > 0 ? formatScoreAsTimeStr(attemptScores[num].time) : "---"}
             </div>
          </div>
        ))}
      </div>

      {/* 2. EXPANDABLE "MORE ACTIONS" PANEL */}
      {showMoreActions && (
        <div className="bg-neutral-200 border-b-4 border-cb-black-pure p-2 grid grid-cols-3 gap-2 shadow-inner">
          <ActionButton
            icon={RotateCcw}
            size="py-3"
            label="Anular Intento"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Anular Intento",
                "¿Limpiar el progreso del intento actual?",
                () => {
                  setLocalTime(0);
                  setIsRunning(false);
                  setPenaltyHistory([]);
                  setAttemptScores((prev) => ({
                    ...prev,
                    [currentAttempt]: { time: 0, restarts: 0, graveFaults: 0, zone: 0, isFinished: false },
                  }));
                  setShowMoreActions(false);
                },
                "warning",
              );
            }}
          />
          <ActionButton
            icon={Ban}
            size="py-3"
            label="Retiro Voluntario"
            color="bg-red-500"
            textColor="text-white"
            onClick={() => {
              openConfirm(
                "Retiro de Competencia",
                "¿Confirmar retiro voluntario? El capitán ha declarado que el robot no puede continuar.",
                () => {
                  onControl(match.id, "MAZE_DISQUALIFY", { reason: "Retiro Voluntario" });
                  setShowMoreActions(false);
                },
                "danger",
              );
            }}
          />
        </div>
      )}

      {/* 3. CONTROL CARD (We assume single Robot mode per match setup in Laberinto) */}
      <div className="grid grid-cols-1 px-2 mt-3 gap-4">
        <div className="flex-1 p-3 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm relative flex flex-col items-center">
          <h2 className="text-xl font-tech font-black uppercase text-cb-black-pure truncate mt-1">
            {match.robotA?.name || "ROBOT EN PISTA"}
          </h2>
          <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest leading-none mb-3">
            -- Evaluando Laberinto --
          </div>

          {/* ACTIVE ATTEMPT INFO PANEL */}
          <div className="w-full grid grid-cols-2 gap-2 mb-4 bg-cb-white-tech border-3 border-cb-black-pure p-3">
            <div className="flex flex-col items-center border-r-2 border-dashed border-cb-black-pure/20">
              <span className="text-[10px] font-tech text-cb-black-pure/70 uppercase">
                REAPARICIÓN (GLOBAL)
              </span>
              <span className="text-3xl font-tech font-black text-cb-black-pure">
                {globalRestarts}/2
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-tech text-cb-black-pure/70 uppercase">
                PENALIZACIÓN ACUM.
              </span>
              <span className="text-3xl font-tech font-black text-cb-red-alert">
                 +{attemptScores[currentAttempt].restarts + attemptScores[currentAttempt].graveFaults}s
              </span>
            </div>
          </div>

          <div className="w-full">
            <div className="font-tech font-black text-xs text-left mb-1 mt-2 text-cb-black-pure">
              PUNTOS DE CASTIGO / FALTAS
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mb-3">
              <ActionButton
                size="py-2"
                icon={TimerReset}
                label="Reaparición"
                color="bg-cb-green-vibrant"
                textColor="text-cb-black-pure"
                disabled={!isRunning || globalRestarts >= 2}
                onClick={handleRestartEvent}
              />
              <ActionButton
                size="py-2"
                icon={AlertTriangle}
                label="Falta Grave"
                color="bg-cb-yellow-neon"
                textColor="text-cb-black-pure"
                disabled={!isRunning}
                onClick={handleGraveFault}
              />
            </div>

            <div className="font-tech font-black text-xs text-left mb-1 mt-2 text-cb-black-pure">
              ZONAS ALCANZADAS
            </div>
            <div className="flex gap-1 w-full overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map(z => (
                    <button
                        key={z}
                        onClick={() => setZone(z)}
                        className={`flex-1 min-w-[40px] py-2 border-2 border-cb-black-pure font-tech font-black ${attemptScores[currentAttempt].zone === z ? 'bg-cb-black-pure text-white' : 'bg-white text-cb-black-pure'}`}
                    >
                        Z{z}
                    </button>
                ))}
              </div>
          </div>

          {/* PENALTY HISTORY PANEL */}
          <div className="w-full mt-4 bg-cb-black-pure/5 border-2 border-dashed border-cb-black-pure p-3 text-left">
             <div className="text-[10px] font-tech font-black text-cb-black-pure uppercase mb-2">Historial de Penalizaciones:</div>
             <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {penaltyHistory.length > 0 ? penaltyHistory.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-tech font-bold py-1 border-b border-black/10">
                        <span className={entry.type === "Reaparición" ? "text-cb-green-vibrant bg-cb-black-pure px-1" : "text-cb-black-pure bg-cb-yellow-neon px-1"}>
                           {entry.type}
                        </span>
                        <span className="text-cb-black-pure">+{entry.seconds}s</span>
                    </div>
                )) : (
                    <p className="text-[9px] text-neutral-400 italic">No hay penalizaciones registradas.</p>
                )}
             </div>
          </div>

          <div className="w-full mt-2 border-t-2 border-black border-dashed pt-4">
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                size="py-2"
                icon={Flag}
                label="¡LLEGÓ A META!"
                color="bg-cb-green-vibrant"
                textColor="text-cb-black-pure"
                disabled={!isRunning}
                onClick={() => {
                  openConfirm(
                    "Registro de Llegada",
                    "¿Robot llegó a la meta? Se detendrá el tiempo automáticamente.",
                    () => {
                        setZone(5);
                        finishAttempt();
                    },
                    "info",
                  );
                }}
              />
               <ActionButton
                size="py-2"
                icon={XCircle}
                label="Descalificación Automática"
                color="bg-red-500"
                textColor="text-white"
                className="text-[10px]"
                disabled={match.isFinished}
                onClick={() => {
                  openConfirm(
                    "Penalización Grave",
                    "Eliminación automática por daños al área, agresión, fraude o manipulación externa. ¿Proceder?",
                    () => {
                      onControl(match.id, "MAZE_DISQUALIFY", { reason: "Falta Grave / Manipulación" });
                    },
                    "danger",
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM FIXED BAR: RESOLUTION */}
      <div className="mt-4 px-2 pb-6">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <ActionButton
            icon={ArrowRight}
            label="Siguiente Intento"
            color="bg-cb-black-pure"
            textColor="text-white"
            disabled={currentAttempt >= 3 || !attemptScores[currentAttempt].isFinished}
            onClick={nextAttempt}
          />
          <ActionButton
            icon={CheckCircle}
            label="Declarar y Guardar"
            color="bg-cb-yellow-neon"
            size="py-4"
            textColor="text-cb-black-pure"
            onClick={saveBestAndFinish}
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
