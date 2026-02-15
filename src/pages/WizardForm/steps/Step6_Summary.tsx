import { AlertTriangle, CheckCircle, Smartphone } from "lucide-react";
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
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Confirmar Registro</h2>
                <p className="text-neutral-400">Revisa que toda la información esté correcta antes de enviar.</p>
            </div>

            <div className="bg-neutral-800/30 rounded-xl p-6 border border-neutral-700 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-neutral-500">Institución</p>
                        <p className="text-white font-medium">{data.institution}</p>
                    </div>
                    <div>
                        <p className="text-neutral-500">Correo</p>
                        <p className="text-white font-medium">{data.email}</p>
                    </div>
                    <div>
                        <p className="text-neutral-500">Categoría</p>
                        <p className="text-purple-400 font-bold">{data.category} - {subCategory}</p>
                    </div>
                </div>

                <div className="border-t border-neutral-700 pt-4">
                    <p className="text-neutral-500 mb-2">Detalles del Equipo</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-neutral-500 text-xs uppercase">{isRobotica ? "Robot" : "Equipo"}</p>
                            <p className="text-white font-medium">{isRobotica ? data.robotName : data.teamName}</p>
                        </div>
                        <div>
                            <p className="text-neutral-500 text-xs uppercase">Integrantes</p>
                            <p className="text-white font-medium">{data.members}</p>
                        </div>
                        <div>
                            <p className="text-neutral-500 text-xs uppercase">Asesor</p>
                            <p className="text-white font-medium">{data.advisorName}</p>
                        </div>
                        <div>
                            <p className="text-neutral-500 text-xs uppercase">Contacto</p>
                            <p className="text-white font-medium">{data.advisorPhone}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-700 pt-4">
                    <p className="text-neutral-500 mb-2">Comprobante</p>
                    <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={16} />
                        <span className="font-medium">{data.paymentProof}</span>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4 flex gap-4 items-start">
                <div className="mt-1">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={data.termsAccepted}
                        onChange={(e) => updateData({ termsAccepted: e.target.checked })}
                        className="w-5 h-5 rounded border-neutral-600 text-purple-600 focus:ring-purple-500 bg-neutral-800"
                    />
                </div>
                <label htmlFor="terms" className="text-sm text-neutral-300 cursor-pointer select-none">
                    <span className="font-bold text-white">Términos y Condiciones:</span> He leído y acepto las bases que rigen este concurso en su convocatoria general. Entiendo que la inscripción no es reembolsable.
                </label>
            </div>

            <div className="flex justify-between pt-6 border-t border-neutral-800">
                <button
                    onClick={handleBack}
                    className="px-6 py-2 rounded-lg font-medium text-neutral-400 hover:text-white transition-colors"
                    disabled={isSubmitting}
                >
                    Atrás
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!data.termsAccepted || isSubmitting}
                    className={`
                        px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg
                        ${data.termsAccepted && !isSubmitting
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-600/20 hover:scale-105"
                            : "bg-neutral-800 text-neutral-500 cursor-not-allowed"}
                    `}
                >
                    {isSubmitting ? "ENVIANDO..." : "FINALIZAR INSCRIPCIÓN"}
                </button>
            </div>
        </div>
    );
}
