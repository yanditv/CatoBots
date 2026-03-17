import { useState, useEffect } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ActionButton } from "../../components/ActionButton";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  Save,
  Trophy,
  MoreVertical,
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

  // Rubric state
  const [rubric, setRubric] = useState({
    biomechanic: 0, // max 30
    precision: 0, // max 20
    similarity: 0, // max 20
    design: 0, // max 15
    innovation: 0, // max 15
  });

  // Object tracking: true (success), false (failed), null (not attempted)
  const [objects, setObjects] = useState<(boolean | null)[]>(Array(8).fill(null));

  const totalPoints =
    rubric.biomechanic +
    rubric.precision +
    rubric.similarity +
    rubric.design +
    rubric.innovation;

  const objectSuccessCount = objects.filter((o) => o === true).length;

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

  const handleSaveEvaluation = () => {
    openConfirm(
      "Guardar Evaluación",
      `¿Deseas guardar la rúbrica? Puntaje Total: ${totalPoints}/100. Objetos exitosos: ${objectSuccessCount}/8`,
      () => {
        // En BioBots, a menudo se usa un equipo o es una exhibición. Asignaremos a Robot A por defecto.
        onControl(match.id, "ADD_SCORE_A", totalPoints);
      },
      "info",
    );
  };

  const updateObjectState = (index: number, state: boolean | null) => {
    const newItems = [...objects];
    newItems[index] = state;
    setObjects(newItems);
  };

  // Initialize time properly if it was not started yet from 3 mins for biobots if needed (assuming 3 min max for object lifting, adjust if needed)
  useEffect(() => {
    if (
      match.timeLeft === 180 &&
      !match.isActive &&
      match.scoreA === 0 &&
      match.scoreB === 0
    ) {
      onControl(match.id, "SET_TIME", 180);
    }
  }, [
    match.timeLeft,
    match.isActive,
    onControl,
    match.id,
    match.scoreA,
    match.scoreB,
  ]);

  return (
    <div className="flex flex-col gap-2 relative">
      {/* 1. STICKY HEADER: Timer & Primary Controls */}
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

        <div
          className={`flex-1 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-cb-black-pure shadow-[2px_2px_0_#CBFF00]`}
        >
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
                "Reiniciar Evaluación",
                "¿Borrar evaluación y tiempo?",
                () => {
                  onControl(match.id, "RESET", 180);
                  setRubric({
                    biomechanic: 0,
                    precision: 0,
                    similarity: 0,
                    design: 0,
                    innovation: 0,
                  });
                  setObjects(Array(8).fill(null));
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
                "Cronometrar tiempo muerto localmente.",
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
        </div>
      )}

      {/* 3. EVALUATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 px-2">
        {/* Objects Section */}
        <div className="p-3 md:p-6 bg-cb-white-tech border-4 border-cb-black-pure flex flex-col items-center relative overflow-hidden shadow-block-sm">
          <h2 className="text-xl font-tech font-black uppercase text-cb-black-pure truncate w-full border-b-4 border-cb-black-pure pb-2 text-center mb-4">
            Levantamiento
          </h2>

          <div className="grid grid-cols-1 gap-2 w-full mb-4">
            {objects.map((state, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-2 border-cb-black-pure bg-neutral-100 p-2"
              >
                <span className="font-tech text-cb-black-pure font-bold uppercase text-sm w-1/3">
                  Objeto {i + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={!match.isActive}
                    onClick={() => updateObjectState(i, true)}
                    className={`p-2 border-2 border-cb-black-pure ${state === true ? "bg-cb-green-vibrant text-cb-black-pure shadow-[2px_2px_0_#000]" : "bg-white text-neutral-400"} active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <CheckCircle size={18} strokeWidth={3} />
                  </button>
                  <button
                    disabled={!match.isActive}
                    onClick={() => updateObjectState(i, false)}
                    className={`p-2 border-2 border-cb-black-pure ${state === false ? "bg-red-500 text-cb-black-pure shadow-[2px_2px_0_#000]" : "bg-white text-neutral-400"} active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <XCircle size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto w-full text-center bg-cb-green-vibrant border-4 border-cb-black-pure p-3">
             <span className="font-tech font-black uppercase text-2xl text-cb-black-pure">Exitosos: {objectSuccessCount}</span>
          </div>
        </div>

        {/* Rubric Section */}
        <div className="p-3 md:p-6 bg-cb-gray-industrial border-4 border-cb-black-pure text-center shadow-block-sm relative overflow-hidden flex flex-col justify-start">
          <h2 className="text-xl font-tech font-black uppercase text-white truncate w-full border-b-4 border-cb-black-pure pb-2 text-center mb-4">
            Evaluación (100 pts)
          </h2>

          <div className="space-y-4 w-full">
            <div className="flex flex-col px-2">
              <label className="font-tech font-bold text-xs uppercase flex justify-between text-white">
                <span>F. Biomecánica (30%)</span>
                <span className="text-cb-yellow-neon">{rubric.biomechanic} pts</span>
              </label>
              <input
                disabled={!match.isActive}
                type="range"
                min="0"
                max="30"
                value={rubric.biomechanic}
                onChange={(e) =>
                  setRubric({ ...rubric, biomechanic: Number(e.target.value) })
                }
                className="w-full mt-2 accent-cb-yellow-neon disabled:opacity-50"
              />
            </div>
            
            <div className="flex flex-col px-2">
              <label className="font-tech font-bold text-xs uppercase flex justify-between text-white">
                <span>Precisión (20%)</span>
                <span className="text-cb-yellow-neon">{rubric.precision} pts</span>
              </label>
              <input
                disabled={!match.isActive}
                type="range"
                min="0"
                max="20"
                value={rubric.precision}
                onChange={(e) =>
                  setRubric({ ...rubric, precision: Number(e.target.value) })
                }
                className="w-full mt-2 accent-cb-yellow-neon disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col px-2">
              <label className="font-tech font-bold text-xs uppercase flex justify-between text-white">
                <span>Similitud (20%)</span>
                <span className="text-cb-yellow-neon">{rubric.similarity} pts</span>
              </label>
              <input
                disabled={!match.isActive}
                type="range"
                min="0"
                max="20"
                value={rubric.similarity}
                onChange={(e) =>
                  setRubric({ ...rubric, similarity: Number(e.target.value) })
                }
                className="w-full mt-2 accent-cb-yellow-neon disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col px-2">
              <label className="font-tech font-bold text-xs uppercase flex justify-between text-white">
                <span>Ingenio (15%)</span>
                <span className="text-cb-yellow-neon">{rubric.design} pts</span>
              </label>
              <input
                disabled={!match.isActive}
                type="range"
                min="0"
                max="15"
                value={rubric.design}
                onChange={(e) =>
                  setRubric({ ...rubric, design: Number(e.target.value) })
                }
                className="w-full mt-2 accent-cb-yellow-neon disabled:opacity-50"
              />
            </div>

             <div className="flex flex-col px-2">
              <label className="font-tech font-bold text-xs uppercase flex justify-between text-white">
                <span>Innovación (15%)</span>
                <span className="text-cb-yellow-neon">{rubric.innovation} pts</span>
              </label>
              <input
                disabled={!match.isActive}
                type="range"
                min="0"
                max="15"
                value={rubric.innovation}
                onChange={(e) =>
                  setRubric({ ...rubric, innovation: Number(e.target.value) })
                }
                className="w-full mt-2 accent-cb-yellow-neon disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-auto w-full text-center bg-cb-black-pure border-4 border-cb-black-pure p-3">
             <span className="font-tech font-black text-2xl text-cb-yellow-neon">{totalPoints} PTS</span>
          </div>
          
           {/* Penalties */}
          <div className="grid grid-cols-2 gap-2 mt-4 w-full">
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label="Falta Disc."
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() => {
                openConfirm(
                  "Falta Disciplinaria",
                  "¿Registrar falta y aplicar penalización?",
                  () => {
                    onControl(match.id, "ADD_SCORE_A", -5);
                    onControl(match.id, "ADD_PENALTY_A", "Falta");
                  },
                  "warning",
                );
              }}
            />
            <ActionButton
              size="py-2"
              icon={XCircle}
              label="Descalificar"
              color="bg-red-500"
              textColor="text-white"
              disabled={!match.isActive}
              onClick={() => {
                openConfirm(
                  "Descalificación Directa",
                  "Motivos: Sistema inseguro, Fraude, Antideportivo. ¿Proceder?",
                  () => {
                    onControl(match.id, "ADD_PENALTY_A", "DQ");
                  },
                  "danger",
                );
              }}
            />
          </div>

        </div>
      </div>

      {/* 4. BOTTOM FIXED BAR: RESOLUTION */}
      <div className="mt-4 px-2">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <ActionButton
            icon={Save}
            label="Guardar Rubrica"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={handleSaveEvaluation}
          />
          <ActionButton
            icon={Activity}
            label="Fin Prueba"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Finalizar Prueba",
                `¿Detener tiempo? (Objetos: ${objectSuccessCount}, Puntos: ${totalPoints})`,
                () => {
                  onControl(match.id, "PAUSE");
                  onControl(match.id, "SET_TIME", 0);
                },
                "warning",
              );
            }}
          />
          <ActionButton
            icon={Trophy}
            label="Declarar Listo"
            color="bg-white"
            textColor="text-cb-black-pure"
            onClick={() => {
              openConfirm(
                "Declarar Evaluación Lista",
                "¿Guardar y finalizar para este participante?",
                () => {
                  handleSaveEvaluation();
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
