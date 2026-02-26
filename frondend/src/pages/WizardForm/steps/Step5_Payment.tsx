import { Upload, X } from "lucide-react";
import { useState } from "react";
import { api } from "../../../config/api";

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
                alert("CARGA RECHAZADA: ARCHIVO EXCEDE LÍMITE (10MB)");
                return;
            }

            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await api.upload('/api/registrations/upload', formData);
                const responseData = await res.json();
                if (responseData.filename) {
                    updateData({ paymentProof: responseData.filename });
                }
            } catch (error) {
                console.error("Upload failed", error);
                alert("ERROR CRÍTICO AL TRANSFERIR ARCHIVO");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center md:text-left mb-10 border-b-4 border-cb-black-pure pb-6">
                <h2 className="text-3xl font-tech font-black text-cb-black-pure mb-2 uppercase drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">VALIDACIÓN DE FONDOS</h2>
                <p className="font-tech text-cb-black-pure text-lg font-bold mt-4 uppercase">
                    CUOTA DE INSCRIPCIÓN: $10.00 POR FACCIÓN.<br/>
                    AUTORIZA EL PAGO Y CARGA LA EVIDENCIA (RECIBO).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Payment Info Card (Warning Block) */}
                <div className="bg-cb-yellow-warning border-8 border-cb-black-pure shadow-block-lg relative overflow-hidden flex flex-col">
                    <div className="bg-warning-tape h-4 w-full absolute top-0 left-0"></div>
                    <div className="bg-cb-black-pure mt-4 p-4 text-center border-b-4 border-cb-black-pure z-10">
                        <span className="text-cb-yellow-neon font-tech font-black text-lg md:text-xl uppercase tracking-widest">COORDENADAS FINANCIERAS</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col items-center justify-center bg-cb-white-tech border-x-4 border-b-4 border-cb-black-pure m-2">
                        <img
                            src="/src/assets/pago.png"
                            alt="Datos Bancarios"
                            className="max-w-full h-auto object-contain drop-shadow-[4px_4px_0_#000]"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        {/* Fallback Text if image is missing */}
                        <div className="text-cb-black-pure font-tech font-bold text-sm md:text-base space-y-2 uppercase hidden only:block">
                            <p className="flex justify-between border-b-2 border-cb-black-pure pb-1"><span className="text-neutral-500">INSTITUCIÓN:</span> <span className="text-right">Cooperativa Biblián</span></p>
                            <p className="flex justify-between border-b-2 border-cb-black-pure pb-1"><span className="text-neutral-500">TIPO:</span> <span className="text-right">Ahorros</span></p>
                            <p className="flex justify-between border-b-2 border-cb-black-pure pb-1"><span className="text-neutral-500">ID CUENTA:</span> <span className="text-right text-cb-green-vibrant drop-shadow-[1px_1px_0_#000] text-lg">0212011159836</span></p>
                            <p className="flex justify-between border-b-2 border-cb-black-pure pb-1"><span className="text-neutral-500">DESTINATARIO:</span> <span className="text-right">CatoBots (Segundo Pauta)</span></p>
                            <p className="flex justify-between"><span className="text-neutral-500">CREDENCIAL:</span> <span className="text-right">0101995843</span></p>
                        </div>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="space-y-4 flex flex-col justify-center">
                    <label className="block text-sm font-tech font-black uppercase tracking-widest text-cb-black-pure mb-2">
                        TRASMISIÓN DE COMPROBANTE (IMG/PDF)
                    </label>

                    {!data.paymentProof ? (
                        <div className="relative border-4 border-cb-black-pure bg-cb-gray-industrial p-10 text-center hover:bg-cb-black-pure transition-colors group shadow-block-sm h-64 flex flex-col justify-center items-center">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                disabled={isUploading}
                            />
                            <div className="flex flex-col items-center gap-4 relative z-10">
                                {isUploading ? (
                                    <div className="font-tech text-cb-yellow-neon font-black text-2xl uppercase animate-pulse">
                                        TRANSMITIENDO...
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-cb-white-tech p-4 border-4 border-cb-black-pure shadow-[4px_4px_0_#000] group-hover:bg-cb-yellow-neon group-hover:translate-y-[-5px] transition-all">
                                            <Upload className="text-cb-black-pure" size={32} strokeWidth={3} />
                                        </div>
                                        <p className="font-tech font-bold uppercase text-cb-white-tech group-hover:text-cb-yellow-neon text-lg">
                                            ARRASTRAR ARCHIVO AQUÍ <br/> <span className="text-sm text-neutral-400 group-hover:text-cb-white-tech">O PRESIONAR PARA EXPLORAR</span>
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-cb-green-vibrant border-4 border-cb-black-pure shadow-[8px_8px_0_#000] p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4 w-[85%]">
                                <div className="bg-cb-black-pure p-3 border-4 border-cb-black-pure shadow-[2px_2px_0_#FFF]">
                                    <Upload size={24} className="text-cb-yellow-neon" />
                                </div>
                                <div className="w-full">
                                    <p className="text-cb-black-pure font-tech font-black text-lg uppercase tracking-widest">TRANSMISIÓN EXITOSA</p>
                                    <p className="text-cb-black-pure/70 font-tech font-bold text-sm truncate uppercase bg-cb-white-tech px-2 py-1 mt-1 border-2 border-cb-black-pure inline-block w-full">{data.paymentProof}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateData({ paymentProof: null })}
                                className="bg-cb-black-pure p-2 border-4 border-cb-black-pure text-cb-white-tech hover:text-cb-yellow-neon hover:bg-cb-gray-industrial transition-colors"
                                title="ELIMINAR ARCHIVO"
                            >
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>
                    )}
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
                    disabled={!data.paymentProof}
                    className={`
                        w-full md:w-auto px-8 py-3 border-4 border-cb-black-pure font-tech text-xl font-bold uppercase tracking-widest transition-all
                        ${data.paymentProof
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
