import { AlertTriangle, Phone, Mail, MessageCircle, ExternalLink } from "lucide-react";

interface StepGeneralInfoProps {
    handleNext: () => void;
    handleBack: () => void;
    eventConfig: Record<string, string>;
}

const formatWhatsApp = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '593' + cleaned.substring(1);
    else if (cleaned.length === 9) cleaned = '593' + cleaned;
    return cleaned;
};

export default function StepGeneralInfo({ handleNext, handleBack, eventConfig }: StepGeneralInfoProps) {
    const instructions = eventConfig.generalInstructions || '';
    const phone = eventConfig.contactPhone || '';
    const email = eventConfig.contactEmail || '';
    const rulesUrl = eventConfig.rulesGeneralUrl || '';

    return (
        <div className="space-y-8">
            <div className="text-center md:text-left mb-6 border-b-4 border-cb-black-pure pb-6">
                <h2 className="text-3xl font-tech font-black text-cb-black-pure mb-2 uppercase drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">
                    Indicaciones Generales
                </h2>
                <p className="font-tech text-cb-black-pure text-lg font-bold">
                    LEE ATENTAMENTE ANTES DE CONTINUAR
                </p>
            </div>

            {/* Instructions Box */}
            <div className="bg-cb-white-tech border-4 border-cb-black-pure p-6 md:p-8 shadow-block-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-cb-yellow-neon p-2 border-3 border-cb-black-pure">
                        <AlertTriangle className="text-cb-black-pure" size={24} />
                    </div>
                    <h3 className="font-tech font-black text-cb-black-pure text-lg uppercase">Información Importante</h3>
                </div>
                <div className="text-cb-black-pure font-sans text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {instructions}
                </div>
            </div>

            {/* Rules Link */}
            {rulesUrl && (
                <a href={rulesUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 bg-cb-black-pure text-cb-yellow-neon p-4 border-4 border-cb-black-pure shadow-block-sm hover:-translate-y-1 transition-all duration-75">
                    <ExternalLink size={20} />
                    <span className="font-tech font-bold uppercase tracking-wider text-sm">Ver Reglamento General Completo</span>
                </a>
            )}

            {/* Contact Info */}
            {(phone || email) && (
                <div className="bg-neutral-900 border-4 border-cb-black-pure p-5 shadow-block-sm">
                    <p className="text-cb-yellow-neon font-tech font-black text-xs uppercase tracking-widest mb-3">Contacto</p>
                    <div className="flex flex-wrap gap-3">
                        {phone && (
                            <>
                                <a href={`tel:${phone}`} className="flex items-center gap-2 bg-cb-white-tech text-cb-black-pure px-4 py-2 border-3 border-cb-black-pure font-tech font-bold text-xs uppercase hover:bg-cb-yellow-neon transition-colors">
                                    <Phone size={14} /> {phone}
                                </a>
                                <a href={`https://wa.me/${formatWhatsApp(phone)}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 border-3 border-cb-black-pure font-tech font-bold text-xs uppercase hover:brightness-110 transition-all">
                                    <MessageCircle size={14} /> WhatsApp
                                </a>
                            </>
                        )}
                        {email && (
                            <a href={`mailto:${email}`} className="flex items-center gap-2 bg-cb-white-tech text-cb-black-pure px-4 py-2 border-3 border-cb-black-pure font-tech font-bold text-xs uppercase hover:bg-cb-yellow-neon transition-colors">
                                <Mail size={14} /> {email}
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col-reverse md:flex-row gap-4 justify-between pt-8 border-t-4 border-cb-black-pure mt-10">
                <button onClick={handleBack}
                    className="w-full md:w-auto px-6 py-3 border-4 border-cb-black-pure bg-cb-white-tech text-cb-black-pure font-tech font-bold uppercase tracking-widest hover:bg-cb-black-pure hover:text-cb-white-tech transition-all shadow-block-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    RETROCEDER
                </button>
                <button onClick={handleNext}
                    className="w-full md:w-auto px-8 py-3 border-4 border-cb-black-pure bg-cb-yellow-neon text-cb-black-pure font-tech text-xl font-bold uppercase tracking-widest shadow-block-sm hover:-translate-y-1 transition-all">
                    AVANZAR COMANDO
                </button>
            </div>
        </div>
    );
}
