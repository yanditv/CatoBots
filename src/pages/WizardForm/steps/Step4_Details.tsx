import { Bot, Phone, User, Users, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Step4Props {
    data: {
        robotName: string;
        members: string;
        advisorName: string;
        advisorPhone: string;
        teamName: string; // Used for some categories
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

    useEffect(() => {
        if (data.members) {
            const parts = data.members.split(",").map(s => s.trim());
            setMember1(parts[0] || "");
            if (parts.length > 1 && parts[1]) {
                setMember2(parts[1]);
                setHasSecondMember(true);
            }
        }
    }, []); // Only run on mount to initialize

    // Update parent data when local state changes
    useEffect(() => {
        const membersString = hasSecondMember
            ? `${member1}${member2 ? `, ${member2}` : ""}`
            : member1;

        // Only update if it's different to avoid loops/redraws if needed, 
        // but here we just call updateData.
        // We defer this slightly or just call it. 
        // Better: updateData({ members: membersString }) on blur or specific events?
        // For wizard, acceptable to update on running change or effect.
        if (data.members !== membersString) {
            updateData({ members: membersString });
        }
    }, [member1, member2, hasSecondMember]);


    const isValid =
        (isRobotica ? data.robotName : data.teamName) &&
        member1 && // At least one member
        (!hasSecondMember || member2) && // If 2nd member selected, must be filled
        data.advisorName &&
        data.advisorPhone;

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Detalles del Equipo</h2>
                <p className="text-neutral-400">Cuéntanos sobre los participantes</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Robot Name or Team Name */}
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

                        {/* Member 2 - Conditional */}
                        {hasSecondMember && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="input-group"
                            >
                                <input
                                    type="text"
                                    value={member2}
                                    onChange={(e) => setMember2(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    placeholder="Nombre del Segundo Integrante"
                                />
                                <p className="text-xs text-neutral-500 mt-1 ml-1">Integrante 2</p>
                            </motion.div>
                        )}
                    </div>
                </div>

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
                            value={data.advisorPhone}
                            onChange={(e) => updateData({ advisorPhone: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            placeholder="099..."
                        />
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
                    disabled={!isValid}
                    className={`
                        px-8 py-2 rounded-lg font-bold text-sm tracking-wide transition-all
                        ${isValid
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
