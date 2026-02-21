import { motion } from "framer-motion";
import { Gamepad2, FileText, CheckCircle } from "lucide-react";
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
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Categoría <span className="text-purple-400">{data.category}</span></h2>
                <p className="text-neutral-400">Selecciona la competencia en la que participarás</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {config.options.map((option) => (
                    <motion.button
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelection(option)}
                        className={`
                            p-4 rounded-xl text-left border transition-all flex items-center gap-4
                            ${config.currentValue === option
                                ? "border-purple-500 bg-purple-500/10 text-white shadow-lg shadow-purple-500/10"
                                : "border-neutral-800 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"}
                        `}
                    >
                        <div className={`p-2 rounded-lg transition-colors ${config.currentValue === option ? "bg-purple-500 text-white" : "bg-neutral-800 text-neutral-500"}`}>
                            <Gamepad2 size={20} />
                        </div>
                        <span className="font-medium">{option}</span>

                        {config.currentValue === option && (
                            <div className="ml-auto">
                                <CheckCircle size={16} className="text-purple-400" />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            <div className="flex flex-col items-center gap-4 border-t border-neutral-800 pt-6">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRules(true)}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-neutral-800 border border-neutral-700 text-purple-400 hover:bg-neutral-700 hover:text-purple-300 transition-colors shadow-lg"
                >
                    <FileText size={18} />
                    <span className="font-semibold">Ver Reglamento para {data.category}</span>
                </motion.button>

                <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-neutral-900/50 transition-colors select-none">
                    <div className="relative flex-shrink-0">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={rulesAccepted}
                            onChange={(e) => setRulesAccepted(e.target.checked)}
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all ${rulesAccepted
                                ? "bg-purple-600 border-purple-600"
                                : "bg-transparent border-neutral-600 group-hover:border-purple-400"
                            }`}>
                            {rulesAccepted && <CheckCircle size={12} className="text-white absolute top-0.5 left-0.5" />}
                        </div>
                    </div>
                    <span className={`text-sm transition-colors ${rulesAccepted ? "text-white" : "text-neutral-400 group-hover:text-neutral-300"}`}>
                        He leído el reglamento de mi categoría
                    </span>
                </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-800">
                <button
                    onClick={handleBack}
                    className="px-6 py-2 rounded-lg font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    Atrás
                </button>
                <button
                    onClick={handleNext}
                    disabled={!isNextEnabled}
                    className={`
                        px-8 py-2 rounded-lg font-bold text-sm tracking-wide transition-all
                        ${isNextEnabled
                            ? "bg-white text-neutral-900 hover:bg-neutral-200 shadow-xl shadow-white/10"
                            : "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50"}
                    `}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
