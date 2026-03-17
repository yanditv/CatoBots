import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cb-black-pure flex flex-col items-center justify-center overflow-hidden relative font-tech select-none">

      {/* Warning tape top */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-warning-tape" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-warning-tape" />

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#10B961 1px, transparent 1px), linear-gradient(90deg, #10B961 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Vertical speed lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-cb-yellow-neon opacity-10"
            style={{ left: `${15 + i * 14}%` }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-0 px-6 text-center">

        {/* Top badge */}
        <div className="flex items-center gap-2 bg-red-600 border-2 border-black px-4 py-1.5 mb-6 shadow-[3px_3px_0_#000]">
          <AlertTriangle size={14} strokeWidth={3} className="text-white" />
          <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Error de Sistema</span>
        </div>

        {/* 404 giant number */}
        <div className="relative">
          {/* Shadow layer */}
          <p
            className="absolute text-cb-green-vibrant font-black uppercase select-none pointer-events-none"
            style={{
              fontSize: 'clamp(120px, 22vw, 220px)',
              lineHeight: 1,
              top: '8px',
              left: '8px',
              WebkitTextStroke: '0px',
              opacity: 0.25,
            }}
          >
            404
          </p>
          <p
            className="relative text-cb-yellow-neon font-black uppercase"
            style={{
              fontSize: 'clamp(120px, 22vw, 220px)',
              lineHeight: 1,
              WebkitTextStroke: '3px #000',
            }}
          >
            404
          </p>
        </div>

        {/* Divider tape */}
        <div
          className="w-full max-w-sm h-4 border-2 border-black my-4"
          style={{
            background:
              'repeating-linear-gradient(45deg, #FFF000 0px, #FFF000 10px, #000 10px, #000 20px)',
          }}
        />

        {/* Title */}
        <h1
          className="text-cb-white-tech font-black uppercase tracking-widest"
          style={{ fontSize: 'clamp(20px, 4vw, 36px)', WebkitTextStroke: '1px #000' }}
        >
          UNIDAD NO ENCONTRADA
        </h1>

        {/* Terminal block */}
        <div className="mt-6 bg-[#0a0a0a] border-2 border-neutral-700 w-full max-w-md text-left shadow-[6px_6px_0_#10B961]">
          <div className="flex items-center gap-2 bg-neutral-800 border-b-2 border-neutral-700 px-4 py-2">
            <Terminal size={12} className="text-cb-green-vibrant" strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">CATOBOT_OS v4.0</span>
          </div>
          <div className="p-4 space-y-1 font-mono text-xs">
            <p><span className="text-cb-green-vibrant">{'>'}</span> <span className="text-neutral-400">SCAN_ROUTE</span> <span className="text-red-400">[ FAILED ]</span></p>
            <p><span className="text-cb-green-vibrant">{'>'}</span> <span className="text-neutral-400">SECTOR</span> <span className="text-cb-yellow-neon">"{window.location.pathname}"</span></p>
            <p><span className="text-cb-green-vibrant">{'>'}</span> <span className="text-neutral-400">STATUS</span> <span className="text-red-400 animate-pulse">SECTOR INEXISTENTE</span></p>
            <p><span className="text-cb-green-vibrant">{'>'}</span> <span className="text-neutral-500">Redirige tu unidad al cuartel general.</span></p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/')}
          className="mt-8 flex items-center gap-3 bg-cb-yellow-neon text-cb-black-pure font-black uppercase tracking-widest text-sm px-8 py-4 border-3 border-black shadow-[5px_5px_0_#10B961] hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-none transition-all duration-75 cursor-pointer"
        >
          <ArrowLeft size={18} strokeWidth={3} />
          VOLVER AL CUARTEL
        </button>

      </div>
    </div>
  );
}
