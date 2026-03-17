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
  Clock,
  MoreVertical,
  Trophy,
  XCircle,
  Save,
  Wrench,
  Ban,
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
  formatTime,
}: MazeControlProps) => {
  const MAX_TIME = 180; // 3 minutes per attempt
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Intentos tracking: Maze is usually single-robot evaluation over 3 attempts.
  // We'll manage attempts internally so judges can record and select the best one.
  const [currentAttempt, setCurrentAttempt] = useState<1 | 2 | 3>(1);
  const [attemptScores, setAttemptScores] = useState<{
    [key: number]: { time: number; restarts: number; faults: number };
  }>({
    1: { time: 0, restarts: 0, faults: 0 },
    2: { time: 0, restarts: 0, faults: 0 },
    3: { time: 0, restarts: 0, faults: 0 },
  });

  // Repair time state
  const [repairTimer, setRepairTimer] = useState<number | null>(null);
  const [isRepairRunning, setIsRepairRunning] = useState(false);

  // Initialize time
  useEffect(() => {
    if (
      match.timeLeft === 180 &&
      !match.isActive &&
      match.scoreA === 0 &&
      match.scoreB === 0
    ) {
      onControl(match.id, "SET_TIME", MAX_TIME);
    }
  }, [
    match.timeLeft,
    match.isActive,
    onControl,
    match.id,
    match.scoreA,
    match.scoreB,
  ]);

  // Alerta tiempo superado
  useEffect(() => {
    if (match.timeLeft === 0 && match.isActive) {
      onControl(match.id, "PAUSE");
      openConfirm(
        "Tiempo Agotado",
        "El robot superó los 3 minutos máximos permitidos. El intento ha sido descalificado (Sin tiempo base).",
        () => {},
        "danger",
      );
    }
  }, [match.timeLeft, match.isActive, onControl, match.id]);

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

  // Repair Timer Hook
  useEffect(() => {
    let interval: any;
    if (isRepairRunning && repairTimer !== null && repairTimer > 0) {
      interval = setInterval(() => setRepairTimer((prev) => prev! - 1), 1000);
    } else if (isRepairRunning && repairTimer === 0) {
      setIsRepairRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRepairRunning, repairTimer]);

  const handleRestartEvent = () => {
    const currentRestarts = attemptScores[currentAttempt].restarts;
    if (currentRestarts >= 2) {
      openConfirm(
        "Límite de Rearranques",
        "Solo se permiten 2 rearranques por intento.",
        () => {},
        "warning",
      );
      return;
    }

    onControl(match.id, "PAUSE");
    openConfirm(
      "Rearranque (+15s)",
      "El robot será recolocado en la zona de rearranque anterior más cercana. El cronómetro está pausado, reanúdalo cuando estés listo.",
      () => {
        setAttemptScores((prev) => ({
          ...prev,
          [currentAttempt]: {
            ...prev[currentAttempt],
            restarts: prev[currentAttempt].restarts + 1,
            faults: prev[currentAttempt].faults + 1, // Rearranque cuenta también como falta visualmente, o podemos mantenerlo separado
          },
        }));
      },
      "info",
    );
  };

  const handleFault = (reason: string) => {
    openConfirm(
      "Registrar Falta",
      `¿Registrar falta por: ${reason}? Esto afectará la calificación final del intento.`,
      () => {
        setAttemptScores((prev) => ({
          ...prev,
          [currentAttempt]: {
            ...prev[currentAttempt],
            faults: prev[currentAttempt].faults + 1,
          },
        }));
      },
      "warning",
    );
  };

  const calcCurrentAttemptTime = () => {
    if (match.timeLeft === 0) return 0; // Descalificado
    const timeTaken =
      MAX_TIME - match.timeLeft + attemptScores[currentAttempt].restarts * 15;
    return timeTaken;
  };

  const finishAttempt = () => {
    onControl(match.id, "PAUSE");
    const finalTime = calcCurrentAttemptTime();
    setAttemptScores((prev) => ({
      ...prev,
      [currentAttempt]: {
        ...prev[currentAttempt],
        time: finalTime,
      },
    }));
  };

  const formatScoreAsTimeStr = (scoreSeconds: number) => {
    if (scoreSeconds === 0) return "---";
    const m = Math.floor(scoreSeconds / 60);
    const s = scoreSeconds % 60;
    return `${m > 0 ? `${m}m ` : ""}${s}s`;
  };

  const switchToAttempt = (attemptNum: 1 | 2 | 3) => {
    if (match.isActive) {
      openConfirm(
        "Carrera en curso",
        "Pausa la carrera actual antes de cambiar de intento.",
        () => {},
        "warning",
      );
      return;
    }

    openConfirm(
      `Cambiar al Intento ${attemptNum}`,
      `¿Preparar el sistema para el intento ${attemptNum}? Se reiniciará el tiempo actual de la pantalla para listos.`,
      () => {
        setCurrentAttempt(attemptNum);
        onControl(match.id, "SET_TIME", MAX_TIME);
        // Reset local attempt state if they want to override it? usually they keep what was there until they run it again.
      },
      "info",
    );
  };

  const setBestAttemptAsFinal = () => {
    // Busca el tiempo más bajo mayor a 0
    let bestTime = Infinity;
    for (let i = 1; i <= 3; i++) {
        if (attemptScores[i].time > 0 && attemptScores[i].time < bestTime) {
            bestTime = attemptScores[i].time;
        }
    }
    
    if (bestTime === Infinity) {
        openConfirm("Sin Intentos Validos", "No hay intentos terminados validos para guardar.", () => {}, "warning");
        return;
    }

    openConfirm(
      "Guardar Mejor Intento",
      `¿Guardar ${formatScoreAsTimeStr(bestTime)} como el puntaje oficial final para el Robot A?`,
      () => {
        onControl(match.id, "SET_SCORE_A", bestTime);
      },
      "info",
    );
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {/* 1. STICKY HEADER: Timer & Primary Controls */}
      <div className="sticky top-0 z-50 bg-neutral-100 border-4 border-cb-black-pure shadow-md p-2 flex items-center justify-between gap-2">
        <button
          className={`flex-shrink-0 w-16 h-12 flex items-center justify-center border-2 border-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all ${match.isActive ? "bg-cb-yellow-neon text-cb-black-pure" : "bg-cb-green-vibrant text-cb-black-pure"}`}
          onClick={() => {
            if (repairTimer !== null && isRepairRunning) return;
            onControl(match.id, match.isActive ? "PAUSE" : "START");
          }}
        >
          {match.isActive ? (
            <Pause size={24} strokeWidth={3} />
          ) : (
            <Play size={24} strokeWidth={3} />
          )}
        </button>

        <div className="flex-1 h-12 flex items-center justify-center bg-cb-white-tech relative">
          <span className="absolute top-0 left-1 text-[10px] text-cb-green-vibrant font-tech">
          </span>
          <div
            className={`font-mono font-black text-3xl tracking-widest ${match.timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-cb-black-pure"}`}
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

      {/* REPAIR TIMER BANNER */}
      {repairTimer !== null && (
        <div className="bg-red-500 text-white font-tech font-bold uppercase p-3 border-4 border-cb-black-pure flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Wrench size={20} /> PIDIÓ PAUSA: {formatTime(repairTimer)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsRepairRunning(!isRepairRunning)}
              className="bg-cb-black-pure px-3 py-1 hover:bg-neutral-800 transition shadow-[2px_2px_0_#000]"
            >
              {isRepairRunning ? "PAUSAR" : "INICIAR"}
            </button>
            <button
              onClick={() => {
                setRepairTimer(null);
                setIsRepairRunning(false);
              }}
              className="bg-white text-cb-black-pure px-3 py-1 hover:bg-neutral-200 transition shadow-[2px_2px_0_#000]"
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* ATTEMPTS TABS */}
      <div className="flex w-full mt-2 gap-1 px-2">
        {([1, 2, 3] as (1 | 2 | 3)[]).map((num) => (
          <button
            key={num}
            onClick={() => switchToAttempt(num)}
            className={`flex-1 py-2 font-tech font-black border-3 border-cb-black-pure uppercase text-xs md:text-sm transition-all ${currentAttempt === num ? "bg-cb-black-pure text-white shadow-[2px_2px_0_#000]" : "bg-cb-white-tech text-cb-black-pure hover:bg-neutral-400"}`}
          >
            Intento {num}
            <div className="text-[10px] font-mono leading-none mt-1 text-cb-black-pure">
              {formatScoreAsTimeStr(attemptScores[num].time)}
            </div>
          </button>
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
                "Anular Intento Actual",
                "¿Limpiar tiempo y faltas del intento actual para rehacerlo? (El robot aún no estaba listo)",
                () => {
                  onControl(match.id, "SET_TIME", MAX_TIME);
                  setAttemptScores((prev) => ({
                    ...prev,
                    [currentAttempt]: { time: 0, restarts: 0, faults: 0 },
                  }));
                  setShowMoreActions(false);
                },
                "warning",
              );
            }}
          />
          <ActionButton
            icon={Clock}
            size="py-3"
            label="Pausa Solicitada"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Pausa de 3 Minutos",
                "El capitán solicitó pausa (solo válida antes de Iniciar Recorrido).",
                () => {
                  setRepairTimer(180);
                  setIsRepairRunning(false);
                  setShowMoreActions(false);
                },
                "info",
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
                "Retiro",
                "¿El equipo solicitó retiro voluntario?",
                () => {
                  onControl(match.id, "PAUSE");
                  setShowMoreActions(false);
                  alert("RETIRO REGISTRADO.");
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
          <div className="w-full grid grid-cols-2 gap-2 mb-4 bg-cb-white-tech border-3 border-cb-black-pure p-3 text-white">
            <div className="flex flex-col items-center border-r-2 border-dashed border-neutral-600">
              <span className="text-xs font-tech text-cb-black-pure">
                REARRANQUES (-15s c/u)
              </span>
              <span className="text-3xl font-tech font-black text-cb-black-pure">
                {attemptScores[currentAttempt].restarts}/2
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-tech text-cb-black-pure">
                FALTAS TOTALES
              </span>
              <span className="text-3xl font-tech font-black text-cb-black-pure">
                {attemptScores[currentAttempt].faults}
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
                label="Rearranque"
                color="bg-cb-green-vibrant"
                textColor="text-cb-black-pure"
                disabled={!match.isActive || attemptScores[currentAttempt].restarts >= 2}
                onClick={handleRestartEvent}
              />
              <ActionButton
                size="py-2"
                icon={AlertTriangle}
                label="Salida de Pista"
                color="bg-cb-green-vibrant"
                textColor="text-cb-black-pure"
                disabled={!match.isActive}
                onClick={() => handleFault("Salida de Pista")}
              />
              <ActionButton
                size="py-2"
                icon={AlertTriangle}
                label="Dirección Mal"
                color="bg-cb-green-vibrant"
                textColor="text-cb-black-pure"
                disabled={!match.isActive}
                onClick={() => handleFault("Sentido Contrario")}
              />
              <ActionButton
                size="py-2"
                icon={Wrench}
                label="Violación Genérica"
                color="bg-cb-green-vibrant"
                textColor="text-cb-black-pure"
                disabled={!match.isActive}
                onClick={() => handleFault("Violación General")}
              />
            </div>
          </div>

          <div className="w-full mt-2 border-t-2 border-black border-dashed pt-4">
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                size="py-2"
                icon={Flag}
                label="¡LLEGÓ A META!"
                color="bg-cb-yellow-neon"
                textColor="text-cb-black-pure"
                disabled={!match.isActive}
                onClick={() => {
                  openConfirm(
                    "Registro de Llegada",
                    "¿Robot llegó a la meta? Se detendrá el tiempo automáticamente y guardará para el intento atual.",
                    () => finishAttempt(),
                    "info",
                  );
                }}
              />
              <ActionButton
                size="py-2"
                icon={XCircle}
                label="Eliminar Equipo (Grave)"
                color="bg-red-500"
                textColor="text-white"
                className="text-xs"
                disabled={!match.isActive}
                onClick={() => {
                  openConfirm(
                    "Penalización Grave",
                    "Eliminación automática por daños al área, agresión o fraude. ¿Proceder?",
                    () => {
                      onControl(match.id, "PAUSE");
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
      <div className="mt-4 px-2">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <ActionButton
            icon={Save}
            label="Guardar Mejor Intento"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => setBestAttemptAsFinal()}
          />
          <ActionButton
            icon={Trophy}
            label="Declarar Listo"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Finalizar Evaluación",
                "¿Guardar y finalizar este participante?",
                () => {
                    setBestAttemptAsFinal();
                    onControl(match.id, "FINISH");
                },
                "warning",
              );
            }}
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
