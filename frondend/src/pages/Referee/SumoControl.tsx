import { useState, useEffect } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ActionButton } from "../../components/ActionButton";
import {
  Play,
  Pause,
  RotateCcw,
  ArrowUpFromLine,
  CircleDot,
  Wrench,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  MoreVertical,
  Zap,
  StopCircle,
  Flag,
} from "lucide-react";
import type { MatchState } from "../../App";

interface SumoControlProps {
  match: MatchState;
  onControl: (matchId: string, action: string, payload?: any) => void;
  formatTime: (seconds: number) => string;
}



export const SumoControl = ({
  match,
  onControl,
  formatTime,
}: SumoControlProps) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isFinalPhase, setIsFinalPhase] = useState(false);

  // Specific Sumo timers
  const [immobilizeTimerA, setImmobilizeTimerA] = useState<number | null>(null);
  const [immobilizeTimerB, setImmobilizeTimerB] = useState<number | null>(null);

  // Repair time state
  const [repairTimer, setRepairTimer] = useState<number | null>(null);
  const [isRepairRunning, setIsRepairRunning] = useState(false);

  // Violations (2 = round loss in SUMO)
  const [violationsA, setViolationsA] = useState(0);
  const [violationsB, setViolationsB] = useState(0);

  // Extra round / Sudden death state
  const [isExtraRound, setIsExtraRound] = useState(false);

  const totalRoundsPlayed = match.scoreA + match.scoreB;
  const currentRound = Math.min(totalRoundsPlayed + 1, 3);
  const displayRound = isExtraRound ? "EXTRA" : currentRound;

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

  // Initialize time properly to 60s
  useEffect(() => {
    if (
      match.timeLeft === 180 &&
      !match.isActive &&
      match.scoreA === 0 &&
      match.scoreB === 0
    ) {
      onControl(match.id, "SET_TIME", 60);
    }
  }, [
    match.timeLeft,
    match.isActive,
    onControl,
    match.id,
    match.scoreA,
    match.scoreB,
  ]);

  const handleRoundWin = (who: "A" | "B" | "NULL") => {
    if (who !== "NULL") {
      onControl(match.id, `ADD_SCORE_${who}`, 1);
    }
    onControl(match.id, "PAUSE");
    onControl(match.id, "SET_TIME", 60);
    setImmobilizeTimerA(null);
    setImmobilizeTimerB(null);
    setViolationsA(0); // reset violations for the new round
    setViolationsB(0);
  };

  // Immobilize Timer Hook
  useEffect(() => {
    let interval: any;
    if (immobilizeTimerA !== null && immobilizeTimerA > 0) {
      interval = setInterval(
        () => setImmobilizeTimerA((prev) => prev! - 1),
        1000,
      );
    } else if (immobilizeTimerA === 0) {
      openConfirm(
        "Inmovilidad Completada",
        "Robot A inmóvil por 15s. Gana Robot B el round.",
        () => handleRoundWin("B"),
        "info",
      );
      setImmobilizeTimerA(null);
    }
    return () => clearInterval(interval);
  }, [immobilizeTimerA]);

  useEffect(() => {
    let interval: any;
    if (immobilizeTimerB !== null && immobilizeTimerB > 0) {
      interval = setInterval(
        () => setImmobilizeTimerB((prev) => prev! - 1),
        1000,
      );
    } else if (immobilizeTimerB === 0) {
      openConfirm(
        "Inmovilidad Completada",
        "Robot B inmóvil por 15s. Gana Robot A el round.",
        () => handleRoundWin("A"),
        "info",
      );
      setImmobilizeTimerB(null);
    }
    return () => clearInterval(interval);
  }, [immobilizeTimerB]);

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

  const addViolation = (who: "A" | "B") => {
    const current = who === "A" ? violationsA : violationsB;
    if (current + 1 === 2) {
      openConfirm(
        "Límite de Violaciones",
        `El Robot ${who} ha cometido 2 violaciones y pierde este ROUND.`,
        () => {
          handleRoundWin(who === "A" ? "B" : "A");
        },
        "danger",
      );
    } else {
      if (who === "A") setViolationsA((v) => v + 1);
      else setViolationsB((v) => v + 1);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative">
      {/* 1. STICKY HEADER: Timer & Primary Controls */}
      <div className="sticky top-0 z-50 bg-neutral-100 border-4 border-cb-black-pure shadow-md p-2 flex items-center justify-between gap-2">
        <button
          className={`flex-shrink-0 w-16 h-12 flex items-center justify-center border-2 border-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all ${match.isActive ? "bg-cb-yellow-neon text-cb-black-pure" : "bg-cb-green-vibrant text-cb-black-pure"}`}
          onClick={() => {
            if (repairTimer !== null && isRepairRunning) return; // Prevent starting if repair is running
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
            {isFinalPhase ? "FINAL DE SUMO" : "SUMO"} / ROUND {displayRound}
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

      {/* REPAIR TIMER BANNER */}
      {repairTimer !== null && (
        <div className="bg-red-500 text-white font-tech font-bold uppercase p-3 border-4 border-cb-black-pure flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Wrench size={20} /> TIEMPO DE REPARACIÓN: {formatTime(repairTimer)}
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

      {/* 2. EXPANDABLE "MORE ACTIONS" PANEL */}
      {showMoreActions && (
        <div className="bg-neutral-200 border-b-4 border-cb-black-pure p-2 grid grid-cols-3 gap-2 shadow-inner">
          <ActionButton
            icon={Flag}
            size="py-3"
            label={isFinalPhase ? "Quitar Final" : "Marcar Final"}
            color={isFinalPhase ? "bg-white" : "bg-cb-yellow-neon"}
            textColor="text-cb-black-pure"
            onClick={() => {
              setIsFinalPhase(!isFinalPhase);
              setShowMoreActions(false);
            }}
          />
          <ActionButton
            icon={RotateCcw}
            size="py-3"
            label="Reinicio a 60s"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Reiniciar Round",
                "¿Reiniciar SOLO ESTE ROUND a 60 segundos?",
                () => {
                  onControl(match.id, "SET_TIME", 60);
                  onControl(match.id, "PAUSE");
                  setImmobilizeTimerA(null);
                  setImmobilizeTimerB(null);
                  setViolationsA(0);
                  setViolationsB(0);
                  setShowMoreActions(false);
                },
                "warning",
              );
            }}
          />
          <ActionButton
            icon={Wrench}
            size="py-3"
            label="Reparación (3m)"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Tiempo de Reparación",
                "Máximo 1 vez por evento. ¿Iniciar 3 minutos de reparación?",
                () => {
                  onControl(match.id, "PAUSE");
                  setRepairTimer(180);
                  setIsRepairRunning(false);
                  setShowMoreActions(false);
                },
                "info",
              );
            }}
          />
          <ActionButton
            icon={RotateCcw}
            size="py-3"
            label="Reiniciar Match Completo"
            color="bg-red-600"
            textColor="text-white"
            onClick={() => {
              openConfirm(
                "Reiniciar Todo",
                "¿Reiniciar TODO a 0-0 y comenzar Round 1?",
                () => {
                  onControl(match.id, "RESET", 60);
                  setImmobilizeTimerA(null);
                  setImmobilizeTimerB(null);
                  setViolationsA(0);
                  setViolationsB(0);
                  setIsExtraRound(false);
                  setShowMoreActions(false);
                },
                "danger",
              );
            }}
          />
          <ActionButton
            icon={Zap}
            size="py-3"
            label="Round Extra / Empate"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Round Extra",
                "¿Iniciar round de desempate (muerte súbita)?",
                () => {
                  setIsExtraRound(true);
                  onControl(match.id, "SET_TIME", 60);
                  onControl(match.id, "PAUSE");
                  setShowMoreActions(false);
                },
                "info",
              );
            }}
          />
        </div>
      )}

      {/* 3. ROBOT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 px-2 mt-2">
        {/* Robot A */}
        <div className="flex-1 p-3 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm relative flex flex-col items-center">
          <h2 className="text-xl font-tech font-black uppercase text-cb-black-pure truncate mt-2">
            {match.robotA?.name || "---"}
          </h2>

          <div className="flex gap-2 justify-center my-3 w-full bg-cb-white-tech border-3 border-cb-black-pure py-2">
            {[1, 2, 3].map((r) => (
              <CircleDot
                key={r}
                size={32}
                className={
                  r <= match.scoreA
                    ? "text-cb-green-vibrant fill-cb-green-vibrant drop-shadow-[2px_2px_0_#000]"
                    : "text-neutral-800"
                }
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={ArrowUpFromLine}
              label="Echar del Dohyo"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive || match.scoreB >= 2 || match.scoreA >= 2}
              onClick={() => {
                openConfirm(
                  "Victoria de Round",
                  "¿Robot A expulsó a su oponente? Gana punto.",
                  () => handleRoundWin("A"),
                  "info",
                );
              }}
            />
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label={`Violación (${violationsA}/2)`}
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() => addViolation("A")}
            />

            <ActionButton
              size="py-2"
              icon={XCircle}
              label="Penalidad Grave"
              color="bg-red-500"
              textColor="text-white"
              disabled={!match.isActive}
              onClick={() => {
                openConfirm(
                  "Penalidad Grave",
                  "Descalificación del combate por daño intencional, separación, líquidos o insultos. ¿Proceder?",
                  () => {
                    openConfirm("Combate Finalizado", "ROBOT A PIERDE EL COMBATE DIRECTAMENTE.", () => {}, "danger");
                  },
                  "danger",
                );
              }}
            />
          </div>

          {/* Immobilization */}
          <div className="w-full mt-auto">
            {immobilizeTimerA !== null ? (
              <ActionButton
                size="py-3"
                icon={StopCircle}
                label={`Cancel. Immov A (${immobilizeTimerA}s)`}
                color="bg-red-500"
                textColor="text-white"
                onClick={() => {
                  setImmobilizeTimerA(null);
                  onControl(match.id, "START");
                }}
              />
            ) : (
              <ActionButton
                size="py-3"
                icon={StopCircle}
                label="Inmovilidad/Volteo (15s)"
                color="bg-neutral-800"
                textColor="text-cb-yellow-neon"
                disabled={!match.isActive || match.scoreB >= 2 || match.scoreA >= 2}
                onClick={() => {
                  setImmobilizeTimerA(15);
                  onControl(match.id, "PAUSE");
                }}
              />
            )}
          </div>
        </div>

        {/* Robot B */}
        <div className="flex-1 p-3 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm relative flex flex-col items-center">
          <h2 className="text-xl font-tech font-black uppercase text-cb-black-pure truncate mt-2">
            {match.robotB?.name || "---"}
          </h2>

          <div className="flex gap-2 justify-center my-3 w-full bg-cb-white-tech border-3 border-cb-black-pure py-2">
            {[1, 2, 3].map((r) => (
              <CircleDot
                key={r}
                size={32}
                className={
                  r <= match.scoreB
                    ? "text-cb-green-vibrant fill-cb-green-vibrant drop-shadow-[2px_2px_0_#000]"
                    : "text-neutral-800"
                }
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={ArrowUpFromLine}
              label="Echar del Dohyo"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive || match.scoreB >= 2 || match.scoreA >= 2}
              onClick={() => {
                openConfirm(
                  "Victoria de Round",
                  "¿Robot B expulsó a su oponente? Gana punto.",
                  () => handleRoundWin("B"),
                  "info",
                );
              }}
            />
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label={`Violación (${violationsB}/2)`}
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() => addViolation("B")}
            />

            <ActionButton
              size="py-2"
              icon={XCircle}
              label="Penalidad Grave"
              color="bg-red-500"
              textColor="text-white"
              disabled={!match.isActive}
              onClick={() => {
                openConfirm(
                  "Penalidad Grave",
                  "Descalificación del combate por daño intencional, separación, líquidos o insultos. ¿Proceder?",
                  () => {
                    openConfirm("Combate Finalizado", "ROBOT B PIERDE EL COMBATE DIRECTAMENTE.", () => {}, "danger");
                  },
                  "danger",
                );
              }}
            />
          </div>
          {/* Immobilization */}
          <div className="w-full mt-auto">
            {immobilizeTimerB !== null ? (
              <ActionButton
                size="py-3"
                icon={StopCircle}
                label={`Cancel. Immov B (${immobilizeTimerB}s)`}
                color="bg-red-500"
                textColor="text-white"
                onClick={() => {
                  setImmobilizeTimerB(null);
                  onControl(match.id, "START");
                }}
              />
            ) : (
              <ActionButton
                size="py-3"
                icon={StopCircle}
                label="Inmovilidad/Volteo (15s)"
                color="bg-neutral-800"
                textColor="text-cb-yellow-neon"
                disabled={!match.isActive || match.scoreB >= 2 || match.scoreA >= 2}
                onClick={() => {
                  setImmobilizeTimerB(15);
                  onControl(match.id, "PAUSE");
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM FIXED BAR: RESOLUTION */}
      <div className="mt-4 px-2">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          <ActionButton
            icon={StopCircle}
            label="Round Empatado"
            color="bg-white"
            textColor="text-cb-black-pure"
            disabled={!match.isActive}
            onClick={() => {
              openConfirm(
                "Round Sin Ganador",
                "Ambos robots fallaron mutuamente, límite de tiempo superado, round empatado sin punto.",
                () => handleRoundWin("NULL"),
                "info",
              );
            }}
          />
          <ActionButton
            icon={Zap}
            label="Muerte Súbita Mult."
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Muerte Súbita",
                "¿Iniciar ronda de muerte súbita para desempate con 3 o más equipos?",
                () => {},
                "info",
              );
            }}
          />
          <ActionButton
            icon={Clock}
            label="Punto Oro Previo"
            color="bg-white"
            textColor="text-cb-black-pure"
            className="md:col-span-1 hidden md:flex"
            onClick={() => {
              openConfirm(
                "Desempate de Historial",
                "Revisar combate previo entre estos dos y dar punto al ganador anterior.",
                () => {},
                "info",
              );
            }}
          />
          <ActionButton
            icon={Activity}
            label="Puntaje Final Combate"
            className="md:col-span-2 text-xs" // Allow span for better text fit
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Puntuación Final Combate",
                "Anota el resultado: 3-0 si ganó directo, 2-1 si cedió 1 round, o 1-1 en caso de empates mutuos.",
                () => {},
                "info",
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
