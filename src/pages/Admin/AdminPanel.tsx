import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Bot, Users, Plus, Trash2, LogOut, LayoutDashboard, ShieldCheck, X, Target, Search, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'institutions' | 'robots' | 'referees' | 'matches'>('institutions');
  const [data, setData] = useState<{ institutions: any[], robots: any[], referees: any[], matches: any[] }>({
    institutions: [],
    robots: [],
    referees: [],
    matches: []
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<any>({});
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [instRes, robotRes, userRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3001/api/institutions`),
        fetch(`http://${window.location.hostname}:3001/api/robots`),
        fetch(`http://${window.location.hostname}:3001/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const stats = [instRes, robotRes, userRes].map(r => r.ok);
      if (stats.includes(false)) throw new Error('Error al cargar algunos datos');

      setData({ 
        institutions: await instRes.json(), 
        robots: await robotRes.json(), 
        referees: await userRes.json(),
        matches: await (await fetch(`http://${window.location.hostname}:3001/api/matches`)).json()
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let endpoint = '';
    let body = {};

    if (activeTab === 'institutions') {
      endpoint = '/api/institutions';
      body = { name: formData.name, members: [formData.member1, formData.member2] };
    } else if (activeTab === 'robots') {
      endpoint = '/api/robots';
      body = { name: formData.name, weightClass: formData.weightClass, institutionId: formData.institutionId };
    } else if (activeTab === 'referees') {
      endpoint = '/api/users';
      body = { username: formData.username, password: formData.password };
    } else if (activeTab === 'matches') {
      endpoint = '/api/matches';
      body = { 
        robotAId: formData.robotAId, 
        robotBId: formData.robotBId, 
        refereeId: formData.refereeId,
        category: formData.category
      };
    }

    try {
      const url = isEditMode 
        ? `http://${window.location.hostname}:3001${endpoint}/${editId}`
        : `http://${window.location.hostname}:3001${endpoint}`;
        
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowModal(false);
        setIsEditMode(false);
        setEditId(null);
        setFormData({});
        fetchData();
      }
    } catch (error) {
      alert('Error al guardar datos');
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setIsEditMode(true);
    let initialData = { ...item };
    if (activeTab === 'institutions') {
      initialData.member1 = item.members[0];
      initialData.member2 = item.members[1];
    }
    setFormData(initialData);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro? Esto eliminará el registro permanentemente.')) return;
    
    let endpoint = '';
    if (activeTab === 'institutions') endpoint = `/api/institutions/${id}`;
    if (activeTab === 'robots') endpoint = `/api/robots/${id}`;
    if (activeTab === 'referees') endpoint = `/api/users/${id}`;

    try {
      const res = await fetch(`http://${window.location.hostname}:3001${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-4 px-6 py-4 rounded-md   font-black transition-all ${
        activeTab === id ? 'bg-brand text-white shadow-xl shadow-brand/20' : 'bg-transparent text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
      }`}
    >
      <Icon size={20} />
      <span className="text-[11px] uppercase tracking-widest">{label}</span>
    </button>
  );

  const getTabLabel = (id: string) => {
    switch(id) {
      case 'institutions': return 'Instituciones';
      case 'robots': return 'Robots';
      case 'referees': return 'Árbitros';
      case 'matches': return 'Encuentros';
      default: return id;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-black flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-80 bg-white border-r border-neutral-100 p-8 flex flex-col gap-10 shadow-sm">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="font-black tracking-tight text-xl">SISTEMA</h2>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">Centro de Gestión</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <TabButton id="institutions" icon={Building2} label="Instituciones" />
          <TabButton id="robots" icon={Bot} label="Robots" />
          <TabButton id="referees" icon={Users} label="Árbitros" />
          <TabButton id="matches" icon={Target} label="Encuentros" />
        </nav>

        <div className="flex flex-col gap-2 pt-8 border-t border-neutral-50">
          <button onClick={() => navigate('/')} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-400 font-black hover:bg-neutral-50 hover:text-black transition-all text-[11px] uppercase tracking-widest">
            <LayoutDashboard size={18} /> Vista Pública
          </button>
          <button onClick={logout} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 font-black hover:bg-red-50 transition-all text-[11px] uppercase tracking-widest">
            <LogOut size={18} /> Salir del Sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-16 overflow-y-auto">
        <header className="mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-2 block px-2">Nodo Administrativo</span>
            <h1 className="text-6xl font-black tracking-tighter uppercase text-black">{getTabLabel(activeTab)}</h1>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar ${getTabLabel(activeTab).toLowerCase()}...`}
                className="w-full bg-white border border-neutral-100 pl-12 pr-4 py-4 rounded-2xl text-xs font-bold outline-none focus:border-brand/30 transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={() => { setIsEditMode(false); setFormData({}); setShowModal(true); }}
              className="bg-black text-white hover:bg-neutral-800 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-black/10 whitespace-nowrap"
            >
              <Plus size={18} /> Nuevo {getTabLabel(activeTab).slice(0, -1).toLowerCase()}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence mode="wait">
            {activeTab === 'institutions' && data.institutions.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((inst) => (
              <motion.div key={inst.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg shadow-neutral-200/40">
                <div>
                  <h3 className="text-2xl font-black text-black">{inst.name}</h3>
                  <div className="flex gap-3 mt-3">
                    {inst.members?.map((m: string, i: number) => (
                      <span key={i} className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-4 py-1.5 bg-neutral-50 rounded-full border border-neutral-100">{m}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(inst)} className="text-neutral-300 hover:text-black hover:bg-neutral-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Edit2 size={20} /></button>
                  <button onClick={() => handleDelete(inst.id)} className="text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Trash2 size={20} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'robots' && data.robots.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((robot) => (
              <motion.div key={robot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg shadow-neutral-200/40">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-brand/5 rounded-3xl flex items-center justify-center text-brand border border-brand/10 shadow-inner"><Bot size={32} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-black">{robot.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-[10px] font-black text-brand uppercase tracking-widest px-3 py-1 bg-brand/5 rounded-lg">{robot.weightClass}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{robot.Institution?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(robot)} className="text-neutral-300 hover:text-black hover:bg-neutral-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Edit2 size={20} /></button>
                  <button onClick={() => handleDelete(robot.id)} className="text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Trash2 size={20} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'referees' && data.referees.filter(r => r.username.toLowerCase().includes(searchQuery.toLowerCase())).map((ref) => (
              <motion.div key={ref.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg shadow-neutral-200/40">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-neutral-50 rounded-3xl flex items-center justify-center text-neutral-400 border border-neutral-100"><Users size={32} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-black">@{ref.username}</h3>
                    <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-2 px-3 py-1 bg-green-50 rounded-lg inline-block border border-green-100">Operador Activo</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(ref)} className="text-neutral-300 hover:text-black hover:bg-neutral-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Edit2 size={20} /></button>
                  <button onClick={() => handleDelete(ref.id)} className="text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all p-4 bg-neutral-50 rounded-2xl border border-neutral-100"><Trash2 size={20} /></button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'matches' && data.matches.filter(m => m.robotA?.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.robotB?.name.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] flex justify-between items-center shadow-lg shadow-neutral-200/40">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-brand/5 rounded-3xl flex items-center justify-center text-brand border border-brand/10"><Target size={32} /></div>
                  <div>
                    <h3 className="text-xl font-black text-black">{m.robotA?.name} <span className="text-neutral-200 mx-2">VS</span> {m.robotB?.name}</h3>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-2 mb-1">{m.category}</p>
                    <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-tighter">ID: {m.id.slice(0, 12)}...</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CRUD Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/60 backdrop-blur-md">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="bg-white border border-neutral-100 w-full max-w-xl rounded-[3rem] p-12 relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                <button onClick={() => { setShowModal(false); setIsEditMode(false); setEditId(null); }} className="absolute top-8 right-8 text-neutral-300 hover:text-black transition-colors"><X size={32} /></button>
                <div className="mb-10">
                   <h2 className="text-4xl font-black tracking-tight mb-2">{isEditMode ? 'Modificar Registro' : 'Nuevo Registro'}</h2>
                   <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">{isEditMode ? 'Actualizar información existente' : `Añadiendo nuevo ${getTabLabel(activeTab).slice(0, -1).toLowerCase()} al sistema`}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {activeTab === 'institutions' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Nombre</label>
                        <input required value={formData.name || ''} placeholder="Nombre oficial" className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 text-black placeholder:text-neutral-300 outline-none focus:border-brand/30 transition-all font-medium" onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Miembro 1</label>
                           <input required value={formData.member1 || ''} placeholder="Nombre completo" className="bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 text-sm" onChange={e => setFormData({...formData, member1: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Miembro 2</label>
                           <input required value={formData.member2 || ''} placeholder="Nombre completo" className="bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 text-sm" onChange={e => setFormData({...formData, member2: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'robots' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Nombre del Robot</label>
                        <input required value={formData.name || ''} placeholder="Identificador de combate" className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5" onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Categoría de peso</label>
                          <select required value={formData.weightClass || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 appearance-none text-sm" onChange={e => setFormData({...formData, weightClass: e.target.value})}>
                            <option value="">Seleccionar...</option>
                            <option value="Heavyweight">Heavyweight</option>
                            <option value="Lightweight">Lightweight</option>
                            <option value="Mini-Sumo">Mini-Sumo</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Institución</label>
                          <select required value={formData.institutionId || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 appearance-none text-sm" onChange={e => setFormData({...formData, institutionId: e.target.value})}>
                            <option value="">Seleccionar...</option>
                            {data.institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'referees' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Nombre de Usuario</label>
                        <input required value={formData.username || ''} placeholder="Login de operador" className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5" onChange={e => setFormData({...formData, username: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Clave Secreta {isEditMode && '(Dejar en blanco para mantener actual)'}</label>
                        <input required={!isEditMode} type="password" placeholder="Credenciales de acceso" className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5" onChange={e => setFormData({...formData, password: e.target.value})} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'matches' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Robot A (Rojo)</label>
                          <select required value={formData.robotAId || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 appearance-none text-xs" onChange={e => setFormData({...formData, robotAId: e.target.value})}>
                            <option value="">Seleccionar...</option>
                            {data.robots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Robot B (Azul)</label>
                          <select required value={formData.robotBId || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 appearance-none text-xs" onChange={e => setFormData({...formData, robotBId: e.target.value})}>
                            <option value="">Seleccionar...</option>
                            {data.robots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Categoría</label>
                          <input required value={formData.category || ''} placeholder="ej. Cuartos de Final" className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 text-sm" onChange={e => setFormData({...formData, category: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-neutral-400 px-2">Árbitro Asignado</label>
                          <select required value={formData.refereeId || ''} className="w-full bg-neutral-50 border border-neutral-100 rounded-2.5xl p-5 appearance-none text-sm" onChange={e => setFormData({...formData, refereeId: e.target.value})}>
                            <option value="">Seleccionar...</option>
                            {data.referees.map(u => <option key={u.id} value={u.id}>@{u.username}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full bg-brand text-white font-black py-6 rounded-2.5xl shadow-xl shadow-brand/20 hover:shadow-brand/40 transition-all mt-4 text-xs uppercase tracking-[0.2em]">{isEditMode ? 'Guardar Cambios' : 'Desplegar Cambios'}</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminPanel;
