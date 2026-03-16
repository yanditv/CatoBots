import { AlertTriangle, Terminal } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'warning' | 'info' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal = ({ isOpen, title, message, type = 'warning', onConfirm, onCancel }: ConfirmModalProps) => {
    if (!isOpen) return null;

    const isDanger = type === 'danger';

    const bgBadge = isDanger ? 'bg-red-600' : 'bg-cb-yellow-neon';
    const borderAccent = isDanger ? 'border-red-600' : 'border-cb-yellow-neon';
    const primaryButtonColor = isDanger ? 'bg-red-600 text-white' : 'bg-cb-green-vibrant text-cb-black-pure';

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in duration-150">
            <div className={`bg-cb-gray-industrial border-4 border-cb-black-pure w-full max-w-lg p-0 relative shadow-[8px_8px_0px_${isDanger ? '#DC2626' : '#CBFF00'}]`}>
                
                {/* Header Tape */}
                <div className={`h-8 w-full border-b-4 border-cb-black-pure ${bgBadge} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 relative">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    
                    <div className="flex items-start gap-4 md:gap-6 relative z-10 flex-col md:flex-row text-center md:text-left">
                        <div className={`bg-cb-black-pure p-4 border-2 ${borderAccent} shrink-0 mx-auto md:mx-0 shadow-[4px_4px_0px_#000]`}>
                            {isDanger ? (
                                <AlertTriangle className="w-10 h-10 text-red-600 animate-pulse" strokeWidth={2.5} />
                            ) : (
                                <Terminal className="w-10 h-10 text-cb-yellow-neon" strokeWidth={2.5} />
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-2xl font-tech font-black text-cb-white-tech italic uppercase drop-shadow-[2px_2px_0px_#000] mb-2">
                                {title}
                            </h3>
                            <p className="text-neutral-300 font-bold uppercase tracking-wide text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t-4 border-cb-black-pure flex flex-col md:flex-row justify-end gap-3 bg-cb-black-pure">
                    <button
                        onClick={onCancel}
                        className="w-full md:w-auto px-8 py-3 bg-neutral-300 border-4 border-cb-black-pure text-cb-black-pure font-tech font-black uppercase tracking-widest text-lg shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:scale-95 transition-all duration-150"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel(); // auto-close after confirm
                        }}
                        className={`w-full md:w-auto px-8 py-3 ${primaryButtonColor} border-4 border-cb-black-pure font-tech font-black uppercase tracking-widest text-lg shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:scale-95 transition-all duration-150`}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
