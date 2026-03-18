import { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Bot, Layers, ChevronDown, ChevronRight } from 'lucide-react';

interface Robot {
  id: string;
  name: string;
  level: string;
  category: string;
  isHomologated: boolean;
  institutionId: string;
  Institution?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  levels?: string[];
  isActive: boolean;
}

interface LevelStat {
  level: string;
  robots: Robot[];
  homologated: Robot[];
  pending: Robot[];
}

interface CatStat {
  cat: Category;
  robots: Robot[];
  homologated: Robot[];
  pending: Robot[];
  levelStats: LevelStat[];
}

interface ModalTarget {
  catName: string;
  level: string | null;
  robots: Robot[];
  homologated: Robot[];
  pending: Robot[];
}

interface Props {
  categories: Category[];
  robots: Robot[];
  maxRobotsPerCategory: number;
}

const match = (a: string, b: string) => a?.toLowerCase().trim() === b?.toLowerCase().trim();

// ── Stacked mini-bar ───────────────────────────────────────────────────────────
const StackedBar = ({ ok, pending, max }: { ok: number; pending: number; max: number }) => (
  <div className="relative flex-1 h-4 bg-neutral-900 border border-neutral-700 overflow-hidden flex min-w-[60px]">
    <div className="h-full transition-all duration-500" style={{ width: max > 0 ? `${(ok / max) * 100}%` : '0%', background: '#10B961', minWidth: ok > 0 ? '2px' : '0' }} />
    <div className="h-full transition-all duration-500" style={{ width: max > 0 ? `${(pending / max) * 100}%` : '0%', background: '#f87171', minWidth: pending > 0 ? '2px' : '0' }} />
  </div>
);

