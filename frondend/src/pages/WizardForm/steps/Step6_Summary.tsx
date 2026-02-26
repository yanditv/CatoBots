import { CheckCircle, AlertTriangle, Check } from "lucide-react";
import { useState } from "react";

interface Step6Props {
    data: {
        email: string;
        institution: string;
        category: string;
        juniorCategory: string;
        seniorCategory: string;
        masterCategory: string;
        robotName: string;
        teamName: string;
        members: string;
        advisorName: string;
        advisorPhone: string;
        paymentProof: string | null;
        termsAccepted: boolean;
    };
    categoryType: "ROBOTICA" | "SCRATCH" | "BIOBOT";
    updateData: (data: any) => void;
    handleBack: () => void;
    handleSubmit: () => void;
}

export default function Step6_Summary({ data, categoryType, updateData, handleBack, handleSubmit }: Step6Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subCategory = data.category === "Junior" ? data.juniorCategory
        : data.category === "Senior" ? data.seniorCategory
            : data.masterCategory;

    const isRobotica = categoryType === "ROBOTICA";

    const onSubmit = async () => {
        if (!data.termsAccepted) return;
        setIsSubmitting(true);
        await handleSubmit();
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-8">
            <div className="text-center md:text-left mb-10 border-b-4 border-cb-black-pure pb-6">
                <h2 className="text-3xl font-tech font-black text-cb-black-pure mb-2 uppercase drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">REVISIÓN DE EXPEDIENTE</h2>
                <p className="font-tech text-cb-black-pure text-lg font-bold mt-4 uppercase">
                    CONFIRMAR DATOS PREVIO A LA TRANSMISIÓN FINAL.
                </p>
            </div>

            <div className="bg-cb-gray-industrial border-4 border-cb-black-pure p-8 space-y-6 shadow-block-sm relative">
                {/* Title Badge overlay */}
                <div className="absolute -top-4 md:-top-5 left-2 md:left-4 bg-cb-black-pure px-3 md:px-4 py-1.5 md:py-2 border-4 border-cb-black-pure shadow-[4px_4px_0_#FFF] flex items-center gap-2 md:gap-3">
                    <CheckCircle className="text-cb-yellow-neon w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                    <h3 className="text-sm md:text-xl font-tech font-black text-cb-white-tech tracking-widest uppercase">DATOS RECOPILADOS</h3>
                </div>

                <div className="pt-8 md:pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm font-tech font-bold text-neutral-500 uppercase">BASE DE OPERACIONES (INSTITUCIÓN)</p>
                            <p className="text-lg font-tech font-black text-cb-black-pure uppercase drop-shadow-[1px_1px_0_#FFF]">{data.institution}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-tech font-bold text-neutral-500 uppercase">CANAL PRINCIPAL (CORREO)</p>
                            <p className="text-lg font-tech font-black text-cb-black-pure uppercase drop-shadow-[1px_1px_0_#FFF]">{data.email}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2 bg-cb-black-pure p-4 border-l-8 border-cb-yellow-neon">
                            <p className="text-sm font-tech font-bold text-neutral-400 uppercase">DIVISIÓN ASIGNADA (CATEGORÍA)</p>
                            <p className="text-xl font-tech font-black text-cb-yellow-neon uppercase tracking-widest">{data.category} - {subCategory}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t-4 border-cb-black-pure pt-6">
                    <p className="text-lg font-tech font-black text-cb-black-pure mb-4 uppercase inline-block bg-cb-yellow-neon px-2 border-2 border-cb-black-pure">PERFIL TÁCTICO</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm font-tech font-bold text-neutral-500 uppercase">{isRobotica ? "UNIDAD MECANIZADA (ROBOT)" : "DESIGNACIÓN ESCUADRÓN"}</p>
                            <p className="text-lg font-tech font-black text-cb-black-pure uppercase bg-cb-white-tech border-2 border-cb-black-pure px-2 py-1 inline-block">{isRobotica ? data.robotName : data.teamName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-tech font-bold text-neutral-500 uppercase">PERSONAL ASIGNADO</p>
                            <p className="text-lg font-tech font-black text-cb-black-pure uppercase bg-cb-white-tech border-2 border-cb-black-pure px-2 py-1 inline-block">{data.members}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-tech font-bold text-neutral-500 uppercase">OFICIAL AL MANDO (ASESOR)</p>
                            <p className="text-lg font-tech font-black text-cb-black-pure uppercase bg-cb-white-tech border-2 border-cb-black-pure px-2 py-1 inline-block">{data.advisorName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-tech font-bold text-neutral-500 uppercase">FRECUENCIA COMUNICACIÓN</p>
                            <p className="text-lg font-tech font-black text-cb-black-pure uppercase bg-cb-white-tech border-2 border-cb-black-pure px-2 py-1 inline-block">{data.advisorPhone}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t-4 border-cb-black-pure pt-6">
                    <p className="text-lg font-tech font-black text-cb-black-pure mb-4 uppercase inline-block bg-cb-green-vibrant px-2 border-2 border-cb-black-pure text-cb-white-tech">ESTADO FINANCIERO</p>
                    <div className="flex items-center gap-3 bg-cb-black-pure p-4 border-4 border-cb-black-pure shadow-[4px_4px_0_#FFF]">
                        <CheckCircle size={24} className="text-cb-green-vibrant" strokeWidth={3} />
                        <span className="font-tech font-black text-cb-white-tech uppercase tracking-widest text-lg">{data.paymentProof}</span>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <div className="bg-cb-yellow-warning border-4 border-cb-black-pure p-6 flex gap-4 items-start shadow-block-sm relative overflow-hidden">
                <div className="bg-warning-tape h-2 w-full absolute top-0 left-0"></div>
                    <label className="relative flex cursor-pointer group">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={data.termsAccepted}
                            onChange={(e) => updateData({ termsAccepted: e.target.checked })}
                            className="peer sr-only"
                        />
                        <div className={`w-8 h-8 flex items-center justify-center border-4 border-cb-black-pure transition-all shadow-block-sm group-hover:shadow-none
                            ${data.termsAccepted ? "bg-cb-yellow-neon" : "bg-cb-white-tech group-hover:bg-cb-yellow-neon/20"}
                        `}>
                            {data.termsAccepted && <Check strokeWidth={4} className="text-cb-black-pure" size={24} />}
                        </div>
                    </label>
                <label htmlFor="terms" className="text-sm md:text-base text-cb-black-pure cursor-pointer select-none relative z-10 font-tech font-bold uppercase leading-relaxed pt-2">
                    <span className="font-black text-xl block mb-2 flex items-center gap-2">
                        <AlertTriangle size={20} strokeWidth={3} />
                        DIRECTIVA DE OPERACIÓN:
                    </span> 
                    CONFIRMO HABER PROCESADO Y ACEPTADO EL REGLAMENTO OFICIAL DE COMBATE. 
                    <span className="block mt-1 text-red-600 font-black">ADVERTENCIA: TRANSFERENCIA DE FONDOS NO REVERSIBLE.</span>
                </label>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-4 justify-between pt-8 border-t-4 border-cb-black-pure mt-10">
                <button
                    onClick={handleBack}
                    className="w-full md:w-auto px-6 py-3 border-4 border-cb-black-pure bg-cb-white-tech text-cb-black-pure font-tech font-bold uppercase tracking-widest hover:bg-cb-black-pure hover:text-cb-white-tech transition-all shadow-block-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    disabled={isSubmitting}
                >
                    RETROCEDER
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!data.termsAccepted || isSubmitting}
                    className={`
                        w-full md:w-auto px-8 py-3 border-4 border-cb-black-pure font-tech text-xl font-black uppercase tracking-widest transition-all
                        ${data.termsAccepted && !isSubmitting
                            ? "bg-cb-green-vibrant text-cb-white-tech shadow-[8px_8px_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[6px_6px_0_#000]"
                            : "bg-cb-gray-industrial text-neutral-500 cursor-not-allowed"}
                    `}
                >
                    {isSubmitting ? "TRANSMITIENDO..." : "INICIAR SECUENCIA"}
                </button>
            </div>
        </div>
    );
}
