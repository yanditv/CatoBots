import { Bot, Phone, User, Users } from "lucide-react";
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

        // Strategy 1: Acronym for multiple words (e.g., "Super Killer Robot" -> "SKR")
        if (words.length > 1) {
            let abbr = words.map(w => w[0]).join("");
            // If acronym is too short (mask < 3), append meaningful chars from the last word
            if (abbr.length < 3) {
                const lastWord = words[words.length - 1];
                // Try to add consonants from last word, excluding the first char (already in abbr)
                const consonants = lastWord.slice(1).replace(/[AEIOU]/g, '');
                abbr += consonants.substring(0, 4 - abbr.length);
            }
            return abbr.substring(0, 5);
        }

        // Strategy 2: Single Word Smart Contraction (e.g., "Killbe" -> "KLBE" or "KIBE")
        const word = words[0];
        // Always take first and last
        const first = word[0];
        const last = word[word.length - 1];

        // Middle distinct characters (prioritize consonants, then vowels)
        // Remove duplicates for "variety"
        const middle = word.slice(1, -1);

        // Filter middle: 1. Consonants, 2. Unique
        const distinctConsonants = Array.from(new Set(middle.replace(/[AEIOU]/g, '').split(''))).join('');

        // Construct: First + 2 Consonants + Last?
        if (distinctConsonants.length >= 2) {
            return (first + distinctConsonants.substring(0, 2) + last).substring(0, 4);
        }

        // If not enough consonants, just take distinctive chars in order
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
            newErrors.advisorPhone = "Teléfono inválido (09XXXXXXXX)";
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
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Detalles del Equipo</h2>
                <p className="text-neutral-400">Cuéntanos sobre los participantes</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Robot Name or Team Name */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                            <Bot size={16} className="text-purple-400" />
                            {isRobotica ? "Nombre del Robot" : "Nombre del Equipo"}
                        </label>
                        <input
                            type="text"
                            value={isRobotica ? data.robotName : data.teamName}
                            onChange={(e) => updateData(isRobotica ? { robotName: e.target.value } : { teamName: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            placeholder={isRobotica ? "Ej. Terminator" : "Ej. Los Innovadores"}
                        />
                    </div>

                    {isRobotica && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                                    <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-xs font-bold border border-purple-500/20">ABR</span>
                                    Abreviatura (Scoreboard)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isEditingAbbreviation}
                                        onChange={(e) => setIsEditingAbbreviation(e.target.checked)}
                                        className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-purple-500 focus:ring-purple-500/50 accent-purple-500"
                                    />
                                    <span className="text-xs text-neutral-400 hover:text-white transition-colors">Editar manualmente</span>
                                </label>
                            </div>

                            <input
                                type="text"
                                maxLength={5}
                                value={data.robotAbbreviation || ''}
                                disabled={!isEditingAbbreviation}
                                onChange={(e) => updateData({ robotAbbreviation: e.target.value.toUpperCase() })}
                                className={`w-full bg-neutral-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all font-mono tracking-wider uppercase
                                    ${!isEditingAbbreviation ? 'opacity-50 cursor-not-allowed border-neutral-800' : 'border-neutral-700 focus:ring-purple-500/50'}
                                `}
                                placeholder="Ej. TERM"
                            />
                            {!isEditingAbbreviation && data.robotAbbreviation && (
                                <p className="text-xs text-neutral-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Sugerencia automática basada en el nombre
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Members Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                            <Users size={16} className="text-purple-400" />
                            Integrantes
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={hasSecondMember}
                                    onChange={(e) => setHasSecondMember(e.target.checked)}
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${hasSecondMember ? "bg-purple-600" : "bg-neutral-700"
                                    }`}></div>
                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${hasSecondMember ? "translate-x-4" : "translate-x-0"
                                    }`}></div>
                            </div>
                            <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">
                                2 Integrantes
                            </span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Member 1 */}
                        <div className="space-y-2">
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={member1}
                                    onChange={(e) => setMember1(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    placeholder="Nombre del Capitán"
                                />
                                <p className="text-xs text-neutral-500 mt-1 ml-1">Capitán / Integrante 1</p>
                            </div>
                        </div>

                        {/* Member 2 - Conditional */}
                        {hasSecondMember && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-2"
                            >
                                <div className="input-group">
                                    <input
                                        type="text"
                                        value={member2}
                                        onChange={(e) => setMember2(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        placeholder="Nombre del Segundo Integrante"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1 ml-1">Integrante 2</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Advisor Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Advisor Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                            <User size={16} className="text-purple-400" />
                            Nombre del Asesor
                        </label>
                        <input
                            type="text"
                            value={data.advisorName}
                            onChange={(e) => updateData({ advisorName: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            placeholder="Nombre del docente o asesor"
                        />
                    </div>

                    {/* Advisor Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                            <Phone size={16} className="text-purple-400" />
                            Teléfono del Asesor
                        </label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={data.advisorPhone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                updateData({ advisorPhone: val });
                            }}
                            className={`w-full bg-neutral-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all ${errors.advisorPhone ? "border-red-500 focus:ring-red-500/50" : "border-neutral-700 focus:ring-purple-500/50"}`}
                            placeholder="099..."
                        />
                        {errors.advisorPhone && <p className="text-xs text-red-500 ml-1">{errors.advisorPhone}</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-neutral-800 mt-8">
                <button
                    onClick={handleBack}
                    className="px-6 py-2 rounded-lg font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    Atrás
                </button>
                <button
                    onClick={handleNext}
                    disabled={!isFormValid}
                    className={`
                        px-8 py-2 rounded-lg font-bold text-sm tracking-wide transition-all
                        ${isFormValid
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
