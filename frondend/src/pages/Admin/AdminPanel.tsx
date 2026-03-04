import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Share2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api, UPLOADS_URL } from '../../config/api';
import DataTable from '../../components/DataTable';
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
          <button onClick={() => window.open('/keys', '_blank')} className="flex items-center gap-4 px-5 py-3.5 text-neutral-400 font-tech font-black hover:bg-white/5 hover:text-cb-yellow-neon transition-all duration-75 text-sm uppercase tracking-wider border-2 border-transparent hover:border-cb-yellow-neon/30">
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
            {activeTab !== 'brackets' && (
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

        {/* ========= TABLE VIEWS ========= */}
        <div className="bg-[#111] border-3 border-neutral-800 shadow-[4px_4px_0_#000] overflow-hidden">

          {/* INSTITUTIONS TABLE */}
          {activeTab === 'institutions' && (
            <DataTable
              data={data.institutions.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))}
              keyField="id"
              columns={[
                { key: 'name', header: 'Institución', render: (i) => (
                  <span className="font-tech font-black uppercase tracking-wider">{i.name}</span>
                )},
                { key: 'contactEmail', header: 'Email', render: (i) => (
                  <span className="text-neutral-400 text-xs">{i.contactEmail || '---'}</span>
                )},
                { key: 'isPaid', header: 'Estado', render: (i) => i.isPaid
                  ? <span className="bg-cb-green-vibrant/20 text-cb-green-vibrant text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-cb-green-vibrant/40">PAGADO</span>
                  : <span className="bg-red-500/20 text-red-400 text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-red-500/40">PENDIENTE</span>
                },
              ]}
              actions={(inst) => (
                <>
                  <button onClick={() => handleEdit(inst)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(inst.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-red-500"><Trash2 size={15} /></button>
                </>
              )}
              expandedContent={(inst) => (
                <div className="space-y-3">
                  <p className="text-[10px] font-tech font-black uppercase tracking-widest text-cb-green-vibrant">Miembros del Equipo</p>
                  <div className="flex flex-wrap gap-2">
                    {inst.members?.length > 0 ? inst.members.map((m: string, i: number) => (
                      <span key={i} className="text-xs font-tech font-bold text-cb-white-tech px-3 py-1.5 bg-black/50 border border-neutral-700">{m}</span>
                    )) : <span className="text-xs text-neutral-500 font-tech">Sin miembros registrados</span>}
                  </div>
                </div>
              )}
              emptyMessage="Sin instituciones registradas"
            />
          )}

          {/* ROBOTS TABLE */}
          {activeTab === 'robots' && (
            <DataTable
              data={data.robots.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))}
              keyField="id"
              columns={[
                { key: 'name', header: 'Robot', render: (r) => (
                  <div className="flex items-center gap-2">
                    <span className="font-tech font-black uppercase tracking-wider">{r.name}</span>
                    {r.isHomologated && <span className="bg-cb-green-vibrant/20 text-cb-green-vibrant text-[9px] font-tech font-black uppercase px-1.5 py-0.5 border border-cb-green-vibrant/40">OK</span>}
                  </div>
                )},
                { key: 'level', header: 'Nivel', render: (r) => (
                  <span className="text-[10px] font-tech font-bold text-cb-yellow-neon px-2 py-0.5 bg-cb-yellow-neon/10 border border-cb-yellow-neon/30">{r.level}</span>
                )},
                { key: 'category', header: 'Categoría', render: (r) => (
                  <span className="text-xs text-neutral-400 font-tech font-bold">{r.category}</span>
                )},
                { key: 'institution', header: 'Institución', render: (r) => (
                  <span className="text-xs text-neutral-500 font-tech font-bold">{r.Institution?.name || '---'}</span>
                )},
              ]}
              actions={(robot) => (
                <>
                  <button onClick={() => handleEdit(robot)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(robot.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-red-500"><Trash2 size={15} /></button>
                </>
              )}
              emptyMessage="Sin robots registrados"
            />
          )}

          {/* REFEREES TABLE */}
          {activeTab === 'referees' && (
            <DataTable
              data={data.referees.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))}
              keyField="id"
              columns={[
                { key: 'username', header: 'Usuario', render: (u) => (
                  <span className="font-tech font-black uppercase tracking-wider">@{u.username}</span>
                )},
                { key: 'role', header: 'Rol', render: (u) => (
                  <span className="text-[10px] font-tech font-bold text-cb-yellow-neon px-2 py-0.5 bg-cb-yellow-neon/10 border border-cb-yellow-neon/30">{u.role}</span>
                )},
              ]}
              actions={(u) => (
                <>
                  <button onClick={() => handleEdit(u)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(u.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-red-500"><Trash2 size={15} /></button>
                </>
              )}
              emptyMessage="Sin árbitros registrados"
            />
          )}

          {/* MATCHES TABLE */}
          {activeTab === 'matches' && (
            <DataTable
              data={data.matches.filter(m => m.robotA?.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.robotB?.name.toLowerCase().includes(searchQuery.toLowerCase()))}
              keyField="id"
              columns={[
                { key: 'category', header: 'Categoría', render: (m) => (
                  <div>
                    <span className="font-tech font-black text-cb-yellow-neon uppercase text-xs">{m.category}</span>
                    <p className="text-[10px] font-tech text-neutral-500 uppercase">{m.round}</p>
                  </div>
                )},
                { key: 'robotA', header: 'Robot A', render: (m) => (
                  <div>
                    <span className="font-tech font-black uppercase text-xs">{m.robotA?.name || '---'}</span>
                    <p className="text-[10px] text-neutral-500 font-tech">{m.robotA?.Institution?.name}</p>
                  </div>
                )},
                { key: 'score', header: 'Score', render: (m) => (
                  <span className="bg-cb-black-pure px-3 py-1 border-2 border-cb-yellow-neon font-tech font-black text-sm text-cb-yellow-neon">{m.scoreA} - {m.scoreB}</span>
                ), className: 'text-center'},
                { key: 'robotB', header: 'Robot B', render: (m) => (
                  <div>
                    <span className="font-tech font-black uppercase text-xs">{m.robotB?.name || '---'}</span>
                    <p className="text-[10px] text-neutral-500 font-tech">{m.robotB?.Institution?.name}</p>
                  </div>
                )},
                { key: 'referee', header: 'Árbitro', render: (m) => (
                  <span className="text-xs text-neutral-400 font-tech font-bold">@{m.referee?.username || '---'}</span>
                )},
              ]}
              actions={(m) => (
                <>
                  <button
                    onClick={() => handleToggleDashboard(m)}
                    className={`transition-all duration-75 p-2 border ${m.showInDashboard ? 'bg-cb-green-vibrant text-cb-black-pure border-cb-green-vibrant' : 'text-neutral-600 border-neutral-700 hover:border-cb-green-vibrant hover:text-cb-green-vibrant'}`}
                    title="Mostrar en Dashboard"
                  >
                    <LayoutDashboard size={15} />
                  </button>
                  <button onClick={() => handleEdit(m)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(m.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-red-500"><Trash2 size={15} /></button>
                </>
              )}
              emptyMessage="Sin encuentros registrados"
            />
          )}

          {/* SPONSORS TABLE */}
          {activeTab === 'sponsors' && (
            <DataTable
              data={data.sponsors.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))}
              keyField="id"
              columns={[
                { key: 'name', header: 'Sponsor', render: (s) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center p-2 border border-neutral-700 flex-shrink-0">
                      {s.logoUrl ? <img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain" /> : <Star size={18} className="text-neutral-600" />}
                    </div>
                    <span className="font-tech font-black uppercase tracking-wider">{s.name}</span>
                  </div>
                )},
                { key: 'tier', header: 'Nivel', render: (s) => (
                  <span className="text-[10px] font-tech font-bold text-cb-yellow-neon px-2 py-0.5 bg-cb-yellow-neon/10 border border-cb-yellow-neon/30">{s.tier}</span>
                )},
                { key: 'website', header: 'Sitio Web', render: (s) => (
                  <span className="text-xs text-neutral-500 font-tech font-bold">{s.website || '---'}</span>
                )},
              ]}
              actions={(sponsor) => (
                <>
                  <button onClick={() => handleEdit(sponsor)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(sponsor.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-red-500"><Trash2 size={15} /></button>
                </>
              )}
              emptyMessage="Sin sponsors registrados"
            />
          )}

          {/* PAYMENTS TABLE */}
          {activeTab === 'payments' && (
            <DataTable
              data={data.registrations.filter(r => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                  r.google_email?.toLowerCase().includes(q) ||
                  r.data?.category?.toLowerCase().includes(q) ||
                  r.data?.robotName?.toLowerCase().includes(q) ||
                  r.data?.teamName?.toLowerCase().includes(q) ||
                  r.data?.advisorName?.toLowerCase().includes(q) ||
                  r.data?.institution?.toLowerCase().includes(q) ||
                  r.data?.level?.toLowerCase().includes(q)
                );
              })}
              keyField="id"
              columns={[
                { key: 'google_email', header: 'Email', render: (r) => (
                  <span className="font-tech font-black text-xs uppercase break-all">{r.google_email}</span>
                )},
                { key: 'category', header: 'Categoría', render: (r) => (
                  <span className="text-xs text-neutral-400 font-tech font-bold">{r.data?.category || '---'}</span>
                )},
                { key: 'level', header: 'Nivel', render: (r) => (
                  <span className="text-[10px] font-tech font-bold text-cb-yellow-neon px-2 py-0.5 bg-cb-yellow-neon/10 border border-cb-yellow-neon/30">{r.data?.level || r.data?.institution || '---'}</span>
                )},
                { key: 'paymentStatus', header: 'Estado', render: (r) => {
                  if (r.paymentStatus === 'APPROVED') return <span className="bg-cb-green-vibrant/20 text-cb-green-vibrant text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-cb-green-vibrant/40 inline-flex items-center gap-1"><ShieldCheck size={12} /> Pagado</span>;
                  if (r.paymentStatus === 'REJECTED') return <span className="bg-red-500/20 text-red-400 text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-red-500/40">Denegado</span>;
                  return <span className="bg-cb-yellow-neon/10 text-cb-yellow-neon text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-cb-yellow-neon/30">Pendiente</span>;
                }},
                { key: 'proof', header: 'Comprobante', render: (r) => r.payment_proof_filename
                  ? <a href={`${UPLOADS_URL}/${r.payment_proof_filename}`} target="_blank" rel="noopener noreferrer" className="text-cb-green-vibrant font-tech font-bold text-xs hover:text-cb-yellow-neon transition-colors">Ver</a>
                  : <span className="text-[10px] text-red-400 font-tech font-bold">Sin archivo</span>
                },
              ]}
              expandedContent={(reg) => {
                // WhatsApp number normalization
                const formatWhatsApp = (phone: string | undefined) => {
                  if (!phone) return null;
                  const cleaned = phone.replace(/\D/g, '');
                  if (cleaned.startsWith('0')) return '593' + cleaned.slice(1);
                  if (cleaned.length === 9) return '593' + cleaned;
                  return cleaned;
                };
                const waNumber = formatWhatsApp(reg.data?.advisorPhone);

                return (
                  <div className="space-y-4">
                    {/* Participant details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-tech font-bold block uppercase">Robot/Equipo</span>
                        <span className="font-tech font-black text-cb-white-tech text-sm">{reg.data?.robotName || reg.data?.teamName || '---'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-tech font-bold block uppercase">Asesor</span>
                        <span className="font-tech font-black text-cb-white-tech text-sm">{reg.data?.advisorName || '---'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-tech font-bold block uppercase">Tel. Asesor</span>
                        <div className="flex items-center gap-2">
                          <span className="font-tech font-black text-cb-white-tech text-sm">{reg.data?.advisorPhone || '---'}</span>
                          {waNumber && (
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#25D366]/15 text-[#25D366] text-[10px] font-tech font-black uppercase border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-all duration-75"
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.634-1.215A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.09 0-4.037-.656-5.64-1.773l-.404-.264-2.75.721.735-2.686-.29-.423A9.72 9.72 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-tech font-bold block uppercase">Institución</span>
                        <span className="font-tech font-black text-cb-white-tech text-sm">{reg.data?.institution || '---'}</span>
                      </div>
                    </div>

                    {/* Members */}
                    {reg.data?.members && (
                      <div>
                        <span className="text-[10px] text-neutral-500 font-tech font-bold block uppercase mb-1">Miembros</span>
                        <span className="font-tech font-bold text-cb-white-tech text-xs">{reg.data.members}</span>
                      </div>
                    )}

                    {/* Payment Actions */}
                    <div className="flex gap-2 pt-3 border-t-2 border-neutral-800">
                      {reg.paymentStatus !== 'APPROVED' && (
                        <button onClick={() => handleUpdatePaymentStatus(reg, 'APPROVED')} className="py-2 px-4 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-cb-green-vibrant text-cb-black-pure border-2 border-cb-green-vibrant hover:translate-y-[-1px]">
                          Aprobar Pago
                        </button>
                      )}
                      {reg.paymentStatus !== 'REJECTED' && (
                        <button onClick={() => handleUpdatePaymentStatus(reg, 'REJECTED')} className="py-2 px-4 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-transparent text-red-400 border-2 border-red-500/40 hover:bg-red-500/10">
                          Rechazar
                        </button>
                      )}
                      {(reg.paymentStatus === 'APPROVED' || reg.paymentStatus === 'REJECTED') && (
                        <button onClick={() => handleUpdatePaymentStatus(reg, 'PENDING')} className="py-2 px-4 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-transparent text-neutral-500 border-2 border-neutral-700 hover:bg-white/5">
                          Restaurar a Pendiente
                        </button>
                      )}
                    </div>
                  </div>
                );
              }}
              emptyMessage="Sin registros de pago"
            />
          )}

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
