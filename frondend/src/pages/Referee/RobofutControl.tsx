import React, { useState, useEffect } from "react";
import { ConfirmModal } from "../../components/ConfirmModal";
import { ActionButton } from "../../components/ActionButton";
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  MoreVertical,
  XCircle,
  Wrench,
  Clock,
  AlertTriangle,
  Zap,
  Undo,
  UserX,
} from "lucide-react";
import type { MatchState } from "../../App";

interface RobofutControlProps {
  match: MatchState;
  onControl: (matchId: string, action: string, payload?: any) => void;
  formatTime: (seconds: number) => string;
}

const MatchTimerDisplay = React.memo(({ timeLeft, half, isPenaltyPhase, formatTime }: { timeLeft: number, half: number, isPenaltyPhase: boolean, formatTime: (s: number) => string }) => {
  const isLastSeconds = timeLeft <= 10 && half !== 1;
  const label = isPenaltyPhase ? "PÉNALES" : half === 3 ? "GOL DE ORO" : `TIEMPO ${half}`;
  
  return (
    <div className="flex-1 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-cb-black-pure shadow-[2px_2px_0_#CBFF00] relative">
      <span className="absolute top-0 left-1 text-[10px] text-cb-green-vibrant font-tech">
        ROBOFUT / {label}
      </span>
      <div className={`font-mono font-black text-3xl tracking-widest ${isLastSeconds ? "text-red-500 animate-pulse" : "text-cb-white-tech"}`}>
        {formatTime(Math.max(0, 120 - timeLeft))}
      </div>
    </div>
  );
});

const AuxTimerBanner = React.memo(({ 
  timer, 
  isRunning, 
  isRepair, 
  formatTime, 
  onToggle, 
  onFinish 
}: { 
  timer: number | null, 
  isRunning: boolean, 
  isRepair: boolean, 
  formatTime: (s: number) => string, 
  onToggle: () => void, 
  onFinish: () => void 
}) => {
  if (timer === null) return null;
  return (
    <div className={`text-cb-black-pure font-tech font-bold uppercase p-3 border-4 border-cb-black-pure flex justify-between items-center text-sm ${isRepair ? "bg-red-500 text-white" : "bg-cb-yellow-neon"}`}>
      <div className="flex items-center gap-2">
        {isRepair ? <Wrench size={20} /> : <Clock size={20} />} 
        {isRepair ? "REPARACIÓN" : "CAMBIO DE CANCHA"}: {formatTime(timer)}
      </div>
      <div className="flex gap-2">
        <button onClick={onToggle} className="bg-cb-black-pure text-white px-3 py-1 hover:bg-neutral-800 transition shadow-[2px_2px_0_#000]">
          {isRunning ? "PAUSAR" : "INICIAR"}
        </button>
        <button onClick={onFinish} className="bg-white text-cb-black-pure px-3 py-1 hover:bg-neutral-200 transition shadow-[2px_2px_0_#000]">
          {isRepair ? "LISTO" : "X"}
        </button>
      </div>
    </div>
  );
});

