import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Bot,
  Users,
  Plus,
  Trash2,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  X,
  Target,
  Search,
  Edit2,
  Star,
  CreditCard,
  FileText,
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
interface Institution {
  id: string;
  name: string;
  contactEmail?: string;
  isPaid: boolean;
  members: string[];
}

interface Robot {
  id: string;
  name: string;
  level: 'JUNIOR' | 'SENIOR' | 'MASTER';
  category: string;
  isHomologated: boolean;
  institutionId: string;
  Institution?: Institution;
}

interface User {
  id: string;
  username: string;
  role: string;
}

interface Match {
  id: string;
  robotAId: string;
  robotBId: string;
  scoreA: number;
  scoreB: number;
  category: string;
  round: string;
  refereeId: string;
  robotA?: Robot;
  robotB?: Robot;
  referee?: User;
  showInDashboard: boolean;
}

interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  tier: string;
}

interface Registration {
  id: string;
  google_email: string;
  data: any;
  payment_proof_filename: string;
  isPaid: boolean;
  paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const COMPETITION_LEVELS = ['JUNIOR', 'SENIOR', 'MASTER'] as const;

const CATEGORIES_BY_LEVEL: Record<string, string[]> = {
  JUNIOR: [
    'RoboFut',
    'Minisumo Autónomo',
    'Laberinto',
    'BattleBots 1lb',
    'Seguidor de Línea',
    'Sumo RC',
    'Scratch & Play: Code Masters Arena'
  ],
  SENIOR: [
    'RoboFut',
    'Minisumo Autónomo',
    'Laberinto',
    'BattleBots 1lb',
    'Seguidor de Línea',
    'Sumo RC',
    'Scratch & Play: Code Masters Arena',
    'BioBot'
  ],
  MASTER: [
    'Minisumo Autónomo',
    'Seguidor de Línea',
    'RoboFut Master',
    'BattleBots 1lb'
  ]
};

const AdminPanel = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'institutions' | 'robots' | 'referees' | 'matches' | 'sponsors' | 'brackets' | 'payments'>('institutions');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRobots, setSelectedRobots] = useState<string[]>([]);
  const [data, setData] = useState<{
    institutions: Institution[],
    robots: Robot[],
    referees: User[],
    matches: Match[],
    sponsors: Sponsor[],
    registrations: Registration[]
  }>({
    institutions: [],
    robots: [],
    referees: [],
    matches: [],
    sponsors: [],
    registrations: []
  });

  const fetchData = async () => {
    try {
      const authHeader = { 'Authorization': `Bearer ${token}` };
      const [inst, robots, users, matches, sponsors, regs] = await Promise.all([
        fetch('/api/institutions', { headers: authHeader }).then(res => res.json()),
        fetch('/api/robots', { headers: authHeader }).then(res => res.json()),
        fetch('/api/users', { headers: authHeader }).then(res => res.json()),
        fetch('/api/matches', { headers: authHeader }).then(res => res.json()),
        fetch('/api/sponsors', { headers: authHeader }).then(res => res.json()),
        fetch('/api/registrations', { headers: authHeader }).then(res => res.json())
      ]);
      setData({
        institutions: inst,
        robots: robots,
        referees: users.filter((u: any) => u.role === 'REFEREE'),
        matches: matches,
        sponsors: sponsors,
        registrations: regs || []
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let endpoint = `/${activeTab}`;
    const method = isEditMode ? 'PUT' : 'POST';
    if (isEditMode) endpoint += `/${editingId}`;

    try {
      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({});
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al procesar la solicitud');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleEdit = (item: any) => {
    setIsEditMode(true);
    setEditingId(item.id);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    let endpoint = `/${activeTab}/${id}`;

    try {
      const response = await fetch(`/api${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) fetchData();
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const handleToggleDashboard = async (match: Match) => {
    try {
      const resp = await fetch(`/api/matches/${match.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ showInDashboard: !match.showInDashboard })
      });
      if (resp.ok) fetchData();
    } catch (err) {
      console.error('Error toggling dashboard:', err);
    }
  };

  const handleUpdatePaymentStatus = async (reg: Registration, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    try {
      const resp = await fetch(`/api/registrations/${reg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: status })
      });
      if (resp.ok) fetchData();
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const handleGenerateBracket = async () => {
    if (!formData.category || !formData.level || selectedRobots.length < 2 || !formData.refereeId) {
      alert('Completa Nivel, Categoría, Árbitro y selecciona al menos 2 robots');
      return;
    }
    try {
      const resp = await fetch('/api/brackets/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: formData.category,
          level: formData.level,
          robotIds: selectedRobots,
          refereeId: formData.refereeId
        })
      });
      if (resp.ok) {
        alert('Llave generada con éxito');
        setActiveTab('matches');
        fetchData();
      }
    } catch (err) {
      console.error('Error generating bracket:', err);
    }
  };

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => { setActiveTab(id); setSearchQuery(''); }}
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-sm uppercase ${activeTab === id ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
        }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  const getTabLabel = (id: string) => {
    switch (id) {
      case 'institutions': return 'Instituciones';
      case 'robots': return 'Robots';
      case 'referees': return 'Árbitros';
      case 'matches': return 'Encuentros';
      case 'sponsors': return 'Sponsors';
      case 'payments': return 'Pagos';
      default: return id;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-black flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-80 bg-white border-r border-neutral-100 p-8 flex flex-col gap-10 shadow-sm">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 flex items-center justify-center text-brand">
            <img src="/favicon.svg" alt="Logo" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter leading-none">
              Cato<span className="text-brand">Bots IV</span>
            </h2>
            <p className="text-sm font-black text-neutral-400 uppercase">Centro de Gestión</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <TabButton id="institutions" icon={Building2} label="Instituciones" />
          <TabButton id="robots" icon={Bot} label="Robots" />
          <TabButton id="referees" icon={Users} label="Árbitros" />
          <TabButton id="matches" icon={Target} label="Encuentros" />
          <TabButton id="sponsors" icon={Star} label="Sponsors" />
          <TabButton id="payments" icon={CreditCard} label="Pagos" />
          <TabButton id="brackets" icon={Share2} label="Generador" />
          <button onClick={() => navigate('/keys')} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 font-black hover:bg-neutral-100 hover:text-black transition-all text-sm uppercase">
            <Share2 size={18} /> Llaves del Torneo
          </button>
        </nav>

        <div className="flex flex-col gap-2 pt-8 border-t border-neutral-50">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-400 font-black hover:bg-neutral-100 hover:text-black transition-all text-sm uppercase">
            <LayoutDashboard size={18} /> Vista Pública
          </button>
          <button onClick={logout} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 font-black hover:bg-red-50 transition-all text-sm uppercase">
            <LogOut size={18} /> Salir del Sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-16 overflow-y-auto">
        <header className="mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <span className="text-md font-black uppercase text-neutral-400 mb-2 block px-2">Nodo Administrativo</span>
            <h1 className="text-6xl font-black tracking-tighter uppercase text-black">{getTabLabel(activeTab)}</h1>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
            {activeTab !== 'payments' && activeTab !== 'brackets' && (
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Buscar...`}
                  className="w-full bg-white border border-neutral-100 pl-12 pr-4 py-4 rounded-2xl text-md font-bold outline-none focus:border-brand/30 transition-all shadow-sm"
                />
              </div>
            )}

            {activeTab !== 'payments' && activeTab !== 'brackets' && (
              <button
                onClick={() => { setIsEditMode(false); setFormData({}); setShowModal(true); }}
                className="bg-black text-white hover:bg-neutral-800 px-8 py-4 rounded-2xl font-black text-sm uppercase flex items-center gap-3 transition-all shadow-xl shadow-black/10 whitespace-nowrap"
              >
                <Plus size={18} /> Agregar
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence mode="wait">
            {activeTab === 'institutions' && data.institutions.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((inst) => (
              <motion.div key={inst.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg shadow-neutral-200/40">
                <div className="flex items-center gap-8 min-w-0 flex-1">
                  <div className="w-16 h-16 bg-brand/5 rounded-3xl flex items-center justify-center text-brand border border-brand/10 shadow-inner flex-shrink-0"><Building2 size={32} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-black text-black">{inst.name}</h3>
                      {inst.isPaid ? (
                        <span className="bg-brand/10 text-brand text-xs font-black uppercase px-2 py-0.5 rounded-full border border-brand/20">PAGADO</span>
                      ) : (
                        <span className="bg-red-500/10 text-red-500 text-xs font-black uppercase px-2 py-0.5 rounded-full border border-red-500/20">PENDIENTE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 mt-3">
                      <div className="flex gap-2">
                        {inst.members?.map((m: string, i: number) => (
                          <span key={i} className="text-xs font-black text-neutral-500 px-4 py-1.5 bg-neutral-50 rounded-lg border border-neutral-100">{m}</span>
                        ))}
                      </div>
                      {inst.contactEmail && <span className="text-xs text-neutral-400 font-bold">{inst.contactEmail}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(inst)} className="text-neutral-400 hover:text-black hover:bg-neutral-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Edit2 size={20} /></button>
                  <button onClick={() => handleDelete(inst.id)} className="text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Trash2 size={20} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'robots' && data.robots.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((robot) => (
              <motion.div key={robot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg shadow-neutral-200/40">
                <div className="flex items-center gap-8 min-w-0 flex-1">
                  <div className="w-16 h-16 bg-brand/5 rounded-3xl flex items-center justify-center text-brand border border-brand/10 shadow-inner flex-shrink-0"><Bot size={32} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-black text-black">{robot.name}</h3>
                      {robot.isHomologated && (
                        <span className="bg-brand/10 text-brand text-xs font-black uppercase px-2 py-0.5 rounded-full border border-brand/20">Homologado</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <p className="text-xs font-black text-brand px-3 py-1 bg-brand/5 rounded-lg border border-brand/10">{robot.level}</p>
                      <p className="text-xs font-black text-neutral-500 px-3 py-1 bg-neutral-50 rounded-lg border border-neutral-100">{robot.category}</p>
                      <p className="text-xs text-neutral-400 font-bold">@{robot.Institution?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-6">
                  <button onClick={() => handleEdit(robot)} className="text-neutral-400 hover:text-black hover:bg-neutral-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Edit2 size={20} /></button>
                  <button onClick={() => handleDelete(robot.id)} className="text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Trash2 size={20} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'referees' && data.referees.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
              <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg shadow-neutral-200/40">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-brand/5 rounded-3xl flex items-center justify-center text-brand border border-brand/10 shadow-inner flex-shrink-0"><Users size={32} /></div>
                  <div className="flex flex-wrap items-center gap-4">
                    <h3 className="text-xl font-black text-black">@{u.username}</h3>
                    <p className="text-xs font-black text-neutral-500 px-3 py-1 bg-neutral-50 rounded-lg border border-neutral-100">{u.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(u)} className="text-neutral-400 hover:text-black hover:bg-neutral-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Edit2 size={20} /></button>
                  <button onClick={() => handleDelete(u.id)} className="text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Trash2 size={20} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'matches' && data.matches.filter(m => m.robotA?.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.robotB?.name.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[3rem] flex flex-col gap-6 shadow-lg shadow-neutral-200/40 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand/10 transition-all group-hover:bg-brand" />
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-md font-black text-brand uppercase">{m.category}</span>
                    <span className="text-sm font-black text-neutral-400 uppercase">{m.round}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleDashboard(m)}
                      className={`transition-all p-4 rounded-2xl border ${m.showInDashboard ? 'bg-brand text-white border-brand' : 'bg-neutral-50 text-neutral-300 border-neutral-100'}`}
                      title="Mostrar en Dashboard"
                    >
                      <LayoutDashboard size={20} />
                    </button>
                    <button onClick={() => handleEdit(m)} className="text-neutral-400 hover:text-black hover:bg-neutral-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Edit2 size={20} /></button>
                    <button onClick={() => handleDelete(m.id)} className="text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Trash2 size={20} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-lg font-black text-black leading-tight mb-1">{m.robotA?.name || '---'}</p>
                    <p className="text-xs font-bold text-neutral-300 uppercase truncate">{m.robotA?.Institution?.name}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100 font-mono font-black text-lg text-black">
                      {m.scoreA} - {m.scoreB}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-lg font-black text-black leading-tight mb-1">{m.robotB?.name || '---'}</p>
                    <p className="text-xs font-bold text-neutral-300 uppercase truncate">{m.robotB?.Institution?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-neutral-50">
                  <div className="w-10 h-10 bg-brand/5 rounded-2xl flex items-center justify-center text-brand border border-brand/10 shadow-inner flex-shrink-0"><Users size={20} /></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-neutral-400">Árbitro</span>
                    <span className="text-sm font-black text-neutral-700">@{m.referee?.username || 'Sin asignar'}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {activeTab === 'sponsors' && data.sponsors.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((sponsor) => (
              <motion.div key={sponsor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg shadow-neutral-200/40">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center p-4 border border-neutral-100">
                    {sponsor.logoUrl ? <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-contain" /> : <Star size={32} className="text-neutral-200" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black">{sponsor.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs font-black text-brand px-3 py-1 bg-brand/5 rounded-lg border border-brand/10">{sponsor.tier}</p>
                      <span className="text-xs text-neutral-400 font-bold">{sponsor.website}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(sponsor)} className="text-neutral-400 hover:text-black hover:bg-neutral-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Star size={20} /></button>
                  <button onClick={() => handleDelete(sponsor.id)} className="text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Trash2 size={20} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'payments' && data.registrations.map((reg) => (
              <motion.div key={reg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-lg shadow-neutral-200/40 col-span-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-neutral-50 rounded-3xl flex items-center justify-center text-neutral-400 border border-neutral-100 shadow-inner flex-shrink-0">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black break-all">{reg.google_email}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-neutral-400 uppercase">{reg.data?.category} - {reg.data?.level || reg.data?.institution}</span>
                      </div>
                    </div>
                  </div>
                  {reg.paymentStatus === 'APPROVED' && (
                    <span className="bg-brand/10 text-brand text-xs font-black uppercase px-3 py-1 rounded-full border border-brand/20 flex items-center gap-2">
                      <ShieldCheck size={14} /> Pagado
                    </span>
                  )}
                  {reg.paymentStatus === 'REJECTED' && (
                    <span className="bg-red-500/10 text-red-500 text-xs font-black uppercase px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-2">
                      Denegado
                    </span>
                  )}
                  {(reg.paymentStatus === 'PENDING' || !reg.paymentStatus) && (
                    <span className="bg-neutral-100 text-neutral-500 text-xs font-black uppercase px-3 py-1 rounded-full border border-neutral-200 flex items-center gap-2">
                      Pendiente
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-neutral-400">Comprobante</span>
                    {reg.payment_proof_filename ? (
                      <a
                        href={`/uploads/${reg.payment_proof_filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand font-bold text-sm hover:underline"
                      >
                        Ver Imagen
                      </a>
                    ) : (
                      <span className="text-xs text-red-400 font-bold">Sin comprobante</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    {reg.paymentStatus !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(reg, 'APPROVED')}
                        className="w-full py-4 rounded-xl font-black uppercase text-xs transition-all bg-black text-white hover:bg-neutral-800 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                      >
                        Aprobar
                      </button>
                    )}

                    {reg.paymentStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(reg, 'REJECTED')}
                        className="w-full py-4 rounded-xl font-black uppercase text-xs transition-all bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 flex items-center justify-center gap-2"
                      >
                        Rechazar
                      </button>
                    )}

                    {reg.paymentStatus === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(reg, 'PENDING')}
                        className="w-full py-4 rounded-xl font-black uppercase text-xs transition-all bg-neutral-100 text-neutral-500 hover:bg-neutral-200 col-span-2"
                      >
                        Marcar como Pendiente
                      </button>
                    )}

                    {reg.paymentStatus === 'REJECTED' && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(reg, 'PENDING')}
                        className="col-span-1 py-4 rounded-xl font-black uppercase text-xs transition-all bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      >
                        Restaurar
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Dropdown/Expand could go here */}
                <div className="pt-4 border-t border-neutral-50 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-400 font-bold block">Robot/Equipo</span>
                    <span className="font-black">{reg.data?.robotName || reg.data?.teamName || '---'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold block">Asesor</span>
                    <span className="font-black">{reg.data?.advisorName || '---'}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {activeTab === 'brackets' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full bg-white border border-neutral-100 rounded-[3rem] p-12 shadow-xl shadow-neutral-200/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Configuración de Llave</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-neutral-400 px-2">Nivel de Competencia</label>
                        <select value={formData.level || ''} onChange={e => setFormData({ ...formData, level: e.target.value, category: '' })} className="w-full text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none">
                          <option value="">Seleccionar...</option>
                          {COMPETITION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-neutral-400 px-2">Categoría</label>
                        <select required disabled={!formData.level} value={formData.category || ''} className="w-full text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {formData.level && CATEGORIES_BY_LEVEL[formData.level].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-neutral-400 px-2">Árbitro Oficial</label>
                        <select value={formData.refereeId || ''} onChange={e => setFormData({ ...formData, refereeId: e.target.value })} className="w-full text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none">
                          <option value="">Seleccionar...</option>
                          {data.referees.map(u => <option key={u.id} value={u.id}>@{u.username}</option>)}
                        </select>
                      </div>

                      <button onClick={handleGenerateBracket} className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-md shadow-2xl shadow-black/10 hover:bg-brand transition-all">
                        Generar Llave Automática
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black uppercase tracking-tight">Robot Participantes</h3>
                      <span className="bg-neutral-50 text-xs text-neutral-500 font-black px-4 py-2 rounded-full border border-neutral-100">
                        {selectedRobots.length} Seleccionados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                      {data.robots
                        .filter(r => !formData.level || r.level === formData.level)
                        .filter(r => !formData.category || r.category === formData.category)
                        .map(robot => (
                          <div
                            key={robot.id}
                            onClick={() => {
                              if (selectedRobots.includes(robot.id)) {
                                setSelectedRobots(selectedRobots.filter(id => id !== robot.id));
                              } else {
                                setSelectedRobots([...selectedRobots, robot.id]);
                              }
                            }}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${selectedRobots.includes(robot.id) ? 'bg-brand/5 border-brand/20' : 'bg-neutral-50 border-neutral-100'
                              }`}
                          >
                            <div>
                              <p className="font-black text-sm">{robot.name}</p>
                              <p className="text-xs font-bold text-neutral-400">{robot.Institution?.name}</p>
                            </div>
                            {selectedRobots.includes(robot.id) && <div className="w-4 h-4 bg-brand rounded-full" />}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-neutral-100">
              <div className="p-10 border-b border-neutral-50 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-black uppercase tracking-tight">{activeTab === 'institutions' ? (isEditMode ? 'Editar' : 'Nueva') : (isEditMode ? 'Editar' : 'Nuevo')} {activeTab === 'institutions' ? 'institución' : getTabLabel(activeTab).slice(0, -1)}</h2>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Completa los datos del registro</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300 hover:text-black transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10">
                {activeTab === 'institutions' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Nombre de la Institución</label>
                      <input required value={formData.name || ''} placeholder="ej. Universidad Nacional" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 text-sm font-bold" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Email de Contacto</label>
                        <input type="email" value={formData.contactEmail || ''} placeholder="ej. contacto@uni.edu" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 text-sm font-bold" onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Estado de Pago ($10)</label>
                        <div onClick={() => setFormData({ ...formData, isPaid: !formData.isPaid })} className={`w-full p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${formData.isPaid ? 'bg-green-500/5 border-green-500/20 text-green-600' : 'bg-neutral-50 border-neutral-100 text-neutral-400'}`}>
                          <span className="text-xs font-black uppercase">{formData.isPaid ? 'Pagado' : 'Pendiente'}</span>
                          <ShieldCheck size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'robots' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Nombre del Robot</label>
                        <input required value={formData.name || ''} placeholder="ej. Destroyer 3000" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Nivel de Competencia</label>
                        <select required value={formData.level || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none text-sm" onChange={e => setFormData({ ...formData, level: e.target.value, category: '' })}>
                          <option value="">Seleccionar...</option>
                          {COMPETITION_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Categoría</label>
                        <select required disabled={!formData.level} value={formData.category || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none text-sm" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {formData.level && CATEGORIES_BY_LEVEL[formData.level].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Institución</label>
                        <select required value={formData.institutionId || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none text-sm" onChange={e => setFormData({ ...formData, institutionId: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {data.institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <input type="checkbox" id="homologated" checked={formData.isHomologated || false} onChange={e => setFormData({ ...formData, isHomologated: e.target.checked })} className="w-5 h-5 accent-brand" />
                      <label htmlFor="homologated" className="text-xs font-black uppercase text-neutral-500 cursor-pointer">Robot Homologado (Pasó revisión técnica)</label>
                    </div>
                  </div>
                )}

                {activeTab === 'referees' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Nombre de Usuario</label>
                      <input required value={formData.username || ''} placeholder="Login de operador" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5" onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Clave Secreta {isEditMode && '(Dejar en blanco para mantener actual)'}</label>
                      <input required={!isEditMode} type="password" placeholder="Credenciales de acceso" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5" onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  </div>
                )}

                {activeTab === 'matches' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Robot A (Rojo)</label>
                        <select required value={formData.robotAId || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none text-xs" onChange={e => setFormData({ ...formData, robotAId: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {data.robots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Robot B (Azul)</label>
                        <select required value={formData.robotBId || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none text-xs" onChange={e => setFormData({ ...formData, robotBId: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {data.robots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Categoría / Grupo</label>
                        <input required value={formData.category || ''} placeholder="ej. Grupo A / Juvenil" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 text-sm" onChange={e => setFormData({ ...formData, category: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Ronda del Torneo</label>
                        <select required value={formData.round || 'QUARTERS'} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none text-sm" onChange={e => setFormData({ ...formData, round: e.target.value })}>
                          <option value="QUARTERS">Cuartos de Final</option>
                          <option value="SEMIS">Semifinal</option>
                          <option value="FINAL">Gran Final</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Árbitro Asignado</label>
                      <select required value={formData.refereeId || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none text-sm" onChange={e => setFormData({ ...formData, refereeId: e.target.value })}>
                        <option value="">Seleccionar...</option>
                        {data.referees.map(u => <option key={u.id} value={u.id}>@{u.username}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'sponsors' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Nombre del Sponsor</label>
                      <input required value={formData.name || ''} placeholder="Nombre oficial" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Logo URL</label>
                      <input value={formData.logoUrl || ''} placeholder="https://..." className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5" onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Sitio Web</label>
                        <input value={formData.website || ''} placeholder="www.sponsor.com" className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5" onChange={e => setFormData({ ...formData, website: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Nivel (Tier)</label>
                        <select required value={formData.tier || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-5 appearance-none" onChange={e => setFormData({ ...formData, tier: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          <option value="GOLD">GOLD</option>
                          <option value="SILVER">SILVER</option>
                          <option value="BRONZE">BRONZE</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-brand text-white font-black py-6 rounded-2xl shadow-xl shadow-brand/20 hover:shadow-brand/40 transition-all mt-4 text-xs uppercase tracking-[0.2em]">{isEditMode ? 'Guardar Cambios' : 'Desplegar Cambios'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
