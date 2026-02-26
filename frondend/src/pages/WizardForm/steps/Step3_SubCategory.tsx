import { motion } from "framer-motion";
import { Gamepad2, FileText, CheckCircle, Check } from "lucide-react";
import { useState, useMemo } from "react";

interface Step3Props {
    data: {
        category: string;
        juniorCategory: string;
        seniorCategory: string;
        masterCategory: string;
    };
    updateData: (data: any) => void;
    handleNext: () => void;
    handleBack: () => void;
    setShowRules: (show: boolean) => void;
}

export default function Step3_SubCategory({ data, updateData, handleNext, handleBack, setShowRules }: Step3Props) {
    const [rulesAccepted, setRulesAccepted] = useState(false);

    // Derived state for current category configuration
    const config = useMemo(() => {
        if (data.category === "Junior") {
            return {
                options: [
                    "RoboFut", "Minisumo Autónomo", "Laberinto", "BattleBots 1lb",
                    "Seguidor de Línea", "Sumo RC", "Scratch & Play: Code Masters Arena"
                ],
                key: "juniorCategory" as const,
                currentValue: data.juniorCategory
            };
        } else if (data.category === "Senior") {
            return {
                options: [
                    "RoboFut", "Minisumo Autónomo", "Laberinto", "BattleBots 1lb",
                    "Seguidor de Línea", "Sumo RC", "Scratch & Play: Code Masters Arena", "BioBot"
                ],
                key: "seniorCategory" as const,
                currentValue: data.seniorCategory
            };
        } else {
            // Master or default
            return {
                options: [
                    "Minisumo Autónomo", "Seguidor de Línea", "RoboFut Master", "BattleBots 1lb"
                ],
                key: "masterCategory" as const,
                currentValue: data.masterCategory
            };
        }
    }, [data.category, data.juniorCategory, data.seniorCategory, data.masterCategory]);

    const handleSelection = (option: string) => {
        updateData({ [config.key]: option });
    };

    const isNextEnabled = !!config.currentValue && rulesAccepted;

    return (
        <div className="space-y-8">
            <div className="text-center md:text-left mb-10 border-b-4 border-cb-black-pure pb-6">
                <h2 className="text-3xl font-tech font-black text-cb-black-pure mb-2 uppercase drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">
                    ESPECIFICACIÓN <span className="text-cb-white-tech bg-cb-black-pure px-3 py-1 ml-2 shadow-[4px_4px_0_#FFF]">{data.category}</span>
                </h2>
                <p className="font-tech text-cb-black-pure text-lg font-bold mt-4">CONFIRMA LA MODALIDAD DE COMBATE / PRUEBA</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {config.options.map((option) => (
                    <motion.button
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelection(option)}
                        className={`
                            p-4 text-left border-4 transition-all flex items-center gap-4 rounded-none group
                            ${config.currentValue === option
                                ? "border-cb-black-pure bg-cb-yellow-neon shadow-[6px_6px_0_#000]"
                                : "border-cb-black-pure bg-cb-gray-industrial hover:bg-cb-black-pure shadow-block-sm"}
                        `}
                    >
                        <div className={`p-3 border-4 transition-colors ${config.currentValue === option ? "bg-cb-black-pure border-cb-black-pure text-cb-yellow-neon" : "bg-cb-white-tech border-cb-black-pure text-cb-black-pure group-hover:bg-cb-yellow-neon"}`}>
                            <Gamepad2 size={24} strokeWidth={2.5} />
                        </div>
                        
                        <span className={`font-tech font-bold text-lg uppercase transition-colors ${config.currentValue === option ? "text-cb-black-pure" : "text-neutral-400 group-hover:text-cb-white-tech"}`}>
                            {option}
                        </span>

                        {config.currentValue === option && (
                            <div className="ml-auto w-8 h-8 bg-cb-black-pure rounded-full flex items-center justify-center border-2 border-cb-black-pure">
                                <CheckCircle size={20} className="text-cb-yellow-neon" strokeWidth={3} />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            <div className="flex flex-col items-center md:items-start gap-6 border-t-4 border-cb-black-pure pt-8 mt-8">
                <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRules(true)}
                    className="flex items-center gap-3 px-6 py-4 bg-cb-black-pure border-4 border-cb-black-pure text-cb-yellow-neon hover:bg-cb-yellow-neon hover:text-cb-black-pure transition-all shadow-block-sm hover:shadow-none uppercase font-tech font-bold"
                >
                    <FileText size={24} strokeWidth={2.5} />
                    <span>
                        {config.currentValue ? `DESCARGAR DATOS: ${config.currentValue}` : `DESCARGAR DATOS: ${data.category}`}
                    </span>
                </motion.button>

                <label className="flex items-center gap-4 cursor-pointer group p-4 border-4 border-cb-black-pure bg-cb-gray-industrial hover:bg-cb-black-pure transition-colors w-full md:w-auto shadow-block-sm">
                    <div className="relative flex">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={rulesAccepted}
                            onChange={(e) => setRulesAccepted(e.target.checked)}
                        />
                        <div className={`w-8 h-8 flex items-center justify-center border-4 border-cb-black-pure transition-all shadow-block-sm group-hover:shadow-none
                            ${rulesAccepted ? "bg-cb-yellow-neon" : "bg-cb-white-tech group-hover:bg-cb-yellow-neon/20"}
                        `}>
                            {rulesAccepted && <Check strokeWidth={4} className="text-cb-black-pure" size={24} />}
                        </div>
                    </div>
                    <span className={`font-tech font-bold uppercase transition-colors ${rulesAccepted ? "text-cb-yellow-neon" : "text-neutral-400 group-hover:text-cb-white-tech"}`}>
                        CERTIFICO LECTURA DE CONTRATO (REGLAMENTO)
                    </span>
                </label>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4 justify-between pt-8 border-t-4 border-cb-black-pure mt-10">
                <button
                    onClick={handleBack}
                    className="w-full md:w-auto px-6 py-3 border-4 border-cb-black-pure bg-cb-white-tech text-cb-black-pure font-tech font-bold uppercase tracking-widest hover:bg-cb-black-pure hover:text-cb-white-tech transition-all shadow-block-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                    RETROCEDER
                </button>
                <button
                    onClick={handleNext}
                    disabled={!isNextEnabled}
                    className={`
                        w-full md:w-auto px-8 py-3 border-4 border-cb-black-pure font-tech text-xl font-bold uppercase tracking-widest transition-all
                        ${isNextEnabled
                            ? "bg-cb-yellow-neon text-cb-black-pure shadow-block-sm hover:-translate-y-1"
                            : "bg-cb-gray-industrial text-neutral-500 cursor-not-allowed"}
                    `}
                >
                    AVANZAR COMANDO
                </button>
            </div>
        </div>
    );
}
