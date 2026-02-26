import { Zap, Bot, Check } from "lucide-react";

interface Step0Props {
    data: {
        paymentReadyConfirmed?: boolean;
    };
    updateData: (data: any) => void;
    handleNext: () => void;
}

export default function Step0_PaymentInfo({ data, updateData, handleNext }: Step0Props) {
    return (
        <div className="space-y-8">
            <div className="text-center md:text-left mb-10 border-b-4 border-cb-black-pure pb-6">
                <h2 className="text-3xl font-tech font-black text-cb-black-pure mb-2 uppercase drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">
                    Requisito de Enlace
                </h2>
                <p className="font-tech text-cb-black-pure text-lg font-bold">
                    CONFIRMA TU ESTATUS FINANCIERO ANTES DE CONTINUAR
                </p>
            </div>

            <div className="bg-cb-black-pure border-8 border-cb-black-pure p-6 md:p-8 relative shadow-block-lg">
                <div className="absolute top-0 right-0 w-full h-4 bg-warning-tape -translate-y-[110%]" />
                
                <h2 className="text-3xl lg:text-4xl font-tech text-cb-yellow-neon mb-4 uppercase drop-shadow-[2px_2px_0_#FFF]">INFO DE PAGO</h2>
                <p className="text-cb-white-tech font-bold mb-8 font-sans">
                    Habilita tu participación transfiriendo a nuestras coordenadas. 
                    COSTO: <span className="text-cb-yellow-neon bg-cb-black-pure border-2 border-cb-yellow-neon px-2 py-1">$10.00</span> por equipo.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10 w-full">
                    <div className="space-y-6">
                        <div className="flex items-center gap-5 bg-cb-white-tech p-4 border-4 border-cb-black-pure shadow-block-sm transition-transform duration-75 hover:-translate-y-1">
                            <div className="bg-cb-black-pure p-3 shrink-0">
                                <Zap className="text-cb-yellow-neon" />
                            </div>
                            <div>
                                <p className="text-cb-black-pure text-[10px] md:text-xs font-black uppercase tracking-widest font-tech mb-0.5">Entidad Financiera</p>
                                <p className="text-cb-green-dark font-tech font-bold text-lg md:text-xl uppercase">Cooperativa Biblián</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-5 bg-cb-white-tech p-4 border-4 border-cb-black-pure shadow-block-sm transition-transform duration-75 hover:-translate-y-1">
                            <div className="bg-cb-black-pure p-3 shrink-0">
                                <Bot className="text-cb-yellow-neon" />
                            </div>
                            <div className="w-full text-cb-black-pure overflow-hidden">
                                <p className="text-cb-black-pure text-[10px] md:text-xs font-black uppercase tracking-widest font-tech mb-0.5">Número de Cuenta Ahorros</p>
                                <p className="font-tech tracking-widest text-lg lg:text-2xl mb-1 text-black font-black break-all">0212011159836</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm pt-2 border-t-2 border-cb-black-pure">
                                    <div>
                                        <p className="text-[10px] md:text-xs uppercase font-black font-sans text-neutral-500">Beneficiario:</p>
                                        <p className="font-bold text-xs truncate">Segundo Pauta</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs uppercase font-black font-sans text-neutral-500">ID:</p>
                                        <p className="font-bold text-xs truncate">0101995843</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-[300px] md:max-w-none">
                        <div className="absolute inset-0 bg-cb-white-tech translate-x-4 translate-y-4 border-4 border-cb-black-pure" />
                        <img
                            src="/src/assets/pago.png"
                            alt="Información de Pago"
                            className="relative z-10 border-4 border-cb-black-pure w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-300 bg-cb-black-pure"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t-4 border-cb-black-pure">
                <div className="bg-cb-white-tech border-4 border-cb-black-pure p-4 mb-10 shadow-block-sm relative -rotate-1 hover:rotate-0 transition-transform">
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-cb-black-pure z-10 border-2 border-cb-yellow-neon" />
                    <label className="flex items-center gap-4 cursor-pointer group p-2 relative z-20">
                        <div className="relative flex">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={data.paymentReadyConfirmed || false}
                                onChange={(e) => updateData({ paymentReadyConfirmed: e.target.checked })}
                            />
                             <div className={`w-10 h-10 border-4 flex items-center justify-center border-cb-black-pure transition-all shadow-block-sm group-hover:shadow-none
                                ${data.paymentReadyConfirmed ? "bg-cb-green-vibrant" : "bg-cb-white-tech group-hover:bg-cb-green-vibrant/20"}
                            `}>
                                {data.paymentReadyConfirmed && <Check strokeWidth={4} className="text-cb-black-pure" size={28} />}
                            </div>
                        </div>
                        <span className="text-sm md:text-base text-cb-black-pure text-left font-black uppercase leading-tight select-none">
                            CONFIRMO QUE HE REALIZADO EL PAGO Y TENGO EL COMPROBANTE LISTO PARA EL ENLACE DE REGISTRO.
                        </span>
                    </label>
                </div>

                <div className="flex flex-col-reverse md:flex-row gap-4 justify-end">
                    <button
                        onClick={handleNext}
                        disabled={!data.paymentReadyConfirmed}
                        className={`
                            w-full md:w-auto px-10 py-4 border-4 border-cb-black-pure font-tech text-xl font-bold uppercase tracking-widest transition-all
                            ${data.paymentReadyConfirmed
                                ? "bg-cb-green-vibrant text-cb-black-pure shadow-block-sm hover:-translate-y-1"
                                : "bg-cb-gray-industrial text-neutral-500 cursor-not-allowed"}
                        `}
                    >
                        INICIALIZAR REGISTRO <span className="ml-2 font-black">&gt;_</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
