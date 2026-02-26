import { Bot, Phone, User, Users, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { validatePhone } from "../../../utils/validation";

interface Step4Props {
    data: {
        robotName: string;
        robotAbbreviation?: string;
        members: string;
        advisorName: string;
        advisorPhone: string;
        teamName: string;
    };
    categoryType: "ROBOTICA" | "SCRATCH" | "BIOBOT";
    updateData: (data: any) => void;
    handleNext: () => void;
    handleBack: () => void;
}

export default function Step4_Details({ data, categoryType, updateData, handleNext, handleBack }: Step4Props) {
    const isRobotica = categoryType === "ROBOTICA";

    // Split members string into local state
    const [member1, setMember1] = useState("");
    const [member2, setMember2] = useState("");
    const [hasSecondMember, setHasSecondMember] = useState(false);
    const [isEditingAbbreviation, setIsEditingAbbreviation] = useState(false);

    // Validation state
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (data.members) {
            const parts = data.members.split(",").map(s => s.trim());
            setMember1(parts[0] || "");
            if (parts.length > 1 && parts[1]) {
                setMember2(parts[1]);
                setHasSecondMember(true);
            }
        }
    }, []);

    // Auto-generate abbreviation logic
    const generateSmartAbbreviation = (name: string): string => {
        const clean = name.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');
        if (!clean) return "";
        if (clean.length <= 4) return clean;

        const words = clean.split(" ").filter(w => w.length > 0);

        if (words.length > 1) {
            let abbr = words.map(w => w[0]).join("");
            if (abbr.length < 3) {
                const lastWord = words[words.length - 1];
                const consonants = lastWord.slice(1).replace(/[AEIOU]/g, '');
                abbr += consonants.substring(0, 4 - abbr.length);
            }
            return abbr.substring(0, 5);
        }

        const word = words[0];
        const first = word[0];
        const last = word[word.length - 1];
        const middle = word.slice(1, -1);
        const distinctConsonants = Array.from(new Set(middle.replace(/[AEIOU]/g, '').split(''))).join('');

        if (distinctConsonants.length >= 2) {
            return (first + distinctConsonants.substring(0, 2) + last).substring(0, 4);
        }

        const distinctChars = Array.from(new Set(middle.split(''))).join('');
        return (first + distinctChars.substring(0, 2) + last).substring(0, 4);
    };

    useEffect(() => {
        if (!isEditingAbbreviation && isRobotica && data.robotName) {
            const abbr = generateSmartAbbreviation(data.robotName);
            if (data.robotAbbreviation !== abbr) {
                updateData({ robotAbbreviation: abbr });
            }
        }
    }, [data.robotName, isEditingAbbreviation, isRobotica]);


    useEffect(() => {
        const membersString = hasSecondMember
            ? `${member1}${member2 ? `, ${member2}` : ""}`
            : member1;

        if (data.members !== membersString) {
            updateData({ members: membersString });
        }
    }, [member1, member2, hasSecondMember]);

    // Validation Logic
    const validateFields = () => {
        const newErrors: { [key: string]: string } = {};

        if (data.advisorPhone && !validatePhone(data.advisorPhone)) {
            newErrors.advisorPhone = "ENLACE INVÁLIDO (USE FORMATO: 09XXXXXXXX)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check validity for button
    const isFormComplete =
        (isRobotica ? (data.robotName && data.robotAbbreviation) : data.teamName) &&
        member1 &&
        (!hasSecondMember || member2) &&
        data.advisorName &&
        data.advisorPhone;

    const isFormValid = isFormComplete && Object.keys(errors).length === 0;

    // Validate on change
    useEffect(() => {
        validateFields();
    }, [data.advisorPhone]);

    return (
        <div className="space-y-8">
            <div className="text-center md:text-left mb-10 border-b-4 border-cb-black-pure pb-6">
                <h2 className="text-3xl font-tech font-black text-cb-black-pure mb-2 uppercase drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">ESPECIFICACIONES DE LA UNIDAD</h2>
                <p className="font-tech text-cb-black-pure text-lg font-bold mt-4">INGRESAR PERFIL TÁCTICO DEL EQUIPO Y ROBOT</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Robot Section */}
                {isRobotica && (
                    <div className="bg-cb-gray-industrial border-4 border-cb-black-pure p-8 space-y-6 relative overflow-visible shadow-block-sm">
                        
                        {/* Title Badge overlay */}
                        <div className="absolute -top-4 md:-top-5 left-2 md:left-4 bg-cb-black-pure px-3 md:px-4 py-1.5 md:py-2 border-4 border-cb-black-pure shadow-[4px_4px_0_#FFF] flex items-center gap-2 md:gap-3">
                            <Bot className="text-cb-yellow-neon w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                            <h3 className="text-sm md:text-xl font-tech font-black text-cb-white-tech tracking-widest uppercase truncate max-w-[200px] sm:max-w-none">REGISTRO MÁQUINA</h3>
                        </div>

                        <div className="space-y-6 pt-8 md:pt-4">
                            <div className="space-y-2 group">
                                <label className="block text-sm font-tech font-black uppercase tracking-widest text-cb-white-tech mb-2">
                                    IDENTIFICADOR (NOMBRE DEL ROBOT)
                                </label>
                                <input
                                    type="text"
                                    value={data.robotName}
                                    onChange={(e) => updateData({ robotName: e.target.value })}
                                    className="w-full bg-cb-white-tech border-4 border-cb-black-pure rounded-none px-4 py-3 text-cb-black-pure font-tech text-lg focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon uppercase placeholder:text-neutral-400 transition-all shadow-[4px_4px_0_#000] focus:shadow-none translate-y-0 focus:translate-y-1 block"
                                    placeholder="EJ. TERMINATOR DESTRUCTOR"
                                />
                            </div>

                            <div className="space-y-2 group">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 gap-3 lg:gap-0">
                                    <label className="text-xs md:text-sm font-tech font-black uppercase tracking-widest text-cb-white-tech flex items-center gap-2">
                                        <span className="bg-cb-black-pure text-cb-yellow-neon px-2 py-0.5 border-2 border-cb-yellow-neon">ABR</span>
                                        CLAVE DE SCOREBOARD
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer select-none self-start lg:self-auto group">
                                        <div className="relative flex">
                                            <input
                                                type="checkbox"
                                                checked={isEditingAbbreviation}
                                                onChange={(e) => setIsEditingAbbreviation(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className={`w-6 h-6 flex items-center justify-center border-4 border-cb-black-pure transition-all
                                                ${isEditingAbbreviation ? "bg-cb-yellow-neon shadow-[2px_2px_0_#FFF]" : "bg-cb-white-tech group-hover:bg-cb-yellow-neon/20 shadow-block-sm"}
                                            `}>
                                                {isEditingAbbreviation && <Check strokeWidth={4} className="text-cb-black-pure" size={16} />}
                                            </div>
                                        </div>
                                        <span className="text-xs md:text-sm font-tech font-bold uppercase text-cb-white-tech group-hover:text-cb-yellow-neon transition-colors mt-0.5">MODIFICACIÓN MANUAL</span>
                                    </label>
                                </div>

                                <input
                                    type="text"
                                    maxLength={5}
                                    value={data.robotAbbreviation || ''}
                                    disabled={!isEditingAbbreviation}
                                    onChange={(e) => updateData({ robotAbbreviation: e.target.value.toUpperCase() })}
                                    className={`w-full border-4 rounded-none px-4 py-3 font-tech text-2xl font-black uppercase tracking-[0.3em] text-center transition-all ${
                                        !isEditingAbbreviation 
                                            ? 'bg-neutral-300 border-neutral-500 text-neutral-600 cursor-not-allowed' 
                                            : 'bg-cb-yellow-neon border-cb-black-pure text-cb-black-pure shadow-[4px_4px_0_#000] focus:shadow-none hover:shadow-none translate-y-0 focus:translate-y-1 focus:ring-4 focus:ring-cb-black-pure'
                                    }`}
                                    placeholder="TRMN"
                                />
                                {!isEditingAbbreviation && data.robotAbbreviation && (
                                    <p className="text-xs font-tech font-bold uppercase text-cb-white-tech flex items-center gap-2 mt-2">
                                        <span className="w-2 h-2 bg-cb-green-vibrant border border-cb-black-pure animate-pulse shadow-[1px_1px_0_#000]"></span>
                                        CÁLCULO AUTOMÁTICO DE SCOREBOARD ACTIVO
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Section */}
                <div className="bg-cb-gray-industrial border-4 border-cb-black-pure p-8 pt-10 space-y-8 relative overflow-visible shadow-block-sm mt-8">
                    {/* Title Badge overlay */}
                    <div className="absolute -top-4 md:-top-5 left-2 md:left-4 bg-cb-white-tech px-3 md:px-4 py-1.5 md:py-2 border-4 border-cb-black-pure shadow-[4px_4px_0_#000] flex items-center gap-2 md:gap-3 z-10">
                        <Users className="text-cb-black-pure w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                        <h3 className="text-sm md:text-xl font-tech font-black text-cb-black-pure tracking-widest uppercase truncate max-w-[220px] sm:max-w-none">REGISTRO ESCUADRÓN</h3>
                    </div>

                    <div className="pt-8 md:pt-4 space-y-8">
                    {/* Team Name */}
                    {!isRobotica && (
                        <div className="space-y-2 group">
                            <label className="block text-sm font-tech font-black uppercase tracking-widest text-cb-white-tech mb-2">
                                DESIGNACIÓN DEL ESCUADRÓN
                            </label>
                            <input
                                type="text"
                                value={data.teamName}
                                onChange={(e) => updateData({ teamName: e.target.value })}
                                className="w-full bg-cb-white-tech border-4 border-cb-black-pure rounded-none px-4 py-3 text-cb-black-pure font-tech text-lg focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon uppercase placeholder:text-neutral-400 transition-all shadow-[4px_4px_0_#000] focus:shadow-none translate-y-0 focus:translate-y-1 block"
                                placeholder="EJ. COMANDOS CIBERNÉTICOS"
                            />
                        </div>
                    )}

                    {/* Members Section */}
                    <div className="space-y-6 bg-cb-black-pure p-6 shadow-block-sm">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b-4 border-cb-white-tech/20 pb-4">
                            <label className="text-sm font-tech font-black uppercase tracking-widest text-cb-yellow-neon flex items-center gap-3">
                                <Users size={20} className="text-cb-white-tech" />
                                PERSONAL ASIGNADO
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group bg-cb-gray-industrial px-4 py-2 border-4 border-cb-black-pure hover:bg-cb-yellow-neon hover:text-cb-black-pure transition-colors">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={hasSecondMember}
                                        onChange={(e) => setHasSecondMember(e.target.checked)}
                                    />
                                    <div className={`w-12 h-6 border-4 border-cb-black-pure transition-colors ${hasSecondMember ? "bg-cb-green-vibrant" : "bg-neutral-400"}`}></div>
                                    <div className={`absolute top-1 left-1 bg-cb-black-pure w-4 h-4 transition-transform ${hasSecondMember ? "translate-x-6 bg-cb-yellow-warning" : "translate-x-0"}`}></div>
                                </div>
                                <span className="text-sm font-tech font-bold uppercase transition-colors text-cb-white-tech group-hover:text-cb-black-pure">
                                    ACTIVAR 2DO INTEGRANTE
                                </span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Member 1 */}
                            <div className="space-y-2">
                                <label className="block text-xs font-tech font-bold uppercase text-cb-white-tech/70">COMANDANTE EN JEFE (INTEGRANTE 1)</label>
                                <input
                                    type="text"
                                    value={member1}
                                    onChange={(e) => setMember1(e.target.value)}
                                    className="w-full bg-cb-white-tech border-4 border-cb-white-tech rounded-none px-4 py-3 text-cb-black-pure font-tech text-lg focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon uppercase placeholder:text-neutral-500 transition-all"
                                    placeholder="NOMBRE COMPLETO"
                                />
                            </div>

                            {/* Member 2 - Conditional */}
                            {hasSecondMember && (
                                <motion.div
                                    initial={{ opacity: 0, scaleY: 0.8 }}
                                    animate={{ opacity: 1, scaleY: 1 }}
                                    className="space-y-2 origin-top"
                                >
                                     <label className="block text-xs font-tech font-bold uppercase text-cb-white-tech/70">OPERADOR DE APOYO (INTEGRANTE 2)</label>
                                    <input
                                        type="text"
                                        value={member2}
                                        onChange={(e) => setMember2(e.target.value)}
                                        className="w-full bg-cb-white-tech border-4 border-cb-white-tech rounded-none px-4 py-3 text-cb-black-pure font-tech text-lg focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon uppercase placeholder:text-neutral-500 transition-all"
                                        placeholder="NOMBRE COMPLETO"
                                    />
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Advisor Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t-4 border-cb-black-pure">
                        {/* Advisor Name */}
                        <div className="space-y-2 group">
                            <label className="text-sm font-tech font-black uppercase tracking-widest text-cb-white-tech mb-2 flex items-center gap-2">
                                <User size={20} className="text-cb-white-tech" />
                                MENTOR / DOCENTE RESPONSABLE
                            </label>
                            <input
                                type="text"
                                value={data.advisorName}
                                onChange={(e) => updateData({ advisorName: e.target.value })}
                                className="w-full bg-cb-white-tech border-4 border-cb-black-pure rounded-none px-4 py-3 text-cb-black-pure font-tech text-lg focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon uppercase placeholder:text-neutral-400 transition-all shadow-[4px_4px_0_#000] focus:shadow-none translate-y-0 focus:translate-y-1 block"
                                placeholder="NOMBRE DEL DOCENTE"
                            />
                        </div>

                        {/* Advisor Phone */}
                        <div className="space-y-2 group">
                            <label className="text-sm font-tech font-black uppercase tracking-widest text-cb-white-tech mb-2 flex items-center gap-2">
                                <Phone size={20} className="text-cb-white-tech" />
                                CANAL DE COMUNICACIÓN (WHATSAPP)
                            </label>
                            <input
                                type="tel"
                                maxLength={10}
                                value={data.advisorPhone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    updateData({ advisorPhone: val });
                                }}
                                className={`w-full bg-cb-white-tech border-4 rounded-none px-4 py-3 text-cb-black-pure font-tech text-lg focus:outline-none focus:ring-4 transition-all shadow-[4px_4px_0_#000] focus:shadow-none translate-y-0 focus:translate-y-1 block ${errors.advisorPhone ? "border-red-600 focus:ring-red-600 focus:bg-red-50" : "border-cb-black-pure focus:ring-cb-yellow-neon"}`}
                                placeholder="09XXXXXXXX"
                            />
                            {errors.advisorPhone && <p className="text-xs font-tech font-bold text-red-600 bg-red-100 border-2 border-red-600 px-2 py-1 uppercase mt-2 w-fit">{errors.advisorPhone}</p>}
                        </div>
                    </div>
                    </div>
                </div>
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
                    disabled={!isFormValid}
                    className={`
                        w-full md:w-auto px-8 py-3 border-4 border-cb-black-pure font-tech text-xl font-bold uppercase tracking-widest transition-all
                        ${isFormValid
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
