import { AlertTriangle, CheckCircle, Terminal } from "lucide-react";

interface AlertModalProps {
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
    onClose: () => void;
}

export default function AlertModal({ title, message, type, onClose }: AlertModalProps) {
    const isError = type === 'error';
    const isSuccess = type === 'success';

    const bgBadge = isError ? 'bg-red-600' : isSuccess ? 'bg-[#10B961]' : 'bg-[#FFF000]';
    const borderAccent = isError ? 'border-red-600' : isSuccess ? 'border-[#10B961]' : 'border-[#FFF000]';

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-150">
            <div className={`bg-[#111111] border-4 border-black w-full max-w-lg p-0 relative shadow-[8px_8px_0px_${isError ? '#DC2626' : isSuccess ? '#10B961' : '#FFF000'}]`}>
                
                {/* Header Tape */}
                <div className={`h-8 w-full border-b-4 border-black ${bgBadge} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>
                </div>

                {/* Content */}
                <div className="p-8 relative">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                    
                    <div className="flex items-start gap-6 relative z-10">
                        <div className={`bg-black p-4 border-2 ${borderAccent} shrink-0`}>
                            {isError && <AlertTriangle className="w-10 h-10 text-red-600" strokeWidth={2.5} />}
                            {isSuccess && <CheckCircle className="w-10 h-10 text-[#10B961]" strokeWidth={2.5} />}
                            {!isError && !isSuccess && <Terminal className="w-10 h-10 text-[#FFF000]" strokeWidth={2.5} />}
                        </div>
                        
                        <div>
                            <h3 className="text-2xl font-black text-white italic uppercase drop-shadow-[2px_2px_0px_#000] mb-2 font-['Montserrat',sans-serif]">
                                {title}
                            </h3>
                            <p className="text-neutral-300 font-bold uppercase tracking-wider text-sm leading-relaxed font-['Montserrat',sans-serif]">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t-4 border-black flex justify-end bg-black">
                    <button
                        onClick={onClose}
                        className={`px-8 py-3 bg-white border-4 border-black text-black font-black uppercase tracking-widest text-lg shadow-[4px_4px_0px_${isError ? '#DC2626' : isSuccess ? '#10B961' : '#FFF000'}] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-75`}
                    >
                        ENTENDIDO
                    </button>
                </div>
            </div>
        </div>
    );
}