// ── Detail modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ target, onClose }: { target: ModalTarget; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-[#111] w-full max-w-2xl border-2 border-cb-yellow-neon shadow-[8px_8px_0_#000] overflow-hidden">
      <div className="h-2 bg-warning-tape" />
      <div className="p-5 border-b-2 border-neutral-800 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-tech font-black uppercase text-cb-yellow-neon tracking-wider">{target.catName}</h2>
          {target.level && (
            <span className="inline-block mt-1 text-[9px] font-tech font-black text-cb-yellow-neon/70 border border-cb-yellow-neon/30 px-2 py-0.5 uppercase">{target.level}</span>
          )}
        </div>
        <button onClick={onClose} className="w-9 h-9 border-2 border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:border-red-500 transition-all duration-75 cursor-pointer">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-3 divide-x-2 divide-neutral-800 border-b-2 border-neutral-800">
        {[
          { label: 'Total', value: target.robots.length, color: 'text-cb-white-tech' },
          { label: 'Homologados', value: target.homologated.length, color: 'text-cb-green-vibrant' },
          { label: 'Pendientes', value: target.pending.length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 text-center">
            <p className={`text-3xl font-tech font-black ${color}`}>{value}</p>
            <p className="text-[9px] font-tech font-black uppercase text-neutral-500 tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="p-4 max-h-72 overflow-y-auto space-y-2">
        {target.robots.length === 0 && (
          <p className="text-center text-xs font-tech text-neutral-600 uppercase py-6">Sin robots</p>
        )}
        {target.robots.map(robot => (
          <div key={robot.id} className={`flex items-center justify-between p-3 border-2 ${robot.isHomologated ? 'border-cb-green-vibrant/30 bg-cb-green-vibrant/5' : 'border-neutral-800 bg-[#0a0a0a]'}`}>
            <div className="flex items-center gap-3">
              <Bot size={14} className={robot.isHomologated ? 'text-cb-green-vibrant' : 'text-neutral-600'} strokeWidth={2.5} />
              <div>
                <p className="text-xs font-tech font-black uppercase text-cb-white-tech">{robot.name}</p>
                <p className="text-[10px] font-tech text-neutral-500">{robot.level} · {robot.Institution?.name || '---'}</p>
              </div>
            </div>
            {robot.isHomologated
              ? <span className="flex items-center gap-1 text-[9px] font-tech font-black text-cb-green-vibrant border border-cb-green-vibrant/40 px-2 py-0.5 uppercase"><ShieldCheck size={10} /> OK</span>
              : <span className="flex items-center gap-1 text-[9px] font-tech font-black text-red-400 border border-red-500/40 px-2 py-0.5 uppercase"><AlertTriangle size={10} /> Pend.</span>
            }
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Level sub-rows component ──────────────────────────────────────────────────
const LevelRows = ({ stat, openModal }: { stat: CatStat; openModal: (catName: string, level: string | null, robots: Robot[]) => void }) => {
  const maxLevelRobots = Math.max(...stat.levelStats.map(ls => ls.robots.length), 1);
  return (
    <div className="border-t border-neutral-800/40 bg-neutral-950">
      {stat.levelStats.map(ls => (
        <div key={ls.level} className="flex items-center gap-3 px-4 py-2.5 border-b border-neutral-800/30 last:border-0 hover:bg-white/[0.015] transition-colors">
          <div className="w-6 shrink-0 flex items-center justify-center">
            <div className="w-px h-4 bg-neutral-700" />
          </div>
          <span className="text-[9px] font-tech font-black text-cb-yellow-neon border border-cb-yellow-neon/30 px-2 py-0.5 uppercase shrink-0 bg-cb-yellow-neon/5">{ls.level}</span>
          <div className="flex-1 min-w-0">
            <StackedBar ok={ls.homologated.length} pending={ls.pending.length} max={maxLevelRobots} />
          </div>
          <div className="flex gap-3 shrink-0 text-[10px] font-tech font-black w-20 justify-end">
            <span className="text-cb-white-tech">{ls.robots.length}</span>
            <span className="text-cb-green-vibrant">{ls.homologated.length}✓</span>
            <span className="text-red-400">{ls.pending.length}✗</span>
          </div>
          <button
            onClick={() => openModal(stat.cat.name, ls.level, ls.robots)}
            className="shrink-0 text-[9px] font-tech font-black uppercase text-neutral-500 hover:text-cb-green-vibrant border border-neutral-700 hover:border-cb-green-vibrant px-2 py-1 transition-all duration-75 cursor-pointer"
          >
            Ver
          </button>
        </div>
      ))}
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function CategoryDashboard({ categories, robots }: Props) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const catStats: CatStat[] = categories.map(cat => {
    const catRobots = robots.filter(r => match(r.category, cat.name));
    const catLevels = cat.levels && cat.levels.length > 0 ? cat.levels : [];
    const levelStats: LevelStat[] = catLevels.map(level => {
      const lr = catRobots.filter(r => match(r.level, level));
      return { level, robots: lr, homologated: lr.filter(r => r.isHomologated), pending: lr.filter(r => !r.isHomologated) };
    });
    return {
      cat,
      robots: catRobots,
      homologated: catRobots.filter(r => r.isHomologated),
      pending: catRobots.filter(r => !r.isHomologated),
      levelStats,
    };
  });

  const totalRobots = robots.length;
  const totalHomologated = robots.filter(r => r.isHomologated).length;

  const openModal = (catName: string, level: string | null, robotList: Robot[]) => {
    setModalTarget({
      catName,
      level,
      robots: robotList,
      homologated: robotList.filter(r => r.isHomologated),
      pending: robotList.filter(r => !r.isHomologated),
    });
  };

  return (
    <div className="space-y-5 p-1">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Robots', value: totalRobots, color: '#FFF000', icon: Bot },
          { label: 'Homologados', value: totalHomologated, color: '#10B961', icon: ShieldCheck },
          { label: 'Sin Homologar', value: totalRobots - totalHomologated, color: '#f87171', icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="relative bg-[#0a0a0a] border-2 border-neutral-800 p-4 shadow-[4px_4px_0_#000] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
            <div className="flex items-center gap-3">
              <Icon size={18} style={{ color }} strokeWidth={2.5} />
              <div>
                <p className="text-2xl font-tech font-black leading-none" style={{ color }}>{value}</p>
                <p className="text-[9px] font-tech font-black uppercase text-neutral-500 tracking-widest mt-0.5">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Category table with expandable levels ── */}
      <div className="bg-[#0a0a0a] border-2 border-neutral-800 shadow-[4px_4px_0_#000]">
        <div className="flex items-center gap-2 px-5 py-3 border-b-2 border-neutral-800">
          <Layers size={13} className="text-cb-yellow-neon" strokeWidth={2.5} />
          <p className="text-[10px] font-tech font-black uppercase text-cb-yellow-neon tracking-widest">Robots por Categoría</p>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-cb-green-vibrant" /><span className="text-[9px] font-tech text-neutral-500 uppercase">Homologados</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-400" /><span className="text-[9px] font-tech text-neutral-500 uppercase">Pendientes</span></div>
          </div>
        </div>

        <div className="divide-y divide-neutral-800/60">
          {catStats.length === 0 && (
            <p className="text-xs font-tech text-neutral-600 uppercase text-center py-6">Sin categorías</p>
          )}

          {catStats.map(stat => {
            const isOpen = expandedCats.has(stat.cat.id);
            const hasLevels = stat.levelStats.length > 0;
            return (
              <div key={stat.cat.id}>
                {/* ── Category row ── */}
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  {/* Expand toggle */}
                  <button
                    onClick={() => hasLevels && toggleExpand(stat.cat.id)}
                    className={`w-6 h-6 flex items-center justify-center border transition-all duration-75 shrink-0 ${hasLevels ? 'border-neutral-600 hover:border-cb-yellow-neon text-neutral-500 hover:text-cb-yellow-neon cursor-pointer' : 'border-neutral-800 text-neutral-800 cursor-default'}`}
                  >
                    {hasLevels
                      ? (isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />)
                      : <span className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
                    }
                  </button>

                  {/* Name */}
                  <span className="text-xs font-tech font-black uppercase text-cb-white-tech flex-1 min-w-0 truncate">{stat.cat.name}</span>

                  {/* Level badges */}
                  <div className="flex gap-1 shrink-0">
                    {(stat.cat.levels || []).map(l => (
                      <span key={l} className="text-[7px] font-tech font-black text-cb-yellow-neon/70 border border-cb-yellow-neon/20 px-1 uppercase">{l}</span>
                    ))}
                  </div>

                  {/* Bar */}
                  <div className="w-24 shrink-0">
                    <StackedBar ok={stat.homologated.length} pending={stat.pending.length} max={Math.max(stat.robots.length, 1)} />
                  </div>

                  {/* Counts */}
                  <div className="flex gap-3 shrink-0 text-[10px] font-tech font-black w-20 justify-end">
                    <span className="text-cb-white-tech">{stat.robots.length}</span>
                    <span className="text-cb-green-vibrant">{stat.homologated.length}✓</span>
                    <span className="text-red-400">{stat.pending.length}✗</span>
                  </div>

                  {/* Ver detalles */}
                  <button
                    onClick={() => openModal(stat.cat.name, null, stat.robots)}
                    className="shrink-0 text-[9px] font-tech font-black uppercase text-neutral-500 hover:text-cb-yellow-neon border border-neutral-700 hover:border-cb-yellow-neon px-2 py-1 transition-all duration-75 cursor-pointer"
                  >
                    Ver
                  </button>
                </div>

                {/* ── Level sub-rows (expanded) ── */}
                {isOpen && hasLevels && (
                  <LevelRows stat={stat} openModal={openModal} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {modalTarget && <DetailModal target={modalTarget} onClose={() => setModalTarget(null)} />}
    </div>
  );
}