export const RobofutControl = ({
  match,
  onControl,
  formatTime,
}: RobofutControlProps) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [half, setHalf] = useState<1 | 2 | 3>(1); // 1st, 2nd, Golden Goal
  const [isPenaltyPhase, setIsPenaltyPhase] = useState(false);
  const [isTieBreakChoiceOpen, setIsTieBreakChoiceOpen] = useState(false);

  // Timers
  const [auxTimer, setAuxTimer] = useState<number | null>(null); 
  const [isAuxRunning, setIsAuxRunning] = useState(false);
  const [isRepairActive, setIsRepairActive] = useState(false);
  const [courtChangeRemaining, setCourtChangeRemaining] = useState<number | null>(null);

  const [violationsA, setViolationsA] = useState(0);
  const [violationsB, setViolationsB] = useState(0);

  // Infraction Penalty State
  const [isInfractionPenalty, setIsInfractionPenalty] = useState(false);
  const [penaltyTarget, setPenaltyTarget] = useState<"A" | "B" | null>(null);

  // Penalties tracking (Final Phase)
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
      if (isRepairActive && courtChangeRemaining !== null) {
          setAuxTimer(courtChangeRemaining);
          setCourtChangeRemaining(null);
          setIsRepairActive(false);
      } else {
          setIsAuxRunning(false);
          setAuxTimer(null); 
          if (half === 2 && !match.isActive) {
             onControl(match.id, "START");
          }
      }
    }
    return () => clearInterval(interval);
  }, [isAuxRunning, auxTimer, isRepairActive, courtChangeRemaining, half, match.id, match.isActive, onControl]);

  // Handle Match Phase Automation (Transition Half 1 -> Court Change -> Half 2)
  useEffect(() => {
      if (match.timeLeft === 0 && half === 1 && match.isActive) {
          onControl(match.id, "PAUSE");
          setHalf(2);
          onControl(match.id, "SET_TIME", 120); 
          setAuxTimer(30);
          setIsAuxRunning(true);
      }

      if (match.timeLeft === 0 && (half === 2 || half === 3) && match.isActive) {
          onControl(match.id, "PAUSE");
          if (match.scoreA === match.scoreB) {
              setIsTieBreakChoiceOpen(true);
          } else {
               openConfirm("Finalizar Encuentro", "¿Estás seguro de que deseas finalizar el encuentro con el marcador actual?", () => {
                   onControl(match.id, "FINISH");
               }, "info");
          }
      }
  }, [match.timeLeft, half, match.isActive, match.scoreA, match.scoreB, onControl, match.id]);

  const handleGoal = (who: "A" | "B") => {
    onControl(match.id, `ADD_SCORE_${who}`, 1);
    if (half === 3) {
        openConfirm(
          "¡GOL DE ORO!", 
          `¡El Robot ${who} ha anotado el Gol de Oro! El encuentro ha finalizado.`, 
          () => onControl(match.id, "FINISH"),
          "info"
        );
    }
  };

  const handleUndoGoal = (who: "A" | "B") => {
      const current = who === "A" ? match.scoreA : match.scoreB;
      if (current > 0) {
          onControl(match.id, `SET_SCORE_${who}`, current - 1);
      }
  };

  const addInfraction = (who: "A" | "B") => {
    const current = who === "A" ? violationsA : violationsB;
    const opponent = who === "A" ? "B" : "A";
    
    if (current + 1 >= 3) {
      onControl(match.id, "PAUSE");
      openConfirm(
        "¡PENAL!",
        `El Robot ${who} ha llegado a 3 infracciones. El Robot ${opponent} tiene derecho a un TIRO PENAL.`,
        () => {
           setPenaltyTarget(opponent);
           setIsInfractionPenalty(true);
        },
        "warning",
      );
    }
    
    if (who === "A") setViolationsA(v => v + 1);
    else setViolationsB(v => v + 1);
  };

  const handleInfractionPenaltyResult = (scored: boolean) => {
    if (scored && penaltyTarget) {
        onControl(match.id, `ADD_SCORE_${penaltyTarget}`, 1);
    }
    if (penaltyTarget === "B") setViolationsA(0);
    else setViolationsB(0);
    setIsInfractionPenalty(false);
    setPenaltyTarget(null);
  };

  const handleDisqualification = (who: "A" | "B") => {
    const robot = who === "A" ? match.robotA : match.robotB;
    const opponent = who === "A" ? match.robotB : match.robotA;
    
    openConfirm(
      "DESCALIFICACIÓN INMEDIATA",
      `¿Confirmar DESCALIFICACIÓN para ${robot?.name}? Esta acción finalizará el combate otorgando la victoria a ${opponent?.name}.`,
      () => {
          onControl(match.id, "PAUSE");
          // Add a penalty entry to history
          onControl(match.id, who === "A" ? "ADD_PENALTY_A" : "ADD_PENALTY_B", "DESCALIFICACIÓN");
          // Set winning score for opponent and finish
          if (who === "A") {
              onControl(match.id, "SET_SCORE_A", 0);
              onControl(match.id, "SET_SCORE_B", Math.max(match.scoreB, 3));
          } else {
              onControl(match.id, "SET_SCORE_B", 0);
              onControl(match.id, "SET_SCORE_A", Math.max(match.scoreA, 3));
          }
          onControl(match.id, "FINISH");
      },
      "danger"
    );
  };

  const startAuxTimer = (seconds: number) => {
      setAuxTimer(seconds);
      setIsAuxRunning(true);
      setShowMoreActions(false);
  };

  const handleRepairRequest = () => {
    if (auxTimer !== null && !isRepairActive) {
        setCourtChangeRemaining(auxTimer);
        setAuxTimer(120); // 2m
        setIsRepairActive(true);
        setIsAuxRunning(true);
        setShowMoreActions(false);
    } else {
        startAuxTimer(120);
    }
  };

  const cancelOrFinishAux = () => {
      if (isRepairActive && courtChangeRemaining !== null) {
          setAuxTimer(courtChangeRemaining);
          setCourtChangeRemaining(null);
          setIsRepairActive(false);
      } else {
          setAuxTimer(null);
          setIsAuxRunning(false);
          setIsRepairActive(false);
          setCourtChangeRemaining(null);
      }
  };

  return (
    <div className="flex flex-col gap-2 relative">
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

        <MatchTimerDisplay 
          timeLeft={match.timeLeft} 
          half={half} 
          isPenaltyPhase={isPenaltyPhase} 
          formatTime={formatTime} 
        />

        <button
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-cb-black-pure bg-white text-cb-black-pure shadow-[2px_2px_0_#000] active:scale-95 transition-all"
          onClick={() => setShowMoreActions(!showMoreActions)}
        >
          <MoreVertical size={24} strokeWidth={3} />
        </button>
      </div>

      <AuxTimerBanner 
        timer={auxTimer}
        isRunning={isAuxRunning}
        isRepair={isRepairActive}
        formatTime={formatTime}
        onToggle={() => setIsAuxRunning(!isAuxRunning)}
        onFinish={cancelOrFinishAux}
      />

       {showMoreActions && (
        <div className="bg-neutral-200 border-b-4 border-cb-black-pure p-2 flex flex-col gap-2 shadow-inner">
           <div className="grid grid-cols-2 gap-2">
              <ActionButton
                icon={Wrench}
                size="py-3"
                label="Reparación (2m)"
                color="bg-white"
                textColor="text-cb-black-pure"
                disabled={match.isActive}
                onClick={handleRepairRequest}
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
                      setViolationsA(0);
                      setViolationsB(0);
                  }, "danger");
                }}
              />
           </div>
        </div>
      )}

      {isInfractionPenalty && (
        <div className="mt-4 px-2">
            <div className="bg-cb-yellow-neon border-4 border-cb-black-pure p-4 text-center">
                <h3 className="text-cb-black-pure font-tech font-black text-xl mb-2 uppercase flex items-center justify-center gap-2">
                    <Zap size={24}/> TIRO PENAL ACUMULADO <Zap size={24}/>
                </h3>
                <p className="text-cb-black-pure font-tech font-bold mb-4">
                  Cobra el Robot: <span className="underline">{penaltyTarget === "A" ? match.robotA?.name : match.robotB?.name}</span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleInfractionPenaltyResult(true)}
                        className="bg-cb-green-vibrant text-cb-black-pure border-2 border-cb-black-pure py-3 font-black uppercase shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                        ¡GOL!
                    </button>
                    <button 
                        onClick={() => handleInfractionPenaltyResult(false)}
                        className="bg-red-500 text-white border-2 border-cb-black-pure py-3 font-black uppercase shadow-[4px_4px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                        FALLO
                    </button>
                </div>
            </div>
        </div>
      )}

      {isPenaltyPhase && (
        <div className="mt-4 px-2 space-y-4">
           <div className="bg-cb-black-pure border-4 border-cb-yellow-neon p-4 text-center">
              <h3 className="text-cb-yellow-neon font-tech font-black text-xl mb-3 uppercase flex items-center justify-center gap-2">
                 <Zap size={24}/> {penaltyTakedA >= 5 && penaltyTakedB >= 5 && penaltyScoreA === penaltyScoreB ? "MUERTE SÚBITA" : "TANDA DE PENALES"} <Zap size={24}/>
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                 <div className="text-white border-r-2 border-dashed border-neutral-700 pr-2">
                    <div className="text-xs uppercase text-neutral-400 font-tech">{match.robotA?.name || "ROBOT A"}</div>
                    <div className="text-4xl font-black text-cb-green-vibrant">{penaltyScoreA} <span className="text-lg text-neutral-500">/ {penaltyTakedA}</span></div>
                    <div className="flex flex-col gap-2 mt-2">
                       <button 
                          onClick={() => {setPenaltyScoreA(s=>s+1); setPenaltyTakedA(t=>t+1)}} 
                          className="bg-cb-green-vibrant text-cb-black-pure py-2 flex items-center justify-center gap-1 font-black uppercase text-xs"
                        >
                          <Trophy size={14}/> GOL
                        </button>
                       <button 
                          onClick={() => setPenaltyTakedA(t=>t+1)} 
                          className="bg-white text-cb-black-pure py-2 flex items-center justify-center gap-1 font-black uppercase text-xs"
                        >
                          <XCircle size={14}/> FALLO
                        </button>
                    </div>
                 </div>
                 <div className="text-white pl-2">
                    <div className="text-xs uppercase text-neutral-400 font-tech">{match.robotB?.name || "ROBOT B"}</div>
                    <div className="text-4xl font-black text-cb-green-vibrant">{penaltyScoreB} <span className="text-lg text-neutral-500">/ {penaltyTakedB}</span></div>
                    <div className="flex flex-col gap-2 mt-2">
                        <button 
                           onClick={() => {setPenaltyScoreB(s=>s+1); setPenaltyTakedB(t=>t+1)}} 
                           className="bg-cb-green-vibrant text-cb-black-pure py-2 flex items-center justify-center gap-1 font-black uppercase text-xs"
                         >
                           <Trophy size={14}/> GOL
                         </button>
                        <button 
                           onClick={() => setPenaltyTakedB(t=>t+1)} 
                           className="bg-white text-cb-black-pure py-2 flex items-center justify-center gap-1 font-black uppercase text-xs"
                         >
                           <XCircle size={14}/> FALLO
                         </button>
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2 border-t-2 border-neutral-800 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                            openConfirm("Finalizar Penalties", `Declarar GANADOR al Robot ${match.robotA?.name} por penales?`, () => {
                                onControl(match.id, "SET_SCORE_A", match.scoreA + 1); 
                                onControl(match.id, "FINISH");
                            }, "info");
                        }}
                        className="bg-cb-green-vibrant text-cb-black-pure py-3 font-black uppercase text-xs shadow-[2px_2px_0_#fff]"
                      >
                         Gana {match.robotA?.name || "A"}
                      </button>
                      <button 
                        onClick={() => {
                            openConfirm("Finalizar Penalties", `Declarar GANADOR al Robot ${match.robotB?.name} por penales?`, () => {
                                onControl(match.id, "SET_SCORE_B", match.scoreB + 1); 
                                onControl(match.id, "FINISH");
                            }, "info");
                        }}
                        className="bg-cb-green-vibrant text-cb-black-pure py-3 font-black uppercase text-xs shadow-[2px_2px_0_#fff]"
                      >
                         Gana {match.robotB?.name || "B"}
                      </button>
                  </div>
                  <button onClick={() => setIsPenaltyPhase(false)} className="border-2 border-white text-white py-2 font-black uppercase text-xs mt-2">Cerrar Panel</button>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-5 px-2 mt-2">
        <div className="flex-1 p-3 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm flex flex-col items-center">
          <h2 className="text-xl font-tech font-black uppercase text-cb-black-pure break-words whitespace-normal mb-2 w-full px-2">
            {match.robotA?.name || "EQUIPO A"}
          </h2>
          
          <div className="w-full bg-cb-black-pure border-2 border-cb-black-pure py-4 mb-4 flex flex-col items-center">
             <span className="text-[10px] text-cb-green-vibrant font-tech mb-1">MARCADOR GOLES</span>
             <span className="text-5xl font-mono font-black text-cb-white-tech">{match.scoreA}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 w-full mb-3">
             <ActionButton
               size="py-2"
               icon={Trophy}
               label="¡GOL!"
               color="bg-cb-green-vibrant"
               textColor="text-cb-black-pure"
               disabled={!match.isActive}
               onClick={() => handleGoal("A")}
             />
             <ActionButton
               size="py-2"
               icon={Undo}
               label="Quitar Gol"
               color="bg-white"
               textColor="text-cb-black-pure"
               disabled={!match.isActive}
               onClick={() => handleUndoGoal("A")}
             />

            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label={`Infracción (${violationsA}/3)`}
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() => addInfraction("A")}
            />
            <ActionButton
              size="py-2"
              icon={UserX}
              label="Descalificar A"
              color="bg-red-500"
              textColor="text-white"
              disabled={match.isFinished}
              onClick={() => handleDisqualification("A")}
            />
          </div>
        </div>

        <div className="flex-1 p-3 bg-cb-white-tech border-4 border-cb-black-pure text-center shadow-block-sm flex flex-col items-center">
          <h2 className="text-xl font-tech font-black uppercase text-cb-black-pure break-words whitespace-normal mb-2 w-full px-2">
            {match.robotB?.name || "EQUIPO B"}
          </h2>
          
          <div className="w-full bg-cb-black-pure border-2 border-cb-black-pure py-4 mb-4 flex flex-col items-center">
             <span className="text-[10px] text-cb-green-vibrant font-tech mb-1">MARCADOR GOLES</span>
             <span className="text-5xl font-mono font-black text-cb-white-tech">{match.scoreB}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 w-full mb-3">
             <ActionButton
               size="py-2"
               icon={Trophy}
               label="¡GOL!"
               color="bg-cb-green-vibrant"
               textColor="text-cb-black-pure"
               disabled={!match.isActive}
               onClick={() => handleGoal("B")}
             />
             <ActionButton
               size="py-2"
               icon={Undo}
               label="Quitar Gol"
               color="bg-white"
               textColor="text-cb-black-pure"
               disabled={!match.isActive}
               onClick={() => handleUndoGoal("B")}
             />
            <ActionButton
              size="py-2"
              icon={AlertTriangle}
              label={`Infracción (${violationsB}/3)`}
              color="bg-cb-yellow-neon"
              textColor="text-cb-black-pure"
              disabled={!match.isActive}
              onClick={() => addInfraction("B")}
            />
            <ActionButton
              size="py-2"
              icon={UserX}
              label="Descalificar B"
              color="bg-red-500"
              textColor="text-white"
              disabled={match.isFinished}
              onClick={() => handleDisqualification("B")}
            />
          </div>
        </div>
      </div>

      {isTieBreakChoiceOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cb-black-pure/90 animate-in fade-in duration-300">
           <div className="bg-white border-8 border-cb-black-pure p-6 w-full max-w-sm text-center shadow-[10px_10px_0_#CBFF00]">
              <h2 className="text-2xl font-tech font-black uppercase text-cb-black-pure mb-2 flex items-center justify-center gap-2">
                 <Trophy className="text-cb-yellow-neon" /> EMPATE DETECTADO
              </h2>
              <p className="text-cb-black-pure font-tech font-bold mb-6 text-sm">
                Selecciona la modalidad para desempatar el encuentro:
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                  onClick={() => {
                      setHalf(3);
                      onControl(match.id, "SET_TIME", 120);
                      onControl(match.id, "PAUSE");
                      setIsTieBreakChoiceOpen(false);
                  }}
                  className="bg-cb-yellow-neon text-cb-black-pure border-4 border-cb-black-pure py-4 font-black uppercase shadow-[4px_4px_0_#000] active:scale-95 transition-all text-sm"
                 >
                   Gol de Oro (2m)
                 </button>
                 <button 
                  onClick={() => {
                      setIsPenaltyPhase(true);
                      setIsTieBreakChoiceOpen(false);
                  }}
                  className="bg-cb-black-pure text-white border-4 border-cb-black-pure py-4 font-black uppercase shadow-[4px_4px_0_#CBFF00] active:scale-95 transition-all text-sm"
                 >
                   Penales Directos
                 </button>
              </div>
           </div>
        </div>
      )}

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
