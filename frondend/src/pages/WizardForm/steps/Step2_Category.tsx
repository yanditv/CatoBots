import { motion } from "framer-motion";
import { Baby, Bot, GraduationCap, Check } from "lucide-react";

interface Step2Props {
    data: {
        category: string;
    };
    updateData: (data: any) => void;
    handleNext: () => void;
    handleBack: () => void;
    showBackButton?: boolean;
}

export default function Step2_Category({ data, updateData, handleNext, handleBack, showBackButton = true }: Step2Props) {
    const categories = [
        {
            id: "Junior",
            title: "JUNIOR",
            description: "OPERADORES EN FORMACIÓN (Básico)",
            icon: Baby,
        },
        {
            id: "Senior",
            title: "SENIOR",
            description: "COMBATIENTES INTERMEDIOS (Bachillerato)",
            icon: Bot,
        },
        {
            id: "Master",
            title: "MASTER",
            description: "INGENIERÍA PESADA (Universidades/Clubes)",
            icon: GraduationCap,
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center md:text-left mb-10 border-b-4 border-cb-black-pure pb-6">
                <h2 className="text-3xl font-tech font-black text-cb-black-pure mb-2 uppercase drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">Clasificación de Nivel</h2>
                <p className="font-tech text-cb-black-pure text-lg font-bold">SELECCIONA EL GRADO DE AMENAZA DE TU EQUIPO</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateData({ category: cat.id })}
                        className={`
                            relative overflow-hidden p-6 text-left border-4 transition-all duration-200 group rounded-none
                            ${data.category === cat.id
                                ? "border-cb-black-pure bg-cb-yellow-neon shadow-[8px_8px_0px_#000]"
                                : "border-cb-black-pure bg-cb-gray-industrial hover:bg-cb-black-pure hover:border-cb-yellow-neon shadow-block-sm"}
                        `}
                    >
                        <div className={`w-14 h-14 border-4 flex items-center justify-center mb-6 shadow-block-sm transition-colors
                             ${data.category === cat.id 
                                ? "bg-cb-black-pure border-cb-black-pure text-cb-yellow-neon" 
                                : "bg-cb-white-tech border-cb-black-pure text-cb-black-pure group-hover:bg-cb-yellow-neon group-hover:text-cb-black-pure"}
                        `}>
                            <cat.icon size={28} strokeWidth={2.5} />
                        </div>

                        <h3 className={`text-2xl font-tech font-black mb-2 transition-colors uppercase
                            ${data.category === cat.id ? "text-cb-black-pure" : "text-cb-white-tech group-hover:text-cb-yellow-neon"}
                        `}>
                            {cat.title}
                        </h3>
                        <p className={`text-sm font-tech font-bold leading-tight transition-colors uppercase tracking-wide
                            ${data.category === cat.id ? "text-cb-black-pure/80" : "text-neutral-400 group-hover:text-cb-white-tech"}
                        `}>
                            {cat.description}
                        </p>

                        {/* Selection Indicator Square */}
                        <div className={`absolute top-6 right-6 w-6 h-6 border-4 flex items-center justify-center transition-all 
                            ${data.category === cat.id
                                ? "border-cb-black-pure bg-cb-black-pure shadow-[2px_2px_0_#FFF]"
                                : "border-cb-black-pure bg-transparent"}
                            `}>
                            {data.category === cat.id && <Check strokeWidth={4} className="text-cb-yellow-neon" size={16} />}
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4 justify-between pt-8 border-t-4 border-cb-black-pure mt-10">
                {showBackButton ? (
                    <button
                        onClick={handleBack}
                        className="w-full md:w-auto px-6 py-3 border-4 border-cb-black-pure bg-cb-white-tech text-cb-black-pure font-tech font-bold uppercase tracking-widest hover:bg-cb-black-pure hover:text-cb-white-tech transition-all shadow-block-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    >
                        RETROCEDER
                    </button>
                ) : <div className="hidden md:block" />}
                <button
                    onClick={handleNext}
                    disabled={!data.category}
                    className={`
                        w-full md:w-auto px-8 py-3 border-4 border-cb-black-pure font-tech text-xl font-bold uppercase tracking-widest transition-all
                        ${data.category
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
