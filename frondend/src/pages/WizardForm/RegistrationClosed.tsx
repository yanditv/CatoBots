import { Lock, ShieldAlert, Radio } from 'lucide-react';

export default function RegistrationClosed({ contactEmail }: { contactEmail?: string }) {
  return (
    <div className="min-h-screen bg-cb-black-pure flex flex-col items-center justify-center overflow-hidden relative font-tech select-none">

      {/* Warning tape top & bottom */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-warning-tape" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-warning-tape" />

      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#FFF000 1px, transparent 1px), linear-gradient(90deg, #FFF000 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Diagonal speed bars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-cb-yellow-neon opacity-[0.03]"
            style={{
              width: '120%',
              height: '40px',
              top: `${20 + i * 22}%`,
              left: '-10%',
              transform: 'rotate(-8deg)',
            }}
          />
        ))}
      </div>

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center gap-0 px-6 w-full max-w-lg text-center">

        {/* Top status bar */}
        <div
          className="w-full flex items-center justify-between px-4 py-2 border-2 border-black mb-6"
          style={{
            background:
              'repeating-linear-gradient(45deg, #FFF000 0px, #FFF000 10px, #000 10px, #000 20px)',
          }}
        >
          <div className="flex items-center gap-2">
            <Radio size={12} strokeWidth={3} className="text-black animate-pulse" />
            <span className="text-black text-[10px] font-black uppercase tracking-[0.2em]">Sistema de Inscripciones</span>
          </div>
          <span className="text-black text-[10px] font-black uppercase tracking-[0.2em]">CATOBOT IV</span>
        </div>

        {/* Lock icon block */}
        <div className="relative mb-2">
          {/* Shadow */}
          <div className="absolute top-2 left-2 w-full h-full bg-red-600 border-2 border-black" />
          <div className="relative bg-[#111] border-2 border-red-500 p-6 flex items-center justify-center">
            <Lock size={52} strokeWidth={2.5} className="text-red-400" />
          </div>
        </div>

        {/* Main heading */}
        <div className="mt-6 space-y-1">
          <p className="text-red-500 text-xs font-black uppercase tracking-[0.3em]">— ACCESO DENEGADO —</p>
          <h1
            className="text-cb-yellow-neon font-black uppercase"
            style={{
              fontSize: 'clamp(28px, 6vw, 52px)',
              lineHeight: 1.05,
              WebkitTextStroke: '2px #000',
            }}
          >
            INSCRIPCIONES
          </h1>
          <h1
            className="text-cb-white-tech font-black uppercase"
            style={{
              fontSize: 'clamp(28px, 6vw, 52px)',
              lineHeight: 1.05,
              WebkitTextStroke: '1px #333',
            }}
          >
            CERRADAS
          </h1>
        </div>

        {/* Divider */}
        <div
          className="w-24 h-2 border border-black my-5"
          style={{
            background:
              'repeating-linear-gradient(45deg, #FFF000 0px, #FFF000 6px, #000 6px, #000 12px)',
          }}
        />

        {/* Info box */}
        <div className="w-full bg-[#0f0f0f] border-2 border-neutral-700 shadow-[6px_6px_0_#000]">
          <div className="flex items-center gap-2 bg-neutral-900 border-b-2 border-neutral-700 px-4 py-2">
            <ShieldAlert size={13} strokeWidth={2.5} className="text-red-400" />
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Aviso Oficial</span>
          </div>
          <div className="px-6 py-5 space-y-2">
            <p className="text-neutral-300 text-sm font-bold uppercase tracking-wide leading-relaxed">
              Las inscripciones para este evento están temporalmente deshabilitadas.
            </p>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wide">
              Regresa más tarde o contacta a los organizadores.
            </p>
            {contactEmail && (
              <p className="text-cb-yellow-neon text-xs font-black uppercase tracking-widest pt-2 border-t border-neutral-800">
                {contactEmail}
              </p>
            )}
          </div>
        </div>

        {/* Back link */}
        <a
          href="/"
          className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-cb-yellow-neon transition-colors duration-75 underline underline-offset-4"
        >
          ← Volver al inicio
        </a>

      </div>
    </div>
  );
}
