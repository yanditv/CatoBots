import { Upload, X } from "lucide-react";
import { useState } from "react";

interface Step5Props {
    data: {
        paymentProof: string | null;
    };
    updateData: (data: any) => void;
    handleNext: () => void;
    handleBack: () => void;
}

export default function Step5_Payment({ data, updateData, handleNext, handleBack }: Step5Props) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert("El archivo es demasiado grande (máximo 10MB)");
                return;
            }

            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/registrations/upload', {
                    method: 'POST',
                    body: formData
                });
                const responseData = await res.json();
                if (responseData.filename) {
                    updateData({ paymentProof: responseData.filename });
                }
            } catch (error) {
                console.error("Upload failed", error);
                alert("Error al subir archivo");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Información de Pago</h2>
                <p className="text-neutral-400 max-w-lg mx-auto">
                    El costo de inscripción es de $10.00 por Institución. Por favor realiza el depósito y sube el comprobante.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Payment Info Card */}
                <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-purple-600 p-3 text-center">
                        <span className="text-white font-bold text-sm">DATOS BANCARIOS</span>
                    </div>
                    <div className="p-4 flex justify-center bg-white">
                        <img
                            src="/src/assets/pago.png"
                            alt="Datos Bancarios"
                            className="max-w-full h-auto object-contain"
                            onError={(e) => {
                                // Fallback if image fails
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        {/* Fallback Text if image is missing from assets yet, ensuring user sees something */}
                        <div className="text-neutral-900 text-sm space-y-2 hidden only:block">
                            <p><strong>Banco:</strong> Cooperativa Biblián</p>
                            <p><strong>Cuenta:</strong> Ahorros</p>
                            <p><strong>Número:</strong> 0212011159836</p>
                            <p><strong>Nombre:</strong> CatoBots (Segundo Pauta)</p>
                            <p><strong>CI:</strong> 0101995843</p>
                        </div>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Subir Comprobante (PDF o Imagen)
                    </label>

                    {!data.paymentProof ? (
                        <div className="relative border-2 border-dashed border-neutral-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors bg-neutral-900/50 group">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                            <div className="flex flex-col items-center gap-3">
                                {isUploading ? (
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                                ) : (
                                    <>
                                        <div className="bg-neutral-800 p-3 rounded-full group-hover:bg-purple-500/20 transition-colors">
                                            <Upload className="text-purple-400 group-hover:text-purple-300" size={24} />
                                        </div>
                                        <p className="text-neutral-400 text-sm group-hover:text-neutral-300">
                                            Arrastra tu archivo aquí o <span className="text-purple-400 underline">haz clic para buscar</span>
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500/20 p-2 rounded-full">
                                    <Upload size={16} className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-green-400 font-medium text-sm">Archivo subido correctamente</p>
                                    <p className="text-green-500/60 text-xs truncate max-w-[200px]">{data.paymentProof}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateData({ paymentProof: null })}
                                className="text-neutral-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>
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
                    disabled={!data.paymentProof}
                    className={`
                        px-8 py-2 rounded-lg font-bold text-sm tracking-wide transition-all
                        ${data.paymentProof
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
