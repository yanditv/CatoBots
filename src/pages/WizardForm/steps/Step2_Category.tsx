import { motion } from "framer-motion";
import { Baby, Bot, GraduationCap } from "lucide-react";

interface Step2Props {
    data: {
        category: string;
    };
    updateData: (data: any) => void;
    handleNext: () => void;
    handleBack: () => void;
}

export default function Step2_Category({ data, updateData, handleNext, handleBack }: Step2Props) {
    const categories = [
        {
            id: "Junior",
            title: "Junior",
            description: "Nivel escolar/básico",
            icon: Baby,
            color: "from-blue-500 to-cyan-400"
        },
        {
            id: "Senior",
            title: "Senior",
            description: "Nivel bachillerato/intermedio",
            icon: Bot,
            color: "from-purple-500 to-pink-400"
        },
        {
            id: "Master",
            title: "Master",
            description: "Universidades y Clubes Independientes",
            icon: GraduationCap,
            color: "from-amber-500 to-orange-400"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Selecciona tu Categoría</h2>
                <p className="text-neutral-400">Elige el nivel de competencia adecuado para tu equipo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            updateData({ category: cat.id });
                            // Auto advance after selection for smoother flow? 
                            // Or keep it manual? Let's do manual for now but maybe later auto.
                            // Actually, let's keep it selected and user clicks next, OR we can auto-advance.
                            // For step 2, clicking IS selecting, so maybe better to auto-advance or just highlight.
                        }}
                        className={`
                            relative overflow-hidden rounded-2xl p-6 text-left border transition-all duration-300 group
                            ${data.category === cat.id
                                ? "border-purple-500 bg-neutral-800 shadow-xl shadow-purple-500/10"
                                : "border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 hover:border-neutral-700"}
                        `}
                    >
                        <div className={`absolute top-0 right-0 p-24 opacity-10 bg-gradient-to-br ${cat.color} blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none transition-opacity duration-500 ${data.category === cat.id ? 'opacity-20' : ''}`} />

                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 text-white shadow-lg`}>
                            <cat.icon size={24} />
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                            {cat.title}
                        </h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            {cat.description}
                        </p>

                        {/* Selection Indicator */}
                        <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 transition-all ${data.category === cat.id
                                ? "border-purple-500 bg-purple-500"
                                : "border-neutral-700"
                            }`} />
                    </motion.button>
                ))}
            </div>

            <div className="flex justify-between pt-6 border-t border-neutral-800">
                <button
                    onClick={handleBack}
                    className="px-6 py-2 rounded-lg font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    Atrás
                </button>
                <button
                    onClick={handleNext}
                    disabled={!data.category}
                    className={`
                        px-8 py-2 rounded-lg font-bold text-sm tracking-wide transition-all
                        ${data.category
                            ? "bg-white text-neutral-900 hover:bg-neutral-200"
                            : "bg-neutral-800 text-neutral-500 cursor-not-allowed"}
                    `}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
