import { Building, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Step1Props {
    data: {
        email: string;
        institution: string;
        category: string;
    };
    updateData: (data: any) => void;
    googleUser: any;
    handleGoogleLogin: () => void;
    handleNext: () => void;
    handleBack?: () => void;
}

export default function Step1_EventDetails({ data, updateData, googleUser, handleGoogleLogin, handleNext, handleBack }: Step1Props) {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    const isValid = data.email && isEmailValid && data.institution && data.institution.trim().length > 3;

    return (
        <div className="space-y-6">
            <div className="text-center md:text-left mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Información del Evento</h2>
                <div className="flex flex-col gap-2 text-neutral-400 text-sm">
                    <p className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="font-semibold text-purple-400">FECHA:</span> 20 DE MARZO DEL 2026
                    </p>
                    <p className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="font-semibold text-purple-400">LUGAR:</span> COLISEO DE LAS AGUILAS ROJAS
                    </p>
                    <a
                        href="https://maps.app.goo.gl/dwUEErcrpNe4CiN59"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 justify-center md:justify-start"
                    >
                        <MapPin size={14} /> Ver ubicación
                    </a>
                </div>
            </div>

            <div className="space-y-4">
                {/* Email Section */}
                <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/50">
                    <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                        <Mail size={16} className="text-purple-400" /> Correo Electrónico
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => updateData({ email: e.target.value })}
                            placeholder="tu@email.com"
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        />
                        <button
                            onClick={handleGoogleLogin}
                            className="bg-white text-neutral-900 px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                            {googleUser ? "Cambiar" : "Usar Google"}
                        </button>
                    </div>
                </div>

                {/* Institution Section */}
                <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/50">
                    <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                        <Building size={16} className="text-purple-400" /> Institución Educativa
                    </label>
                    <input
                        type="text"
                        value={data.institution}
                        onChange={(e) => updateData({ institution: e.target.value })}
                        placeholder="Nombre de la Unidad Educativa"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-neutral-800 mt-8">
                {handleBack ? (
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 rounded-lg font-medium text-neutral-400 hover:text-white transition-colors"
                    >
                        Atrás
                    </button>
                ) : <div />}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={!isValid}
                    className={`
                        px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all
                        ${isValid
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/20"
                            : "bg-neutral-800 text-neutral-500 cursor-not-allowed"}
                    `}
                >
                    SIGUIENTE
                </motion.button>
            </div>
        </div>
    );
}
