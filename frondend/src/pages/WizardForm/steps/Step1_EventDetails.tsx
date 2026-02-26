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
        <div className="space-y-8">
            <div className="text-center md:text-left mb-10 border-b-4 border-cb-black-pure pb-6">
                <h2 className="text-3xl font-tech font-black text-cb-black-pure mb-4 uppercase drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">Información del Evento</h2>
                <div className="flex flex-col gap-3 font-tech text-cb-black-pure text-lg">
                    <p className="flex items-center gap-3 justify-center md:justify-start">
                        <span className="font-extrabold bg-cb-black-pure text-cb-yellow-neon px-2 py-1 uppercase text-sm shadow-block-sm">TIEMPO:</span> 20 DE MARZO DEL 2026
                    </p>
                    <p className="flex items-center gap-3 justify-center md:justify-start">
                        <span className="font-extrabold bg-cb-black-pure text-cb-yellow-neon px-2 py-1 uppercase text-sm shadow-block-sm">TERRENO:</span> COMPLEJO DEPORTIVO BANCO CENTRAL
                    </p>
                    <a
                        href="https://maps.app.goo.gl/FjRKZn9o9d1hV2nA7"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cb-black-pure hover:bg-cb-yellow-neon px-2 py-1 transition-colors flex items-center gap-2 justify-center md:justify-start w-fit mx-auto md:mx-0 font-bold underline decoration-4 underline-offset-4"
                    >
                        <MapPin size={20} /> VISUALIZAR MAPA TÁCTICO
                    </a>
                </div>
            </div>

            <div className="space-y-6">
                {/* Email Section */}
                <div className="bg-cb-gray-industrial p-6 border-4 border-cb-black-pure shadow-block-sm relative group">
                    <label className="block text-sm font-tech font-black uppercase tracking-widest text-cb-white-tech mb-4 flex items-center gap-3">
                        <Mail size={20} className="text-cb-yellow-neon" /> OPERADOR ENLACE (EMAIL)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => updateData({ email: e.target.value })}
                            placeholder="OPERADOR@SISTEMA.COM"
                            className="flex-1 bg-cb-black-pure border-4 border-cb-black-pure rounded-none px-4 py-3 text-cb-yellow-neon font-tech text-lg focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon focus:border-cb-black-pure placeholder:text-neutral-600 transition-all uppercase"
                        />
                        <button
                            onClick={handleGoogleLogin}
                            className="bg-cb-white-tech text-cb-black-pure px-6 py-3 border-4 border-cb-black-pure font-tech font-bold uppercase tracking-widest hover:bg-cb-yellow-neon hover:-translate-y-1 transition-all shadow-block-sm flex items-center justify-center gap-3"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 grayscale" />
                            {googleUser ? "REASIGNAR" : "VÍNCULO GOOGLE"}
                        </button>
                    </div>
                </div>

                {/* Institution Section */}
                <div className="bg-cb-gray-industrial p-6 border-4 border-cb-black-pure shadow-block-sm relative group">
                    <label className="block text-sm font-tech font-black uppercase tracking-widest text-cb-white-tech mb-4 flex items-center gap-3">
                        <Building size={20} className="text-cb-yellow-neon" /> FACCIÓN / INSTITUCIÓN
                    </label>
                    <input
                        type="text"
                        value={data.institution}
                        onChange={(e) => updateData({ institution: e.target.value })}
                        placeholder="INGRESE EL NOMBRE DE LA ORGANIZACIÓN"
                        className="w-full bg-cb-black-pure border-4 border-cb-black-pure rounded-none px-4 py-3 text-cb-yellow-neon font-tech text-lg focus:outline-none focus:ring-4 focus:ring-cb-yellow-neon focus:border-cb-black-pure placeholder:text-neutral-600 transition-all uppercase"
                    />
                </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4 justify-between pt-8 border-t-4 border-cb-black-pure mt-10">
                {handleBack ? (
                    <button
                        onClick={handleBack}
                        className="w-full md:w-auto px-6 py-3 border-4 border-cb-black-pure bg-cb-white-tech text-cb-black-pure font-tech font-bold uppercase tracking-widest hover:bg-cb-black-pure hover:text-cb-white-tech transition-all shadow-block-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    >
                        RETROCEDER
                    </button>
                ) : <div className="hidden md:block" />}

                <motion.button
                    whileTap={isValid ? { scale: 0.95 } : {}}
                    onClick={handleNext}
                    disabled={!isValid}
                    className={`
                        w-full md:w-auto px-8 py-3 border-4 border-cb-black-pure font-tech text-xl font-bold uppercase tracking-widest transition-all
                        ${isValid
                            ? "bg-cb-yellow-neon text-cb-black-pure shadow-block-sm hover:-translate-y-1"
                            : "bg-cb-gray-industrial text-neutral-500 cursor-not-allowed"}
                    `}
                >
                    AVANZAR COMANDO
                </motion.button>
            </div>
        </div>
    );
}
