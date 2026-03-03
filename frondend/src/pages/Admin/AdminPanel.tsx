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
import { api, UPLOADS_URL } from '../../config/api';
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
        api.get('/api/institutions', { headers: authHeader }).then(res => res.json()),
        api.get('/api/robots', { headers: authHeader }).then(res => res.json()),
        api.get('/api/users', { headers: authHeader }).then(res => res.json()),
        api.get('/api/matches', { headers: authHeader }).then(res => res.json()),
        api.get('/api/sponsors', { headers: authHeader }).then(res => res.json()),
        api.get('/api/registrations', { headers: authHeader }).then(res => res.json())
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
    let endpoint = `/api/${activeTab}`;
    const method = isEditMode ? 'PUT' : 'POST';
    if (isEditMode) endpoint += `/${editingId}`;

    console.log('handleSubmit:', { endpoint, method, formData });

    try {
      const response = method === 'PUT' 
        ? await api.put(endpoint, formData, { headers: { 'Authorization': `Bearer ${token}` } })
        : await api.post(endpoint, formData, { headers: { 'Authorization': `Bearer ${token}` } });

      console.log('response:', response.status);
      
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
    const endpoint = `/api/${activeTab}/${id}`;

    try {
      const response = await api.del(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });

      if (response.ok) fetchData();
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const handleToggleDashboard = async (match: Match) => {
    try {
      const resp = await api.put(`/api/matches/${match.id}`, { showInDashboard: !match.showInDashboard }, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resp.ok) fetchData();
    } catch (err) {
      console.error('Error toggling dashboard:', err);
    }
  };

  const handleUpdatePaymentStatus = async (reg: Registration, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    try {
      const resp = await api.put(`/api/registrations/${reg.id}`, { paymentStatus: status }, { headers: { 'Authorization': `Bearer ${token}` } });
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
      const resp = await api.post('/api/brackets/generate', {
        category: formData.category,
        level: formData.level,
        robotIds: selectedRobots,
        refereeId: formData.refereeId
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
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
      className={`flex items-center gap-4 px-5 py-3.5 transition-all duration-75 font-tech font-black text-sm uppercase tracking-wider border-2 ${
        activeTab === id 
          ? 'bg-cb-yellow-neon text-cb-black-pure border-cb-black-pure shadow-[3px_3px_0_#10B961]' 
          : 'text-neutral-400 border-transparent hover:bg-white/5 hover:text-cb-yellow-neon hover:border-cb-yellow-neon/30'
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
    <div className="min-h-screen bg-cb-black-pure text-cb-white-tech flex flex-col md:flex-row font-sans">
      <aside className="hidden md:flex w-80 bg-[#0a0a0a] border-r-4 border-cb-yellow-neon p-6 flex-col gap-6 fixed top-0 left-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Warning tape top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-warning-tape" />

        <div className="flex flex-col items-center gap-2 pt-4 pb-2">
          <img src="/logo-yellow.png" alt="Logo" className="w-40 h-auto object-contain" />
          <div className="mt-1 px-3 py-1 bg-cb-yellow-neon border-2 border-cb-black-pure">
            <p className="text-xs font-tech font-black text-cb-black-pure uppercase tracking-widest">Centro de Gestión</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <TabButton id="institutions" icon={Building2} label="Instituciones" />
          <TabButton id="robots" icon={Bot} label="Robots" />
          <TabButton id="referees" icon={Users} label="Árbitros" />
          <TabButton id="matches" icon={Target} label="Encuentros" />
          <TabButton id="sponsors" icon={Star} label="Sponsors" />
          <TabButton id="payments" icon={CreditCard} label="Pagos" />
          <TabButton id="brackets" icon={Share2} label="Generador" />
          <button onClick={() => navigate('/keys')} className="flex items-center gap-4 px-5 py-3.5 text-neutral-400 font-tech font-black hover:bg-white/5 hover:text-cb-yellow-neon transition-all duration-75 text-sm uppercase tracking-wider border-2 border-transparent hover:border-cb-yellow-neon/30">
            <Share2 size={18} /> Llaves del Torneo
          </button>
        </nav>

        <div className="flex flex-col gap-1 pt-4 border-t-2 border-neutral-800">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-4 px-5 py-3.5 text-neutral-500 font-tech font-black hover:bg-white/5 hover:text-cb-green-vibrant transition-all duration-75 text-sm uppercase tracking-wider border-2 border-transparent">
            <LayoutDashboard size={18} /> Vista Pública
          </button>
          <button onClick={logout} className="flex items-center gap-4 px-5 py-3.5 text-red-500 font-tech font-black hover:bg-red-500/10 transition-all duration-75 text-sm uppercase tracking-wider border-2 border-transparent hover:border-red-500/30">
            <LogOut size={18} /> Salir del Sistema
          </button>
        </div>

        {/* Warning tape bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-warning-tape" />
      </aside>

      <main className="flex-1 p-6 md:p-10 md:ml-80 overflow-y-auto min-h-screen">
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <span className="text-xs font-tech font-black uppercase text-cb-green-vibrant tracking-widest mb-2 block">Nodo Administrativo</span>
            <h1 className="text-4xl md:text-5xl font-tech font-black tracking-wider uppercase text-cb-white-tech">{getTabLabel(activeTab)}</h1>
            <div className="mt-2 h-1 w-24 bg-cb-yellow-neon" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            {activeTab !== 'payments' && activeTab !== 'brackets' && (
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Buscar...`}
                  className="w-full bg-[#1a1a1a] border-2 border-neutral-700 pl-12 pr-4 py-3.5 text-sm font-tech font-bold text-cb-white-tech outline-none focus:border-cb-yellow-neon transition-all duration-75 placeholder:text-neutral-600"
                />
              </div>
            )}

            {activeTab !== 'payments' && activeTab !== 'brackets' && (
              <button
                onClick={() => { setIsEditMode(false); setFormData({}); setShowModal(true); }}
                className="bg-cb-yellow-neon text-cb-black-pure hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none px-6 py-3.5 font-tech font-black text-sm uppercase flex items-center gap-2 transition-all duration-75 border-3 border-cb-black-pure shadow-[4px_4px_0_#10B961] whitespace-nowrap"
              >
                <Plus size={18} /> Agregar
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence mode="wait">
            {activeTab === 'institutions' && data.institutions.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((inst) => (
              <motion.div key={inst.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border-3 border-neutral-800 p-6 flex justify-between items-center shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75">
                <div className="flex items-center gap-6 min-w-0 flex-1">
                  <div className="w-14 h-14 bg-cb-green-vibrant/10 flex items-center justify-center text-cb-green-vibrant border-2 border-cb-green-vibrant/30 flex-shrink-0"><Building2 size={28} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-tech font-black text-cb-white-tech uppercase tracking-wider">{inst.name}</h3>
                      {inst.isPaid ? (
                        <span className="bg-cb-green-vibrant/20 text-cb-green-vibrant text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-cb-green-vibrant/40">PAGADO</span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-red-500/40">PENDIENTE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex gap-2">
                        {inst.members?.map((m: string, i: number) => (
                          <span key={i} className="text-[10px] font-tech font-bold text-neutral-400 px-3 py-1 bg-black/50 border border-neutral-700">{m}</span>
                        ))}
                      </div>
                      {inst.contactEmail && <span className="text-[10px] text-neutral-500 font-tech font-bold">{inst.contactEmail}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(inst)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(inst.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-red-500"><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'robots' && data.robots.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((robot) => (
              <motion.div key={robot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border-3 border-neutral-800 p-6 flex justify-between items-center shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75">
                <div className="flex items-center gap-6 min-w-0 flex-1">
                  <div className="w-14 h-14 bg-cb-yellow-neon/10 flex items-center justify-center text-cb-yellow-neon border-2 border-cb-yellow-neon/30 flex-shrink-0"><Bot size={28} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-tech font-black text-cb-white-tech uppercase tracking-wider">{robot.name}</h3>
                      {robot.isHomologated && (
                        <span className="bg-cb-green-vibrant/20 text-cb-green-vibrant text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-cb-green-vibrant/40">Homologado</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <p className="text-[10px] font-tech font-bold text-cb-yellow-neon px-2 py-0.5 bg-cb-yellow-neon/10 border border-cb-yellow-neon/30">{robot.level}</p>
                      <p className="text-[10px] font-tech font-bold text-neutral-400 px-2 py-0.5 bg-black/50 border border-neutral-700">{robot.category}</p>
                      <p className="text-[10px] text-neutral-500 font-tech font-bold">@{robot.Institution?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(robot)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(robot.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-red-500"><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'referees' && data.referees.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
              <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border-3 border-neutral-800 p-6 flex justify-between items-center shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-cb-green-vibrant/10 flex items-center justify-center text-cb-green-vibrant border-2 border-cb-green-vibrant/30 flex-shrink-0"><Users size={28} /></div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-tech font-black text-cb-white-tech uppercase">@{u.username}</h3>
                    <p className="text-[10px] font-tech font-bold text-cb-yellow-neon px-2 py-0.5 bg-cb-yellow-neon/10 border border-cb-yellow-neon/30">{u.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(u)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(u.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-red-500"><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'matches' && data.matches.filter(m => m.robotA?.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.robotB?.name.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border-3 border-neutral-800 p-6 flex flex-col gap-5 shadow-[4px_4px_0_#000] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-cb-green-vibrant/30 transition-all duration-75 group-hover:bg-cb-green-vibrant" />
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-tech font-black text-cb-yellow-neon uppercase">{m.category}</span>
                    <span className="text-[10px] font-tech font-bold text-neutral-500 uppercase">{m.round}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleDashboard(m)}
                      className={`transition-all duration-75 p-3 border ${m.showInDashboard ? 'bg-cb-green-vibrant text-cb-black-pure border-cb-green-vibrant' : 'bg-transparent text-neutral-600 border-neutral-700 hover:border-cb-green-vibrant hover:text-cb-green-vibrant'}`}
                      title="Mostrar en Dashboard"
                    >
                      <LayoutDashboard size={18} />
                    </button>
                    <button onClick={() => handleEdit(m)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(m.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-sm font-tech font-black text-cb-white-tech leading-tight mb-1 uppercase">{m.robotA?.name || '---'}</p>
                    <p className="text-[10px] font-tech font-bold text-neutral-500 uppercase truncate">{m.robotA?.Institution?.name}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-cb-black-pure px-4 py-2 border-2 border-cb-yellow-neon font-tech font-black text-lg text-cb-yellow-neon">
                      {m.scoreA} - {m.scoreB}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-sm font-tech font-black text-cb-white-tech leading-tight mb-1 uppercase">{m.robotB?.name || '---'}</p>
                    <p className="text-[10px] font-tech font-bold text-neutral-500 uppercase truncate">{m.robotB?.Institution?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t-2 border-neutral-800">
                  <div className="w-8 h-8 bg-cb-green-vibrant/10 flex items-center justify-center text-cb-green-vibrant border border-cb-green-vibrant/30 flex-shrink-0"><Users size={16} /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-tech font-bold text-neutral-500 uppercase">Árbitro</span>
                    <span className="text-xs font-tech font-black text-neutral-300">@{m.referee?.username || 'Sin asignar'}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {activeTab === 'sponsors' && data.sponsors.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((sponsor) => (
              <motion.div key={sponsor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border-3 border-neutral-800 p-6 flex justify-between items-center shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-[#1a1a1a] flex items-center justify-center p-3 border-2 border-neutral-700">
                    {sponsor.logoUrl ? <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-contain" /> : <Star size={28} className="text-neutral-600" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-tech font-black text-cb-white-tech uppercase tracking-wider">{sponsor.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-tech font-bold text-cb-yellow-neon px-2 py-0.5 bg-cb-yellow-neon/10 border border-cb-yellow-neon/30">{sponsor.tier}</p>
                      <span className="text-[10px] text-neutral-500 font-tech font-bold">{sponsor.website}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(sponsor)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-cb-yellow-neon"><Star size={18} /></button>
                  <button onClick={() => handleDelete(sponsor.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-3 border border-neutral-700 hover:border-red-500"><Trash2 size={18} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'payments' && data.registrations.map((reg) => (
              <motion.div key={reg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border-3 border-neutral-800 p-6 flex flex-col gap-5 shadow-[4px_4px_0_#000] col-span-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1a1a] flex items-center justify-center text-neutral-500 border-2 border-neutral-700 flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-tech font-black text-cb-white-tech break-all uppercase">{reg.google_email}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-tech font-bold text-neutral-500 uppercase">{reg.data?.category} - {reg.data?.level || reg.data?.institution}</span>
                      </div>
                    </div>
                  </div>
                  {reg.paymentStatus === 'APPROVED' && (
                    <span className="bg-cb-green-vibrant/20 text-cb-green-vibrant text-[10px] font-tech font-black uppercase px-2 py-1 border border-cb-green-vibrant/40 flex items-center gap-1">
                      <ShieldCheck size={12} /> Pagado
                    </span>
                  )}
                  {reg.paymentStatus === 'REJECTED' && (
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-tech font-black uppercase px-2 py-1 border border-red-500/40 flex items-center gap-1">
                      Denegado
                    </span>
                  )}
                  {(reg.paymentStatus === 'PENDING' || !reg.paymentStatus) && (
                    <span className="bg-cb-yellow-neon/10 text-cb-yellow-neon text-[10px] font-tech font-black uppercase px-2 py-1 border border-cb-yellow-neon/30 flex items-center gap-1">
                      Pendiente
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-[#0a0a0a] border-2 border-neutral-800 flex items-center justify-between">
                    <span className="text-[10px] font-tech font-black uppercase text-neutral-500">Comprobante</span>
                    {reg.payment_proof_filename ? (
                      <a
                        href={`${UPLOADS_URL}/${reg.payment_proof_filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cb-green-vibrant font-tech font-bold text-xs hover:text-cb-yellow-neon transition-colors"
                      >
                        Ver Imagen
                      </a>
                    ) : (
                      <span className="text-[10px] text-red-400 font-tech font-bold">Sin comprobante</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {reg.paymentStatus !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(reg, 'APPROVED')}
                        className="w-full py-3 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-cb-green-vibrant text-cb-black-pure border-2 border-cb-green-vibrant hover:translate-y-[-1px] flex items-center justify-center gap-1"
                      >
                        Aprobar
                      </button>
                    )}

                    {reg.paymentStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(reg, 'REJECTED')}
                        className="w-full py-3 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-transparent text-red-400 border-2 border-red-500/40 hover:bg-red-500/10 flex items-center justify-center gap-1"
                      >
                        Rechazar
                      </button>
                    )}

                    {reg.paymentStatus === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(reg, 'PENDING')}
                        className="w-full py-3 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-transparent text-neutral-500 border-2 border-neutral-700 hover:bg-white/5 col-span-2"
                      >
                        Marcar como Pendiente
                      </button>
                    )}

                    {reg.paymentStatus === 'REJECTED' && (
                      <button
                        onClick={() => handleUpdatePaymentStatus(reg, 'PENDING')}
                        className="col-span-1 py-3 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-transparent text-neutral-500 border-2 border-neutral-700 hover:bg-white/5"
                      >
                        Restaurar
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="pt-3 border-t-2 border-neutral-800 grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <span className="text-neutral-500 font-tech font-bold block uppercase">Robot/Equipo</span>
                    <span className="font-tech font-black text-cb-white-tech">{reg.data?.robotName || reg.data?.teamName || '---'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-tech font-bold block uppercase">Asesor</span>
                    <span className="font-tech font-black text-cb-white-tech">{reg.data?.advisorName || '---'}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {activeTab === 'brackets' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full bg-[#111] border-3 border-neutral-800 p-8 shadow-[6px_6px_0_#000]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xl font-tech font-black uppercase tracking-wider text-cb-yellow-neon">Configuración de Llave</h3>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-tech font-black text-neutral-500 uppercase tracking-widest">Nivel de Competencia</label>
                        <select value={formData.level || ''} onChange={e => setFormData({ ...formData, level: e.target.value, category: '' })} className="w-full text-cb-white-tech bg-[#0a0a0a] border-2 border-neutral-700 p-4 appearance-none font-tech text-sm focus:border-cb-yellow-neon outline-none transition-all duration-75">
                          <option value="">Seleccionar...</option>
                          {COMPETITION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-tech font-black text-neutral-500 uppercase tracking-widest">Categoría</label>
                        <select required disabled={!formData.level} value={formData.category || ''} className="w-full text-cb-white-tech bg-[#0a0a0a] border-2 border-neutral-700 p-4 appearance-none font-tech text-sm focus:border-cb-yellow-neon outline-none transition-all duration-75 disabled:opacity-40" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {formData.level && CATEGORIES_BY_LEVEL[formData.level].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-tech font-black text-neutral-500 uppercase tracking-widest">Árbitro Oficial</label>
                        <select value={formData.refereeId || ''} onChange={e => setFormData({ ...formData, refereeId: e.target.value })} className="w-full text-cb-white-tech bg-[#0a0a0a] border-2 border-neutral-700 p-4 appearance-none font-tech text-sm focus:border-cb-yellow-neon outline-none transition-all duration-75">
                          <option value="">Seleccionar...</option>
                          {data.referees.map(u => <option key={u.id} value={u.id}>@{u.username}</option>)}
                        </select>
                      </div>

                      <button onClick={handleGenerateBracket} className="w-full bg-cb-yellow-neon text-cb-black-pure py-5 font-tech font-black uppercase text-sm tracking-wider border-3 border-cb-black-pure shadow-[4px_4px_0_#10B961] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75">
                        Generar Llave Automática
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-tech font-black uppercase tracking-wider text-cb-white-tech">Robot Participantes</h3>
                      <span className="bg-cb-yellow-neon/10 text-cb-yellow-neon text-[10px] font-tech font-black px-3 py-1 border border-cb-yellow-neon/30">
                        {selectedRobots.length} Seleccionados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                            className={`p-4 border-2 transition-all duration-75 cursor-pointer flex justify-between items-center ${selectedRobots.includes(robot.id) ? 'bg-cb-green-vibrant/10 border-cb-green-vibrant/40' : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'
                              }`}
                          >
                            <div>
                              <p className="font-tech font-black text-xs text-cb-white-tech uppercase">{robot.name}</p>
                              <p className="text-[10px] font-tech font-bold text-neutral-500">{robot.Institution?.name}</p>
                            </div>
                            {selectedRobots.includes(robot.id) && <div className="w-3 h-3 bg-cb-green-vibrant" />}
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] w-full max-w-2xl shadow-[8px_8px_0_#000] overflow-hidden border-3 border-cb-yellow-neon">
              <div className="h-2 bg-warning-tape" />
              <div className="p-8 border-b-2 border-neutral-800 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-tech font-black text-cb-yellow-neon uppercase tracking-wider">{activeTab === 'institutions' ? (isEditMode ? 'Editar' : 'Nueva') : (isEditMode ? 'Editar' : 'Nuevo')} {activeTab === 'institutions' ? 'institución' : getTabLabel(activeTab).slice(0, -1)}</h2>
                  <p className="text-[10px] font-tech font-bold text-neutral-500 uppercase tracking-widest mt-1">Completa los datos del registro</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 border-2 border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:border-red-500 transition-all duration-75">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                {activeTab === 'institutions' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre de la Institución</label>
                      <input required value={formData.name || ''} placeholder="ej. Universidad Nacional" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 text-sm font-bold" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Email de Contacto</label>
                        <input type="email" value={formData.contactEmail || ''} placeholder="ej. contacto@uni.edu" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 text-sm font-bold" onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Estado de Pago ($10)</label>
                        <div onClick={() => setFormData({ ...formData, isPaid: !formData.isPaid })} className={`w-full p-4 border-2 cursor-pointer transition-all duration-75 flex items-center justify-between ${formData.isPaid ? 'bg-cb-green-vibrant/10 border-cb-green-vibrant/40 text-cb-green-vibrant' : 'bg-[#0a0a0a] border-neutral-700 text-neutral-500'}`}>
                          <span className="text-xs font-tech font-black uppercase">{formData.isPaid ? 'Pagado' : 'Pendiente'}</span>
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
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre del Robot</label>
                        <input required value={formData.name || ''} placeholder="ej. Destroyer 3000" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nivel de Competencia</label>
                        <select required value={formData.level || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 appearance-none text-sm" onChange={e => setFormData({ ...formData, level: e.target.value, category: '' })}>
                          <option value="">Seleccionar...</option>
                          {COMPETITION_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Categoría</label>
                        <select required disabled={!formData.level} value={formData.category || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 appearance-none text-sm" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {formData.level && CATEGORIES_BY_LEVEL[formData.level].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Institución</label>
                        <select required value={formData.institutionId || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 appearance-none text-sm" onChange={e => setFormData({ ...formData, institutionId: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {data.institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-[#0a0a0a] border-2 border-neutral-700">
                      <input type="checkbox" id="homologated" checked={formData.isHomologated || false} onChange={e => setFormData({ ...formData, isHomologated: e.target.checked })} className="w-5 h-5 accent-[#10B961]" />
                      <label htmlFor="homologated" className="text-[10px] font-tech font-black uppercase text-neutral-400 cursor-pointer tracking-widest">Robot Homologado (Pasó revisión técnica)</label>
                    </div>
                  </div>
                )}

                {activeTab === 'referees' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre de Usuario</label>
                      <input required value={formData.username || ''} placeholder="Login de operador" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Clave Secreta {isEditMode && '(Dejar en blanco para mantener actual)'}</label>
                      <input required={!isEditMode} type="password" placeholder="Credenciales de acceso" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  </div>
                )}

                {activeTab === 'matches' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Robot A (Rojo)</label>
                        <select required value={formData.robotAId || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 appearance-none text-xs" onChange={e => setFormData({ ...formData, robotAId: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {data.robots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Robot B (Azul)</label>
                        <select required value={formData.robotBId || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 appearance-none text-xs" onChange={e => setFormData({ ...formData, robotBId: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {data.robots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Categoría / Grupo</label>
                        <input required value={formData.category || ''} placeholder="ej. Grupo A / Juvenil" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 text-sm" onChange={e => setFormData({ ...formData, category: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Ronda del Torneo</label>
                        <select required value={formData.round || 'QUARTERS'} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 appearance-none text-sm" onChange={e => setFormData({ ...formData, round: e.target.value })}>
                          <option value="QUARTERS">Cuartos de Final</option>
                          <option value="SEMIS">Semifinal</option>
                          <option value="FINAL">Gran Final</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Árbitro Asignado</label>
                      <select required value={formData.refereeId || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 appearance-none text-sm" onChange={e => setFormData({ ...formData, refereeId: e.target.value })}>
                        <option value="">Seleccionar...</option>
                        {data.referees.map(u => <option key={u.id} value={u.id}>@{u.username}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'sponsors' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre del Sponsor</label>
                      <input required value={formData.name || ''} placeholder="Nombre oficial" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Logo URL</label>
                      <input value={formData.logoUrl || ''} placeholder="https://..." className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Sitio Web</label>
                        <input value={formData.website || ''} placeholder="www.sponsor.com" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, website: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nivel (Tier)</label>
                        <select required value={formData.tier || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600 appearance-none" onChange={e => setFormData({ ...formData, tier: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          <option value="GOLD">GOLD</option>
                          <option value="SILVER">SILVER</option>
                          <option value="BRONZE">BRONZE</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-cb-yellow-neon text-cb-black-pure font-tech font-black py-5 border-3 border-cb-black-pure shadow-[4px_4px_0_#10B961] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75 mt-6 text-sm uppercase tracking-widest">{isEditMode ? 'Guardar Cambios' : 'Desplegar Cambios'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
