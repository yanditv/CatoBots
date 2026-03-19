import { useState, useEffect } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ActionButton } from "../../components/ActionButton";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Flame,
  Hammer,
  AlertTriangle,
  Clock,
  XCircle,
  Sword,
  CornerDownRight,
  MoreVertical,
} from "lucide-react";
import type { MatchState } from "../../App";

interface BattleBotsControlProps {
  match: MatchState;
  onControl: (matchId: string, action: string, payload?: any) => void;
  formatTime: (seconds: number) => string;
}

export const BattleBotsControl = ({
  match,
  onControl,
  formatTime,
}: BattleBotsControlProps) => {
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Specific BattleBots timers
  const [immobilizeTimerA, setImmobilizeTimerA] = useState<number | null>(null);
  const [immobilizeTimerB, setImmobilizeTimerB] = useState<number | null>(null);

  // Pause/Reparation timer (1 min)
  const [pauseTimer, setPauseTimer] = useState<number | null>(null);
  const [isPauseRunning, setIsPauseRunning] = useState(false);

  // Pre-match prolongation (3 mins)
  const [prolongationTimer, setProlongationTimer] = useState<number | null>(
    null,
  );
  const [isProlongationRunning, setIsProlongationRunning] = useState(false);

  const [isSuddenDeath, setIsSuddenDeath] = useState(false);

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

  // Initialize time to 120s (2 mins)
  useEffect(() => {
    if (
      match.timeLeft === 180 &&
      !match.isActive &&
      match.scoreA === 0 &&
      match.scoreB === 0
    ) {
      onControl(match.id, "SET_TIME", 120);
    }
  }, [
    match.timeLeft,
    match.isActive,
    onControl,
    match.id,
    match.scoreA,
    match.scoreB,
  ]);

  // Immobilization logic (10s)
  useEffect(() => {
    let interval: any;
    if (immobilizeTimerA !== null && immobilizeTimerA > 0) {
      interval = setInterval(
        () => setImmobilizeTimerA((prev) => prev! - 1),
        1000,
      );
    } else if (immobilizeTimerA === 0) {
      onControl(match.id, "ADD_SCORE_B", 20); // Opponent gets 20 pts
      setImmobilizeTimerA(null);
      // Resume only if we want to resume automatically after 10s or per judge command
      // The rules say "continuar con la batalla" after separation. Usually judge restarts manually,
      // but user said "cuando se cancele se debe reanudar" and "cuando termine se debe reanudar".
      onControl(match.id, "START");
      openConfirm(
        "Inmovilidad Finalizada",
        "Robot A inmovilizado por 10s. +20 pts para Robot B. El tiempo se ha reanudado.",
        () => {},
        "info",
      );
    }
    return () => clearInterval(interval);
  }, [immobilizeTimerA, match.id, onControl]);

  useEffect(() => {
    let interval: any;
    if (immobilizeTimerB !== null && immobilizeTimerB > 0) {
      interval = setInterval(
        () => setImmobilizeTimerB((prev) => prev! - 1),
        1000,
      );
    } else if (immobilizeTimerB === 0) {
      onControl(match.id, "ADD_SCORE_A", 20); // Opponent gets 20 pts
      setImmobilizeTimerB(null);
      onControl(match.id, "START");
      openConfirm(
        "Inmovilidad Finalizada",
        "Robot B inmovilizado por 10s. +20 pts para Robot A. El tiempo se ha reanudado.",
        () => {},
        "info",
      );
    }
    return () => clearInterval(interval);
  }, [immobilizeTimerB, match.id, onControl]);

  // Pause Timer logic (60s)
  useEffect(() => {
    let interval: any;
    if (isPauseRunning && pauseTimer !== null && pauseTimer > 0) {
      interval = setInterval(() => setPauseTimer((prev) => prev! - 1), 1000);
    } else if (pauseTimer === 0) {
      setIsPauseRunning(false);
      setPauseTimer(null);
      onControl(match.id, "START"); // Resume main timer
    }
    return () => clearInterval(interval);
  }, [isPauseRunning, pauseTimer, match.id, onControl]);

  // Prolongation logic (180s)
  useEffect(() => {
    let interval: any;
    if (
      isProlongationRunning &&
      prolongationTimer !== null &&
      prolongationTimer > 0
    ) {
      interval = setInterval(
        () => setProlongationTimer((prev) => prev! - 1),
        1000,
      );
    } else if (prolongationTimer === 0) {
      setIsProlongationRunning(false);
      setProlongationTimer(null);
      onControl(match.id, "START"); // Resume main fight
    }
    return () => clearInterval(interval);
  }, [isProlongationRunning, prolongationTimer, match.id, onControl]);

  const handleMalfunction = (who: "A" | "B") => {
    const robot = who === "A" ? match.robotA : match.robotB;
    const opponent = who === "A" ? match.robotB : match.robotA;
    openConfirm(
      "Desperfecto Grave / Rendición",
      `¿Declarar desperfecto grave o rendición para ${robot?.name}? Se dará como vencedor a ${opponent?.name}.`,
      () => {
        // onControl(match.id, "PAUSE");
        onControl(match.id, "BB_SURRENDER", who);
      },
      "danger",
    );
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="sticky top-0 z-50 bg-neutral-100 border-b-4 border-cb-black-pure shadow-md p-2 flex items-center justify-between gap-2">
        <button
          className={`flex-shrink-0 w-16 h-12 flex items-center justify-center border-2 border-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all ${match.isActive ? "bg-cb-yellow-neon text-cb-black-pure" : "bg-cb-green-vibrant text-cb-black-pure"}`}
          onClick={() =>
            onControl(match.id, match.isActive ? "PAUSE" : "START")
          }
        >
          {match.isActive ? (
            <Pause size={24} strokeWidth={3} />
          ) : (
            <Play size={24} strokeWidth={3} />
          )}
        </button>

        <div className="flex-1 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-cb-black-pure shadow-[2px_2px_0_#CBFF00] relative">
          <span className="absolute top-0 left-1 text-[10px] text-cb-green-vibrant font-tech">
            {isSuddenDeath ? "MUERTE SÚBITA" : match.category.toUpperCase()}
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

      {/* Auxiliary Timers Display */}
      {(pauseTimer !== null || prolongationTimer !== null) && (
        <div className="grid grid-cols-1 gap-1">
          {pauseTimer !== null && (
            <div className="bg-cb-yellow-neon border-x-4 border-cb-black-pure p-2 flex justify-between items-center px-4">
              <span className="font-tech font-black text-xs text-cb-black-pure uppercase flex items-center gap-2">
                <Clock size={16} /> Tiempo Accidente: {formatTime(pauseTimer)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPauseTimer(null);
                    setIsPauseRunning(false);
                    onControl(match.id, "START");
                  }}
                  className="bg-cb-black-pure text-white px-3 py-1 text-[10px] font-tech font-black uppercase border-2 border-cb-black-pure"
                >
                  Continuar Combate
                </button>
              </div>
            </div>
          )}
          {prolongationTimer !== null && (
            <div className="bg-cb-white-tech border-x-4 border-cb-black-pure p-2 flex justify-between items-center px-4">
              <span className="font-tech font-black text-xs text-cb-black-pure uppercase flex items-center gap-2">
                <Timer size={16} /> Prórroga Reglamentaria:{" "}
                {formatTime(prolongationTimer)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsProlongationRunning(false);
                    setProlongationTimer(null);
                    onControl(match.id, "START");
                  }}
                  className="bg-cb-black-pure text-white px-3 py-1 text-[10px] font-tech font-black uppercase border-2 border-cb-black-pure"
                >
                  Continuar Combate
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showMoreActions && (
        <div className="bg-neutral-200 border-b-4 border-cb-black-pure p-2 grid grid-cols-2 gap-2 shadow-inner">
          <ActionButton
            icon={RotateCcw}
            size="py-3"
            label="Reinicio (2m)"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Reiniciar Encuentro",
                "¿Reiniciar tiempo y puntajes?",
                () => {
                  onControl(match.id, "RESET", 120);
                  setIsSuddenDeath(false);
                  setShowMoreActions(false);
                  // Clear local timers
                  setImmobilizeTimerA(null);
                  setImmobilizeTimerB(null);
                  setPauseTimer(null);
                  setIsPauseRunning(false);
                  setProlongationTimer(null);
                  setIsProlongationRunning(false);
                },
              );
            }}
          />
          <ActionButton
            icon={Clock}
            size="py-3"
            label="Tiempo Accidente (1m)"
            color="bg-white"
            textColor="text-cb-black-pure"
            disabled={match.isFinished || !match.isActive}
            onClick={() => {
              setPauseTimer(60);
              setIsPauseRunning(true);
              onControl(match.id, "BB_ACCIDENT_START");
              setShowMoreActions(false);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 md:gap-5 px-1 mt-2">
        {/* Robot A Card */}
        <div
          className={`flex-1 p-3 md:p-6 border-4 text-center relative flex flex-col justify-center items-center transition-all ${
            match.isFinished &&
            match.winnerId &&
            match.winnerId !== match.robotA?.id
              ? "bg-cb-white-tech border-cb-black-pure opacity-30 grayscale"
              : "bg-cb-white-tech border-cb-black-pure"
          }`}
        >
          <h2 className="text-sm md:text-xl font-tech font-black uppercase truncate px-2 w-full mt-2 text-cb-black-pure">
            {match.robotA?.name || "---"}
          </h2>
          <div className="text-6xl md:text-8xl font-tech font-black my-4 text-cb-black-pure drop-shadow-[2px_2px_0_#FFF] z-10">
            {match.scoreA}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={Flame}
              label="Inmov. (+20)"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() =>
                onControl(match.id, "ADD_SCORE_A", {
                  points: 20,
                  reason: "Inmovilización",
                })
              }
            />
            <ActionButton
              size="py-2"
              icon={Hammer}
              label="Embestida (+5)"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() =>
                onControl(match.id, "ADD_SCORE_A", {
                  points: 5,
                  reason: "Embestida",
                })
              }
            />
            <ActionButton
              size="py-2"
              icon={CornerDownRight}
              label="Vuelco (+10)"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() =>
                onControl(match.id, "ADD_SCORE_A", {
                  points: 10,
                  reason: "Vuelco",
                })
              }
            />
            <ActionButton
              size="py-2"
              icon={Sword}
              label="Armas (+20)"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() =>
                onControl(match.id, "ADD_SCORE_A", {
                  points: 20,
                  reason: "Armas",
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:gap-3 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label="Amonestación (-5)"
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() => {
                onControl(match.id, "ADD_SCORE_A", -5);
                onControl(match.id, "ADD_PENALTY_A", "Amo");
              }}
            />
            <ActionButton
              size="py-2"
              icon={XCircle}
              label="Mal Desempeño"
              color="bg-red-500"
              textColor="text-white"
              disabled={!match.isActive}
              onClick={() => handleMalfunction("A")}
            />
          </div>
        </div>

        {/* Robot B Card */}
        <div
          className={`flex-1 p-3 md:p-6 border-4 text-center relative flex flex-col justify-center items-center transition-all ${
            match.isFinished &&
            match.winnerId &&
            match.winnerId !== match.robotB?.id
              ? "bg-cb-white-tech border-cb-black-pure opacity-30 grayscale"
              : "bg-cb-white-tech border-cb-black-pure"
          }`}
        >
          <h2 className="text-sm md:text-xl font-tech font-black uppercase truncate px-2 w-full mt-2 text-cb-black-pure">
            {match.robotB?.name || "---"}
          </h2>
          <div className="text-6xl md:text-8xl font-tech font-black my-4 text-cb-black-pure drop-shadow-[2px_2px_0_#FFF] z-10">
            {match.scoreB}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={Flame}
              label="Inmovilizado (+20)"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() =>
                onControl(match.id, "ADD_SCORE_B", {
                  points: 20,
                  reason: "Inmovilización",
                })
              }
            />
            <ActionButton
              size="py-2"
              icon={Hammer}
              label="Embestida (+5)"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() =>
                onControl(match.id, "ADD_SCORE_B", {
                  points: 5,
                  reason: "Embestida",
                })
              }
            />
            <ActionButton
              size="py-2"
              icon={CornerDownRight}
              label="Vuelco (+10)"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() =>
                onControl(match.id, "ADD_SCORE_B", {
                  points: 10,
                  reason: "Vuelco",
                })
              }
            />
            <ActionButton
              size="py-2"
              icon={Sword}
              label="Armas (+20)"
              color="bg-cb-green-vibrant"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() =>
                onControl(match.id, "ADD_SCORE_B", {
                  points: 20,
                  reason: "Armas",
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:gap-3 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label="Amonestación (-5)"
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() => {
                onControl(match.id, "ADD_SCORE_B", -5);
                onControl(match.id, "ADD_PENALTY_B", "Amo");
              }}
            />
            <ActionButton
              size="py-2"
              icon={XCircle}
              label="Mal Desempeño"
              color="bg-red-500"
              textColor="text-white"
              disabled={!match.isActive}
              onClick={() => handleMalfunction("B")}
            />
          </div>

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
