import { useState, useEffect, type ElementType } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Flame,
  Hammer,
  AlertTriangle,
  StopCircle,
  Flag,
  Wrench,
  User,
  Clock,
  XCircle,
  Trophy,
  Zap,
  Activity,
  MoreVertical,
} from "lucide-react";
import type { MatchState } from "../../App";

interface CombatControlProps {
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
    <Icon size={24} strokeWidth={2.5} className="mb-1"/>
    <span className="leading-tight text-center px-1">{label}</span>
  </button>
);

export const CombatControl = ({
  match,
  onControl,
  formatTime,
}: CombatControlProps) => {
  const isPalitos = match.category.toLowerCase().includes("palitos");
  const [immobilizeTimerA, setImmobilizeTimerA] = useState<number | null>(null);
  const [immobilizeTimerB, setImmobilizeTimerB] = useState<number | null>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);

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

  // Initialize time properly if it was not started yet from 2 mins
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

  // Handle Immo countdown
  useEffect(() => {
    let interval: any;
    if (immobilizeTimerA !== null && immobilizeTimerA > 0) {
      interval = setInterval(
        () => setImmobilizeTimerA((prev) => prev! - 1),
        1000,
      );
    } else if (immobilizeTimerA === 0) {
      onControl(match.id, "ADD_SCORE_B", 20); // +20 pts to opponent
      setImmobilizeTimerA(null);
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
      onControl(match.id, "ADD_SCORE_A", 20); // +20 pts to opponent
      setImmobilizeTimerB(null);
    }
    return () => clearInterval(interval);
  }, [immobilizeTimerB, match.id, onControl]);

  return (
    <div className="flex flex-col gap-2 relative">
      {/* 1. STICKY HEADER: Timer & Primary Controls */}
      <div className="sticky top-0 z-50 bg-neutral-100 border-b-4 border-cb-black-pure shadow-md p-2 flex items-center justify-between gap-2">
        {/* Play/Pause */}
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

        {/* Timer Display */}
        <div
          className={`flex-1 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-cb-black-pure shadow-[2px_2px_0_#CBFF00]`}
        >
          <div
            className={`font-mono font-black text-3xl tracking-widest ${match.timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-cb-white-tech"}`}
          >
            {formatTime(match.timeLeft)}
          </div>
        </div>

        {/* More Actions Toggle */}
        <button
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-white text-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all"
          onClick={() => setShowMoreActions(!showMoreActions)}
        >
          <MoreVertical size={24} strokeWidth={3} />
        </button>
      </div>

      {/* 2. EXPANDABLE "MORE ACTIONS" PANEL */}
      {showMoreActions && (
        <div className="bg-neutral-200 border-b-4 border-cb-black-pure p-2 grid grid-cols-3 gap-2 shadow-inner">
          <ActionButton
            icon={RotateCcw}
            size="py-3"
            label="Reinicio"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Reiniciar Encuentro",
                "¿Reiniciar a 2 minutos?",
                () => {
                  onControl(match.id, "RESET", 120);
                  setImmobilizeTimerA(null);
                  setImmobilizeTimerB(null);
                  setShowMoreActions(false);
                },
                "warning",
              );
            }}
          />
          <ActionButton
            icon={Clock}
            size="py-3"
            label="Tiempo Muerto"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Tiempo Muerto",
                "Cronometrar 1 minuto localmente.",
                () => {
                  setShowMoreActions(false);
                },
                "info",
              );
            }}
          />
          <ActionButton
            icon={Timer}
            size="py-3"
            label="+3m"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Prórroga por Retraso",
                "¿Añadir prórroga de 3 mins?",
                () => {
                  onControl(match.id, "ADD_TIME", 180);
                  setShowMoreActions(false);
                },
                "warning",
              );
            }}
          />
          <ActionButton
            icon={Flag}
            size="py-3"
            label="Rendición"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Rendición",
                "¿Detener por rendición?",
                () => {
                  onControl(match.id, "PAUSE");
                  setShowMoreActions(false);
                },
                "danger",
              );
            }}
          />
          <ActionButton
            icon={Wrench}
            size="py-3"
            label="Falla"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Desperfecto",
                "¿Detener por falla grave?",
                () => {
                  onControl(match.id, "PAUSE");
                  setShowMoreActions(false);
                },
                "danger",
              );
            }}
          />
          <ActionButton
            icon={User}
            size="py-3"
            label="Capitán"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Solicitud",
                "¿Detener por capitán?",
                () => {
                  onControl(match.id, "PAUSE");
                  setShowMoreActions(false);
                },
                "danger",
              );
            }}
          />
        </div>
      )}

      {/* 3. ROBOT CARDS (Compact layout) */}
      <div className="grid gap-4 md:gap-5 px-2">
        {/* Robot A */}
        <div className="flex-1 p-3 md:p-6 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm relative overflow-hidden flex flex-col justify-center items-center">
          {match.winnerId === match.robotA?.id && (
            <div className="absolute top-0 right-0 bg-cb-green-vibrant text-cb-black-pure font-tech font-black text-xs md:text-sm p-2 border-l-4 border-b-4 border-cb-black-pure flex items-center gap-2">
              <Trophy size={16} /> GANADOR
            </div>
          )}
          {/* Header Row: Name + Score */}
          <h2 className="text-sm md:text-xl font-tech font-black uppercase text-cb-black-pure truncate px-2 w-full mt-2 lg:mt-0">
            {match.robotA?.name || "---"}
          </h2>
          <div className="text-6xl md:text-8xl font-tech font-black my-4 text-cb-black-pure drop-shadow-[2px_2px_0_#000]">
            {match.scoreA}
          </div>

          {/* Scoring Grid */}
          <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-3 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={Hammer}
              label="+5"
              color="bg-green-400"
              textColor="text-cb-black-pure"
              onClick={() => onControl(match.id, "ADD_SCORE_A", 5)}
            />
            <ActionButton
              size="py-2"
              icon={RotateCcw}
              label="+10"
              color="bg-green-400"
              textColor="text-cb-black-pure"
              disabled={isPalitos}
              onClick={() => onControl(match.id, "ADD_SCORE_A", 10)}
            />
            <ActionButton
              size="py-2"
              icon={Flame}
              label={`+${isPalitos ? 10 : 20}`}
              color="bg-green-400"
              textColor="text-cb-black-pure"
              onClick={() =>
                onControl(match.id, "ADD_SCORE_A", isPalitos ? 10 : 20)
              }
            />
            <ActionButton
              size="py-2"
              icon={StopCircle}
              label="+20"
              color="bg-green-400"
              textColor="text-cb-black-pure"
              onClick={() => onControl(match.id, "ADD_SCORE_A", 20)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-3 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label="Amonestación (-5)"
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              onClick={() => {
                onControl(match.id, "ADD_SCORE_A", -5);
                onControl(match.id, "ADD_PENALTY_A", "Amo");
              }}
            />
            <ActionButton
              size="py-2"
              icon={XCircle}
              label="Descalificar"
              color="bg-red-500"
              textColor="text-white"
              onClick={() => {
                openConfirm(
                  "Descalificar Robot",
                  `¿Descalificar a ${match.robotA?.name || "Robot A"}?`,
                  () => {
                    onControl(match.id, "ADD_PENALTY_A", "DQ");
                  },
                  "danger",
                );
              }}
            />
          </div>

          {/* Immobilization specific timer */}
          {immobilizeTimerA !== null ? (
            <button
              className="bg-red-500 border-3 border-cb-black-pure py-2 px-3 text-center text-white font-tech font-black active:scale-95 flex items-center justify-center gap-2 w-full uppercase"
              onClick={() => setImmobilizeTimerA(null)}
            >
              <StopCircle size={20} /> CANCELAR SEPARACIÓN A ({immobilizeTimerA}s)
            </button>
          ) : (
            <button
              onClick={() => {
                setImmobilizeTimerA(10);
                onControl(match.id, "PAUSE");
              }}
              className="w-full py-2 bg-yellow-400 text-cb-black-pure font-tech font-black border-3 border-cb-black-pure uppercase hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] transition-all flex items-center justify-center gap-2"
            >
              <StopCircle size={20} /> Iniciar Separación (10s)
            </button>
          )}
        </div>

        {/* Robot B */}
        <div className="flex-1 p-3 md:p-6 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm relative overflow-hidden flex flex-col justify-center items-center">
          {match.winnerId === match.robotB?.id && (
            <div className="absolute top-0 right-0 bg-cb-green-vibrant text-cb-black-pure font-tech font-black text-xs md:text-sm p-2 border-l-4 border-b-4 border-cb-black-pure flex items-center gap-2">
              <Trophy size={16} /> GANADOR
            </div>
          )}
          {/* Header Row: Name + Score */}
          <h2 className="text-sm md:text-xl font-tech font-black uppercase text-cb-black-pure truncate px-2 w-full mt-2 lg:mt-0">
            {match.robotB?.name || "---"}
          </h2>
          <div className="text-6xl md:text-8xl font-tech font-black my-4 text-cb-black-pure drop-shadow-[2px_2px_0_#FFF]">
            {match.scoreB}
          </div>

          {/* Scoring Grid */}
          <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-3 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={Hammer}
              label="+5"
              color="bg-green-400"
              textColor="text-cb-black-pure"
              onClick={() => onControl(match.id, "ADD_SCORE_B", 5)}
            />
            <ActionButton
              size="py-2"
              icon={RotateCcw}
              label="+10"
              color="bg-green-400"
              textColor="text-cb-black-pure"
              disabled={isPalitos}
              onClick={() => onControl(match.id, "ADD_SCORE_B", 10)}
            />
            <ActionButton
              size="py-2"
              icon={Flame}
              label={`+${isPalitos ? 10 : 20}`}
              color="bg-green-400"
              textColor="text-cb-black-pure"
              onClick={() =>
                onControl(match.id, "ADD_SCORE_B", isPalitos ? 10 : 20)
              }
            />
            <ActionButton
              size="py-2"
              icon={StopCircle}
              label="+20"
              color="bg-green-400"
              textColor="text-cb-black-pure"
              onClick={() => onControl(match.id, "ADD_SCORE_B", 20)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-3 w-full mb-3">
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label="Amonestación (-5)"
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              onClick={() => {
                onControl(match.id, "ADD_SCORE_B", -5);
                onControl(match.id, "ADD_PENALTY_B", "Amo");
              }}
            />
            <ActionButton
              size="py-2"
              icon={XCircle}
              label="Descalificar"
              color="bg-red-500"
              textColor="text-white"
              onClick={() => {
                openConfirm(
                  "Descalificar Robot",
                  `¿Descalificar a ${match.robotB?.name || "Robot B"}?`,
                  () => {
                    onControl(match.id, "ADD_PENALTY_B", "DQ");
                  },
                  "danger",
                );
              }}
            />
          </div>

          {/* Immobilization specific timer */}
          {immobilizeTimerB !== null ? (
            <button
              className="bg-red-500 border-3 border-cb-black-pure py-2 px-3 text-center text-white font-tech font-black active:scale-95 flex items-center justify-center gap-2 w-full uppercase"
              onClick={() => setImmobilizeTimerB(null)}
            >
              <StopCircle size={20} /> CANCELAR SEPARACIÓN B ({immobilizeTimerB}s)
            </button>
          ) : (
            <button
              onClick={() => {
                setImmobilizeTimerB(10);
                onControl(match.id, "PAUSE");
              }}
              className="w-full py-2 bg-yellow-400 text-cb-black-pure font-tech font-black border-3 border-cb-black-pure uppercase hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] transition-all flex items-center justify-center gap-2"
            >
              <StopCircle size={20} /> Iniciar Separación (10s)
            </button>
          )}
        </div>
      </div>

      {/* 4. BOTTOM FIXED BAR: RESOLUTION */}
      <div className="mt-4 px-2">
        <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-3">
          <ActionButton
            icon={Activity}
            label="Fin Asalto"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Finalizar Asalto",
                "¿Detener tiempo y marcar fin de asalto?",
                () => {
                  onControl(match.id, "PAUSE");
                  onControl(match.id, "SET_TIME", 0);
                },
                "warning",
              );
            }}
          />
          <ActionButton
            icon={Zap}
            label="Muerte Súbita"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Muerte Súbita",
                "¿Iniciar muerte súbita?",
                () => {},
                "danger",
              );
            }}
          />
          <ActionButton
            icon={Hammer}
            label="Ver Total"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Puntuación Actual",
                `${match.robotA?.name || "A"}: ${match.scoreA} pts \n ${match.robotB?.name || "B"}: ${match.scoreB} pts`,
                () => {},
                "info",
              );
            }}
          />
          <ActionButton
            icon={Trophy}
            label={match.isFinished ? "Cambiar Ganador" : "Declarar Ganador"}
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Declarar Ganador",
                "¿Declarar al ganador ahora?",
                () => {
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
