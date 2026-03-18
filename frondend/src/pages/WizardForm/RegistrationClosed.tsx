import { Lock, ShieldAlert } from 'lucide-react';

export default function RegistrationClosed({ contactEmail }: { contactEmail?: string }) {
  return (
    <div className="min-h-screen bg-cb-black-pure flex flex-col items-center justify-center overflow-hidden relative font-tech select-none px-4">

      {/* Warning tape top & bottom — thin strips */}
      <div className="absolute top-0 left-0 right-0 h-3 z-20"
        style={{ background: 'repeating-linear-gradient(45deg, #FFF000 0px, #FFF000 12px, #000 12px, #000 24px)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-3 z-20"
        style={{ background: 'repeating-linear-gradient(45deg, #FFF000 0px, #FFF000 12px, #000 12px, #000 24px)' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,240,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,240,0,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

      {/* Radial dark overlay so center pops */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.9) 100%)' }} />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md text-center gap-5">

        {/* Lock icon with red shadow */}
        <div className="relative">
          <div className="absolute top-2 left-2 w-full h-full bg-red-700 border-2 border-black" />
          <div className="relative bg-[#111] border-2 border-red-500 p-5 flex items-center justify-center">
            <Lock size={48} strokeWidth={2} className="text-red-400" />
          </div>
        </div>

        {/* ACCESO DENEGADO label */}
        <p className="text-red-500 text-[11px] font-black uppercase tracking-[0.25em]">— ACCESO DENEGADO —</p>

        {/* INSCRIPCIONES — yellow slab, black text */}
        <div className="w-full">
          <div className="bg-cb-yellow-neon border-2 border-black shadow-[5px_5px_0_#000] py-3 px-4">
            <p className="text-black font-black uppercase tracking-wide leading-none"
              style={{ fontSize: 'clamp(26px, 6vw, 52px)' }}>
              INSCRIPCIONES
            </p>
          </div>
          {/* CERRADAS — dark slab, white text */}
          <div className="bg-[#111] border-2 border-t-0 border-neutral-600 shadow-[5px_5px_0_#10B961] py-3 px-4">
            <p className="text-white font-black uppercase tracking-wide leading-none"
              style={{ fontSize: 'clamp(26px, 6vw, 52px)' }}>
              CERRADAS
            </p>
          </div>
        </div>

        {/* Tape divider */}
        <div className="w-16 h-2 border border-black"
          style={{ background: 'repeating-linear-gradient(45deg, #FFF000 0px, #FFF000 6px, #000 6px, #000 12px)' }} />

        {/* Info box */}
        <div className="w-full bg-[#0f0f0f] border-2 border-neutral-700 shadow-[6px_6px_0_#000] text-left">
          <div className="flex items-center gap-2 bg-neutral-900 border-b-2 border-neutral-700 px-4 py-2.5">
            <ShieldAlert size={13} strokeWidth={2.5} className="text-red-400" />
            <span className="text-[10px] font-black uppercase text-neutral-200 tracking-widest">Aviso Oficial</span>
          </div>
          <div className="px-5 py-4 space-y-2">
            <p className="text-white text-sm font-black uppercase tracking-wide leading-snug">
              Las inscripciones para este evento están temporalmente deshabilitadas.
            </p>
            <p className="text-neutral-400 text-xs font-bold uppercase tracking-wide">
              Regresa más tarde o contacta a los organizadores.
            </p>
            {contactEmail && (
              <p className="text-cb-yellow-neon text-xs font-black uppercase tracking-widest pt-3 border-t border-neutral-700">
                {contactEmail}
              </p>
            )}
          </div>
        </div>

        <a href="/"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-cb-yellow-neon transition-colors duration-75 underline underline-offset-4">
          ← Volver al inicio
        </a>

      </div>
    </div>
  );
}
