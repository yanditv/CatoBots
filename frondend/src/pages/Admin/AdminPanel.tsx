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
  Share2,
  Download,
  Layers,
  GraduationCap,
  Settings,
  Upload,
  FileSearch,
  History,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api, UPLOADS_URL } from '../../config/api';
import DataTable from '../../components/DataTable';
import { ConfirmModal } from '../../components/ConfirmModal';
import CategoryDashboard from './CategoryDashboard';
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

// These are now derived dynamically from fetched categories

// Event Config Panel Component
const EventConfigPanel = ({ token }: { token: string | null }) => {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const authHeader = { 'Authorization': `Bearer ${token}` };
    api.get('/api/event-config', { headers: authHeader }).then(r => r.json()).then(d => setConfig(d));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const authHeader = { 'Authorization': `Bearer ${token}` };
      const res = await api.put('/api/event-config', config, { headers: authHeader });
      setConfig(await res.json());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const update = (key: string, value: string) => setConfig(prev => ({ ...prev, [key]: value }));

  const toggleRegistration = async () => {
    const newValue = config.registrationEnabled === 'false' ? 'true' : 'false';
    const updated = { ...config, registrationEnabled: newValue };
    setConfig(updated);
    try {
      const authHeader = { 'Authorization': `Bearer ${token}` };
      await api.put('/api/event-config', { registrationEnabled: newValue }, { headers: authHeader });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
  };

  const handleUpload = async (file: File, configKey: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('configKey', configKey);
    try {
      const res = await fetch('/api/event-assets/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        update(configKey, data.url);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) { console.error('Upload error:', err); }
  };

  const inputCls = "w-full bg-[#0a0a0a] border-2 border-neutral-700 p-3 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600";
  const labelCls = "text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest";

  return (
    <div className="bg-neutral-900 border-2 border-neutral-700 p-6 md:p-8 space-y-2">
      {/* ⚡ Información del Evento */}
      <div className="border-b-2 border-neutral-700 pb-2 mb-4"><h3 className="text-xs font-tech font-black uppercase text-cb-yellow-neon tracking-widest">⚡ Información del Evento</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1"><label className={labelCls}>Nombre del Evento</label><input value={config.eventName || ''} onChange={e => update('eventName', e.target.value)} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Fecha del Evento</label><input value={config.eventDate || ''} onChange={e => update('eventDate', e.target.value)} className={inputCls} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="space-y-1"><label className={labelCls}>Dirección / Lugar</label><input value={config.eventVenue || ''} onChange={e => update('eventVenue', e.target.value)} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>URL Google Maps</label><input value={config.eventMapsUrl || ''} onChange={e => update('eventMapsUrl', e.target.value)} className={inputCls} /></div>
      </div>

      {/* 📞 Contactos */}
      <div className="border-b-2 border-neutral-700 pb-2 mb-4 mt-6"><h3 className="text-xs font-tech font-black uppercase text-cb-yellow-neon tracking-widest">📞 Contactos</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1"><label className={labelCls}>Teléfono de Contacto</label><input value={config.contactPhone || ''} onChange={e => update('contactPhone', e.target.value)} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Correo de Contacto</label><input type="email" value={config.contactEmail || ''} onChange={e => update('contactEmail', e.target.value)} className={inputCls} /></div>
      </div>

      {/* 💳 Información de Pago */}
      <div className="border-b-2 border-neutral-700 pb-2 mb-4 mt-6"><h3 className="text-xs font-tech font-black uppercase text-cb-yellow-neon tracking-widest">💳 Información de Pago</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1"><label className={labelCls}>Costo de Inscripción ($)</label><input type="number" value={config.registrationCost || ''} onChange={e => update('registrationCost', e.target.value)} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Entidad Financiera</label><input value={config.bankName || ''} onChange={e => update('bankName', e.target.value)} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Tipo de Cuenta</label><input value={config.accountType || ''} onChange={e => update('accountType', e.target.value)} className={inputCls} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <div className="space-y-1"><label className={labelCls}>Número de Cuenta</label><input value={config.accountNumber || ''} onChange={e => update('accountNumber', e.target.value)} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Beneficiario</label><input value={config.accountHolder || ''} onChange={e => update('accountHolder', e.target.value)} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Cédula del Beneficiario</label><input value={config.accountHolderId || ''} onChange={e => update('accountHolderId', e.target.value)} className={inputCls} /></div>
      </div>

      {/* 🔒 Control de Inscripciones */}
      <div className="border-b-2 border-neutral-700 pb-2 mb-4 mt-6"><h3 className="text-xs font-tech font-black uppercase text-cb-yellow-neon tracking-widest">🔒 Control de Inscripciones</h3></div>
      <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border-2 border-neutral-700">
        <div>
          <p className="text-xs font-tech font-black uppercase text-cb-white-tech tracking-wider">Inscripciones Públicas</p>
          <p className="text-[10px] font-tech text-neutral-500 mt-0.5">Habilita o deshabilita el formulario en /registro</p>
        </div>
        <button
          type="button"
          onClick={toggleRegistration}
          className={`px-6 py-2 border-2 font-tech font-black text-xs uppercase tracking-wider transition-all duration-75 ${config.registrationEnabled === 'false' ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:border-red-400' : 'bg-cb-green-vibrant/10 border-cb-green-vibrant/40 text-cb-green-vibrant hover:border-cb-green-vibrant'}`}
        >
          {config.registrationEnabled === 'false' ? 'CERRADAS' : 'ABIERTAS'}
        </button>
      </div>

      {/* 📋 Indicaciones Generales */}
      <div className="border-b-2 border-neutral-700 pb-2 mb-4 mt-6"><h3 className="text-xs font-tech font-black uppercase text-cb-yellow-neon tracking-widest">📋 Indicaciones Generales</h3></div>
      <div className="space-y-1">
        <label className={labelCls}>Indicaciones Generales</label>
        <textarea value={config.generalInstructions || ''} onChange={e => update('generalInstructions', e.target.value)} rows={8} className={`${inputCls} resize-y`} />
      </div>

      {/* 🖼️ Imágenes y Branding */}
      <div className="border-b-2 border-neutral-700 pb-2 mb-4 mt-6"><h3 className="text-xs font-tech font-black uppercase text-cb-yellow-neon tracking-widest">🖼️ Imágenes y Branding</h3></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo */}
        <div className="space-y-2">
          <label className={labelCls}>Logo del Evento</label>
          <div className="flex items-center gap-4">
            {config.logoUrl && <div className="w-20 h-20 bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden shrink-0"><img src={config.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" /></div>}
            <div className="flex-1">
              <input value={config.logoUrl || ''} onChange={e => update('logoUrl', e.target.value)} className={`${inputCls} mb-2`} placeholder="URL o subir archivo..." />
              <label className="inline-flex items-center gap-2 bg-neutral-800 border-2 border-neutral-600 hover:border-cb-yellow-neon px-4 py-2 cursor-pointer transition-all text-xs font-tech font-bold text-neutral-400 hover:text-cb-yellow-neon uppercase tracking-wider">
                <Upload size={14} /> Subir Archivo
                <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'logoUrl'); }} />
              </label>
            </div>
          </div>
        </div>
        {/* Captura Cuenta Bancaria */}
        <div className="space-y-2">
          <label className={labelCls}>Captura de la Cuenta Bancaria</label>
          <div className="flex items-center gap-4">
            {config.paymentImageUrl && <div className="w-20 h-20 bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden shrink-0"><img src={config.paymentImageUrl} alt="Pago" className="max-w-full max-h-full object-contain" /></div>}
            <div className="flex-1">
              <input value={config.paymentImageUrl || ''} onChange={e => update('paymentImageUrl', e.target.value)} className={`${inputCls} mb-2`} placeholder="URL o subir archivo..." />
              <label className="inline-flex items-center gap-2 bg-neutral-800 border-2 border-neutral-600 hover:border-cb-yellow-neon px-4 py-2 cursor-pointer transition-all text-xs font-tech font-bold text-neutral-400 hover:text-cb-yellow-neon uppercase tracking-wider">
                <Upload size={14} /> Subir Archivo
                <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0], 'paymentImageUrl'); }} />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="space-y-1"><label className={labelCls}>Enlace Reglamento General</label><input value={config.rulesGeneralUrl || ''} onChange={e => update('rulesGeneralUrl', e.target.value)} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Máx. Robots por Categoría</label><input type="number" value={config.maxRobotsPerCategory || ''} onChange={e => update('maxRobotsPerCategory', e.target.value)} className={inputCls} /></div>
      </div>

      <div className="pt-6 border-t-2 border-neutral-700 mt-6 flex items-center gap-4">
        <button onClick={handleSave} disabled={saving} className="bg-cb-yellow-neon text-cb-black-pure font-tech font-black py-4 px-8 border-3 border-cb-black-pure shadow-[4px_4px_0_#10B961] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75 text-sm uppercase tracking-widest disabled:opacity-50">
          {saving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
        </button>
        {saved && <span className="text-cb-green-vibrant font-tech font-black text-sm uppercase animate-pulse">✓ GUARDADO</span>}
      </div>
    </div>
  );
};
const normalize = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const generateSmartAbbreviation = (name: string): string => {
  const clean = name.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, '');
  if (!clean) return '';
  if (clean.length <= 4) return clean;
  const words = clean.split(' ').filter((w: string) => w.length > 0);
  if (words.length > 1) {
    let abbr = words.map((w: string) => w[0]).join('');
    if (abbr.length < 3) {
      const lastWord = words[words.length - 1];
      const consonants = lastWord.slice(1).replace(/[AEIOU]/g, '');
      abbr += consonants.substring(0, 4 - abbr.length);
    }
    return abbr.substring(0, 5);
  }
  const word = words[0];
  const first = word[0];
  const last = word[word.length - 1];
  const middle = word.slice(1, -1);
  const distinctConsonants = Array.from(new Set(middle.replace(/[AEIOU]/g, '').split(''))).join('');
  if (distinctConsonants.length >= 2) return (first + distinctConsonants.substring(0, 2) + last).substring(0, 4);
  const distinctChars = Array.from(new Set(middle.split(''))).join('');
  return (first + distinctChars.substring(0, 2) + last).substring(0, 4);
};

interface PaymentFormProps {
  formData: any;
  setFormData: (updater: any) => void;
  levelsData: any[];
  categoriesData: any[];
  isEditMode: boolean;
  handlePaymentProofUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentRegistrationForm = ({ formData, setFormData, levelsData, categoriesData, isEditMode, handlePaymentProofUpload }: PaymentFormProps) => {
  const [isEditingAbbreviation, setIsEditingAbbreviation] = useState(false);

  const selectedLevel = formData.data?.category || '';
  const subCatKey = selectedLevel === 'Junior' ? 'juniorCategory' : selectedLevel === 'Senior' ? 'seniorCategory' : 'masterCategory';
  const selectedSubCat = formData.data?.[subCatKey] || '';
  const isScratch = selectedSubCat.includes('Scratch');
  const isBioBot = selectedSubCat.includes('BioBot');
  const isRobotica = !isScratch && !isBioBot; // true por defecto si no hay subcategoría o no es Scratch/BioBot
  const filteredCategories = categoriesData.filter((c: any) => c.levels?.includes(selectedLevel));

  const updateData = (patch: any) => setFormData((prev: any) => ({ ...prev, data: { ...prev.data, ...patch } }));

  // Auto-generate abbreviation exactly like Step4_Details
  useEffect(() => {
    if (!isEditingAbbreviation && isRobotica && formData.data?.robotName) {
      const abbr = generateSmartAbbreviation(formData.data.robotName);
      if (formData.data?.robotAbbreviation !== abbr) {
        updateData({ robotAbbreviation: abbr });
      }
    }
  }, [formData.data?.robotName, isEditingAbbreviation, isRobotica]);

  // Reset abbreviation edit mode when category changes
  useEffect(() => {
    setIsEditingAbbreviation(false);
  }, [selectedSubCat]);

  // Members helpers
  const rawMembers = formData.data?.members || '';
  const membersList: string[] = rawMembers ? rawMembers.split(',').map((m: string) => m.trimStart()) : [''];
  const members = membersList.length > 0 ? membersList : [''];
  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    updateData({ members: updated.join(', ') });
  };
  const addMember = () => updateData({ members: [...members, ''].join(', ') });
  const removeMember = (index: number) => {
    const updated = members.filter((_: string, i: number) => i !== index);
    updateData({ members: updated.join(', ') });
  };

  return (
    <div className="space-y-6">
      {/* Email + Estado de Pago */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Email (Google)</label>
          <input required value={formData.google_email || ''} placeholder="correo@ejemplo.com" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75" onChange={e => setFormData((prev: any) => ({ ...prev, google_email: e.target.value, data: { ...prev.data, email: e.target.value } }))} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Estado de Pago</label>
          <select required value={formData.paymentStatus || 'PENDING'} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 appearance-none" onChange={e => setFormData((prev: any) => ({ ...prev, paymentStatus: e.target.value }))}>
            <option value="PENDING">Pendiente</option>
            <option value="APPROVED">Aprobado</option>
            {isEditMode && <option value="REJECTED">Rechazado</option>}
          </select>
        </div>
      </div>

      {/* Institución */}
      <div className="space-y-2">
        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Institución</label>
        <input required value={formData.data?.institution || ''} placeholder="Nombre de la institución" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75" onChange={e => updateData({ institution: e.target.value.toUpperCase() })} />
      </div>

      {/* Nivel + Categoría */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nivel</label>
          <select required value={selectedLevel} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 appearance-none" onChange={e => updateData({ category: e.target.value, juniorCategory: '', seniorCategory: '', masterCategory: '', robotName: '', teamName: '', robotAbbreviation: '' })}>
            <option value="">Seleccionar nivel...</option>
            {levelsData.map((l: any) => <option key={l.name} value={l.name}>{l.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Categoría / Modalidad</label>
          <select required value={selectedSubCat} disabled={!selectedLevel} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 appearance-none disabled:opacity-40" onChange={e => updateData({ [subCatKey]: e.target.value, robotName: '', teamName: '', robotAbbreviation: '' })}>
            <option value="">Seleccionar categoría...</option>
            {filteredCategories.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Robot / Equipo */}
      {(
        <div className="grid grid-cols-2 gap-4">
          {isRobotica ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre del Robot</label>
                <input required value={formData.data?.robotName || ''} placeholder="Ej. TERMINATOR" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75" onChange={e => updateData({ robotName: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">
                    <span className="bg-neutral-800 text-cb-yellow-neon px-1.5 py-0.5 border border-cb-yellow-neon/40 mr-1">ABR</span>
                    Scoreboard
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <div
                      className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${isEditingAbbreviation ? 'bg-cb-yellow-neon border-cb-yellow-neon' : 'bg-transparent border-neutral-600'}`}
                      onClick={() => setIsEditingAbbreviation(v => !v)}
                    >
                      {isEditingAbbreviation && <span className="text-black text-[10px] font-black leading-none">✓</span>}
                    </div>
                    <span className="text-[10px] font-tech font-black uppercase text-neutral-500">Manual</span>
                  </label>
                </div>
                <input
                  value={formData.data?.robotAbbreviation || ''}
                  maxLength={5}
                  disabled={!isEditingAbbreviation}
                  placeholder="TRMN"
                  className={`w-full border-2 p-4 text-sm font-tech outline-none transition-all duration-75 uppercase tracking-widest text-center font-black ${isEditingAbbreviation ? 'bg-[#0a0a0a] border-neutral-700 text-cb-yellow-neon focus:border-cb-yellow-neon' : 'bg-neutral-900 border-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                  onChange={e => updateData({ robotAbbreviation: e.target.value.toUpperCase() })}
                />
                {!isEditingAbbreviation && formData.data?.robotAbbreviation && (
                  <p className="text-[10px] font-tech font-bold text-neutral-500 uppercase">⚡ Cálculo automático activo</p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre del Equipo</label>
              <input required value={formData.data?.teamName || ''} placeholder="Ej. COMANDOS CIBERNÉTICOS" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75" onChange={e => updateData({ teamName: e.target.value.toUpperCase() })} />
            </div>
          )}
        </div>
      )}

      {/* Integrantes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Integrantes</label>
          <button type="button" onClick={addMember} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border-2 border-neutral-700 text-cb-yellow-neon text-[10px] font-tech font-black uppercase tracking-widest hover:border-cb-yellow-neon transition-all duration-75">
            <Plus size={12} /> Agregar
          </button>
        </div>
        {members.map((member: string, index: number) => (
          <div key={index} className="flex gap-2 items-center">
            <span className="text-[10px] font-tech font-black text-neutral-600 w-5 text-right shrink-0">{index + 1}</span>
            <input
              required={index === 0}
              value={member}
              placeholder={`Nombre del integrante ${index + 1}`}
              className="flex-1 bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75"
              onChange={e => updateMember(index, e.target.value)}
            />
            {members.length > 1 && (
              <button type="button" onClick={() => removeMember(index)} className="w-10 h-10 flex items-center justify-center border-2 border-neutral-700 text-neutral-500 hover:text-red-400 hover:border-red-500 transition-all duration-75 shrink-0">
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Asesor */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre del Asesor / Docente</label>
          <input required value={formData.data?.advisorName || ''} placeholder="Nombre completo" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75" onChange={e => updateData({ advisorName: e.target.value.toUpperCase() })} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Teléfono Asesor (WhatsApp)</label>
          <input required value={formData.data?.advisorPhone || ''} placeholder="09XXXXXXXX" maxLength={10} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75" onChange={e => updateData({ advisorPhone: e.target.value.replace(/\D/g, '') })} />
        </div>
      </div>

      {/* Comprobante */}
      <div className="space-y-2">
        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Comprobante (Archivo / URL)</label>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input value={formData.payment_proof_filename || ''} placeholder="URL o subir archivo..." className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75" onChange={e => setFormData((prev: any) => ({ ...prev, payment_proof_filename: e.target.value }))} />
          </div>
          <div className="relative w-48 shrink-0">
            <input type="file" accept="image/*,application/pdf" onChange={handlePaymentProofUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="bg-[#1a1a1a] border-2 border-neutral-700 p-4 flex items-center justify-center text-cb-yellow-neon hover:border-cb-yellow-neon transition-all duration-75 cursor-pointer text-center">
              <span className="text-[10px] font-tech font-black uppercase tracking-widest">Subir Archivo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'institutions' | 'robots' | 'referees' | 'matches' | 'sponsors' | 'brackets' | 'payments' | 'categories' | 'levels' | 'evento'>('institutions');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRobots, setSelectedRobots] = useState<string[]>([]);
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(new Set());
  const [categoryDetailCat, setCategoryDetailCat] = useState<any | null>(null);
  const [showRobotDashboard, setShowRobotDashboard] = useState(false);
  const [robotFilterLevel, setRobotFilterLevel] = useState('ALL');
  const [robotFilterHomologated, setRobotFilterHomologated] = useState('ALL');
  const [data, setData] = useState<{
    institutions: Institution[],
    robots: Robot[],
    referees: User[],
    matches: Match[],
    sponsors: Sponsor[],
    registrations: Registration[],
    categories: any[],
    levels: any[]
  }>({
    institutions: [],
    robots: [],
    referees: [],
    matches: [],
    sponsors: [],
    registrations: [],
    categories: [],
    levels: []
  });

  const [selectedMatchLogs, setSelectedMatchLogs] = useState<any[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [auditedMatch, setAuditedMatch] = useState<Match | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'warning' | 'info' | 'danger';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'info' | 'danger' = 'warning') => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, type });
  };

  const fetchData = async () => {
    try {
      const authHeader = { 'Authorization': `Bearer ${token}` };
      const [inst, robots, users, matches, sponsors, regs, cats, lvls] = await Promise.all([
        api.get('/api/institutions', { headers: authHeader }).then(res => res.json()),
        api.get('/api/robots', { headers: authHeader }).then(res => res.json()),
        api.get('/api/users', { headers: authHeader }).then(res => res.json()),
        api.get('/api/matches', { headers: authHeader }).then(res => res.json()),
        api.get('/api/sponsors', { headers: authHeader }).then(res => res.json()),
        api.get('/api/registrations', { headers: authHeader }).then(res => res.json()),
        api.get('/api/categories/all', { headers: authHeader }).then(res => res.json()),
        api.get('/api/levels/all', { headers: authHeader }).then(res => res.json())
      ]);
      setData({
        institutions: inst,
        robots: robots,
        referees: users.filter((u: any) => u.role === 'REFEREE'),
        matches: matches,
        sponsors: sponsors,
        registrations: regs || [],
        categories: cats || [],
        levels: lvls || []
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
    let tabEndpoint = activeTab === 'payments' ? 'registrations' : activeTab;
    let endpoint = `/api/${tabEndpoint}`;
    const method = isEditMode ? 'PUT' : 'POST';
    if (isEditMode) endpoint += `/${editingId}`;

    // Strip frontend-only fields before sending robot payload
    const { _registrationId, _registrationData, advisorName, advisorPhone, members, ...robotPayload } = formData;

    const payload = activeTab === 'robots' ? robotPayload : formData;

    try {
      const response = method === 'PUT'
        ? await api.put(endpoint, payload, { headers: { 'Authorization': `Bearer ${token}` } })
        : await api.post(endpoint, payload, { headers: { 'Authorization': `Bearer ${token}` } });

      if (response.ok) {
        // If editing a robot with a linked registration, update registration.data
        if (activeTab === 'robots' && isEditMode && _registrationId) {
          const updatedData = {
            ..._registrationData,
            advisorName: advisorName || '',
            advisorPhone: advisorPhone || '',
            members: Array.isArray(members) ? members.join(', ') : (members || ''),
          };
          await api.put(`/api/registrations/${_registrationId}`, { data: updatedData }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        setShowModal(false);
        setFormData({});
        fetchData();
      } else {
        const errorData = await response.json();
        openConfirm('Error', errorData.message || 'Error al procesar la solicitud', () => {}, 'danger');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleEdit = (item: any) => {
    setIsEditMode(true);
    setEditingId(item.id);

    // Base normalization — ensure institutionId is always set
    const normalized: any = {
      ...item,
      institutionId: item.institutionId || item.Institution?.id || '',
    };

    // If editing a robot, find related registration to pre-load advisor/members
    if (activeTab === 'robots') {
      const relatedReg = data.registrations.find((r: Registration) =>
        r.data?.robotName === item.name || r.data?.teamName === item.name
      );
      if (relatedReg) {
        const membersRaw: string = relatedReg.data?.members || '';
        normalized._registrationId = relatedReg.id;
        normalized._registrationData = relatedReg.data;
        normalized.advisorName = relatedReg.data?.advisorName || '';
        normalized.advisorPhone = relatedReg.data?.advisorPhone || '';
        normalized.members = membersRaw
          ? membersRaw.split(',').map((m: string) => m.trim()).filter(Boolean)
          : [];
      } else {
        normalized.advisorName = '';
        normalized.advisorPhone = '';
        normalized.members = [];
      }
    }

    setFormData(normalized);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    openConfirm(
      '¿Eliminar Registro?',
      'Esta acción no se puede deshacer. ¿Estás seguro de continuar?',
      async () => {
        const tabEndpoint = activeTab === 'payments' ? 'registrations' : activeTab;
        const endpoint = `/api/${tabEndpoint}/${id}`;
        try {
          const response = await api.del(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });
          if (response.ok) fetchData();
        } catch (err) {
          console.error('Error deleting record:', err);
          openConfirm('Error', 'No se pudo eliminar el registro', () => {}, 'danger');
        }
      },
      'danger'
    );
  };

  const handleToggleDashboard = async (match: Match) => {
    try {
      const resp = await api.put(`/api/matches/${match.id}`, { showInDashboard: !match.showInDashboard }, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resp.ok) fetchData();
    } catch (err) {
      console.error('Error toggling dashboard:', err);
    }
  };

  const handleViewAudit = async (match: Match) => {
    setAuditedMatch(match);
    setShowAuditModal(true);
    setLoadingLogs(true);
    try {
      const response = await api.get(`/api/matches/${match.id}/logs`, { headers: { 'Authorization': `Bearer ${token}` } });
      const logs = await response.json();
      setSelectedMatchLogs(logs);
    } catch (err) {
      openConfirm('Error', 'Error al cargar la auditoría', () => {}, 'danger');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleUpdatePaymentStatus = async (reg: Registration, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    // Prevent double submissions
    if (processingPayments.has(reg.id)) return;
    
    setProcessingPayments(prev => new Set(prev).add(reg.id));
    
    try {
      const resp = await api.put(`/api/registrations/${reg.id}`, { paymentStatus: status }, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resp.ok) fetchData();
    } catch (err) {
      console.error('Error updating payment status:', err);
    } finally {
      setProcessingPayments(prev => {
        const next = new Set(prev);
        next.delete(reg.id);
        return next;
      });
    }
  };

  const handleGenerateBracket = async () => {
    if (!formData.category || !formData.level || selectedRobots.length < 2 || !formData.refereeId) {
      openConfirm('Atención', 'Completa Nivel, Categoría, Árbitro y selecciona al menos 2 robots', () => {}, 'warning');
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
        openConfirm('Éxito', 'Llave generada con éxito', () => {
          setActiveTab('matches');
          fetchData();
        }, 'info');
      }
    } catch (err) {
      console.error('Error generating bracket:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.upload('/api/upload', form, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const body = await res.json();
        setFormData((prev: any) => ({ ...prev, logoUrl: `${UPLOADS_URL}/${body.filename}` }));
      } else {
        openConfirm('Error', 'Error al subir imagen', () => {}, 'danger');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      openConfirm('Error', 'Error de conexión al subir imagen', () => {}, 'danger');
    }
  };

  const handlePaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.upload('/api/upload', form, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const body = await res.json();
        setFormData((prev: any) => ({ ...prev, payment_proof_filename: body.filename }));
      } else {
        openConfirm('Error', 'Error al subir comprobante', () => {}, 'danger');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      openConfirm('Error', 'Error de conexión al subir comprobante', () => {}, 'danger');
    }
  };

  const handleExport = () => {
    let exportData: any[] = [];
    let headers: string[] = [];
    let filename = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'institutions') {
      headers = ['ID', 'Nombre', 'Email', 'Miembros', 'Pagado'];
      exportData = data.institutions.map(i => [
        i.id,
        `"${i.name}"`,
        `"${i.contactEmail || ''}"`,
        `"${(i.members || []).join(', ')}"`,
        i.isPaid ? 'Si' : 'No'
      ]);
    } else if (activeTab === 'robots') {
      if (showRobotDashboard) {
        // Export dashboard: category × level summary
        filename = `dashboard_categorias_${new Date().toISOString().split('T')[0]}.csv`;
        headers = ['Categoría', 'Nivel', 'Total', 'Homologados', 'Pendientes'];
        const matchFn = (a: string, b: string) => a?.toLowerCase().trim() === b?.toLowerCase().trim();
        data.categories.forEach((cat: any) => {
          const catLevels: string[] = cat.levels && cat.levels.length > 0 ? cat.levels : [''];
          catLevels.forEach((level: string) => {
            const catRobots = level
              ? data.robots.filter((r: Robot) => matchFn(r.category, cat.name) && matchFn(r.level, level))
              : data.robots.filter((r: Robot) => matchFn(r.category, cat.name));
            const ok = catRobots.filter((r: Robot) => r.isHomologated).length;
            exportData.push([
              `"${cat.name}"`,
              `"${level}"`,
              catRobots.length,
              ok,
              catRobots.length - ok
            ]);
          });
        });
      } else {
        headers = ['ID', 'Nombre', 'Nivel', 'Categoría', 'Homologado', 'Institución'];
        exportData = data.robots.map((r: Robot) => [
          r.id,
          `"${r.name}"`,
          r.level,
          `"${r.category}"`,
          r.isHomologated ? 'Si' : 'No',
          `"${r.Institution?.name || ''}"`
        ]);
      }
    } else if (activeTab === 'referees') {
      headers = ['ID', 'Usuario', 'Rol'];
      exportData = data.referees.map(r => [
        r.id,
        `"${r.username}"`,
        r.role
      ]);
    } else if (activeTab === 'matches') {
      headers = ['ID', 'Categoría', 'Ronda', 'Robot A', 'Robot B', 'Score A', 'Score B', 'Árbitro', 'Dashboard'];
      exportData = data.matches.map(m => [
        m.id,
        `"${m.category}"`,
        m.round,
        `"${m.robotA?.name || ''}"`,
        `"${m.robotB?.name || ''}"`,
        m.scoreA,
        m.scoreB,
        `"${m.referee?.username || ''}"`,
        m.showInDashboard ? 'Si' : 'No'
      ]);
    } else if (activeTab === 'sponsors') {
      headers = ['ID', 'Nombre', 'Nivel', 'Sitio Web'];
      exportData = data.sponsors.map(s => [
        s.id,
        `"${s.name}"`,
        `"${s.tier}"`,
        `"${s.website || ''}"`
      ]);
    } else if (activeTab === 'payments') {
      headers = ['ID', 'Email', 'Categoría', 'Nivel', 'Robot/Equipo', 'Asesor', 'Tel. Asesor', 'Institución', 'Estado Pago', 'Miembros'];
      exportData = data.registrations.map(r => {
        const subCategory = r.data?.juniorCategory || r.data?.seniorCategory || r.data?.masterCategory || r.data?.level || '';
        return [
          r.id,
          `"${r.google_email}"`,
          `"${subCategory}"`,
          `"${r.data?.category || ''}"`,
        `"${r.data?.robotName || r.data?.teamName || ''}"`,
        `"${r.data?.advisorName || ''}"`,
        `"${r.data?.advisorPhone || ''}"`,
        `"${r.data?.institution || ''}"`,
        r.paymentStatus,
        `"${r.data?.members || ''}"`
        ];
      });
    } else if (activeTab === 'categories') {
      headers = ['ID', 'Nombre', 'Niveles', 'Icono', 'URL Reglas', 'Orden', 'Activa'];
      exportData = data.categories.map(c => [
        c.id,
        `"${c.name}"`,
        `"${(c.levels || []).join(', ')}"`,
        `"${c.icon || ''}"`,
        `"${c.rulesUrl || ''}"`,
        c.order,
        c.isActive ? 'Sí' : 'No'
      ]);
    } else if (activeTab === 'levels') {
      headers = ['ID', 'Nombre', 'Descripción', 'Icono', 'Orden', 'Activo'];
      exportData = data.levels.map(l => [
        l.id,
        `"${l.name}"`,
        `"${l.description || ''}"`,
        `"${l.icon || ''}"`,
        l.order,
        l.isActive ? 'Sí' : 'No'
      ]);
    }

    if (exportData.length === 0) {
      openConfirm('Atención', 'No hay datos para exportar en esta vista.', () => {}, 'warning');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...exportData.map(row => row.join(','))
    ].join('\n');

    // BOM for correct UTF-8 display in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Derive levels and categories dynamically
  const COMPETITION_LEVELS = [...new Set(data.categories.flatMap((c: any) => c.levels || []))];
  const CATEGORIES_BY_LEVEL: Record<string, string[]> = {};
  data.categories.forEach((c: any) => {
    (c.levels || []).forEach((lvl: string) => {
      if (!CATEGORIES_BY_LEVEL[lvl]) CATEGORIES_BY_LEVEL[lvl] = [];
      if (!CATEGORIES_BY_LEVEL[lvl].includes(c.name)) CATEGORIES_BY_LEVEL[lvl].push(c.name);
    });
  });

  const getTabLabel = (id: string) => {
    switch (id) {
      case 'institutions': return 'Instituciones';
      case 'robots': return 'Robots';
      case 'referees': return 'Árbitros';
      case 'matches': return 'Encuentros';
      case 'sponsors': return 'Sponsors';
      case 'payments': return 'Pagos';
      case 'categories': return 'Categorías';
      case 'levels': return 'Niveles';
      case 'evento': return 'Evento';
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
          <TabButton id="categories" icon={Layers} label="Categorías" />
          <TabButton id="levels" icon={GraduationCap} label="Niveles" />
          <TabButton id="evento" icon={Settings} label="Evento" />
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

            {activeTab !== 'brackets' && (
              <button
                onClick={handleExport}
                className="bg-neutral-800 text-cb-white-tech hover:bg-neutral-700 px-4 py-3.5 font-tech font-black text-sm uppercase flex items-center gap-2 transition-all duration-75 border-3 border-neutral-700 hover:border-neutral-500 shadow-[4px_4px_0_#000] whitespace-nowrap"
                title="Exportar a CSV compatible con Excel"
              >
                <Download size={18} />
                {activeTab === 'robots' && showRobotDashboard ? 'Exportar Dashboard' : 'Exportar'}
              </button>
            )}

            {activeTab !== 'brackets' && (
              <button
                onClick={() => { setIsEditMode(false); setFormData(activeTab === 'payments' ? { paymentStatus: 'PENDING', data: {} } : {}); setShowModal(true); }}
                className="bg-cb-yellow-neon text-cb-black-pure hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none px-6 py-3.5 font-tech font-black text-sm uppercase flex items-center gap-2 transition-all duration-75 border-3 border-cb-black-pure shadow-[4px_4px_0_#10B961] whitespace-nowrap"
              >
                <Plus size={18} /> {activeTab === 'payments' ? 'Registrar Equipo' : 'Agregar'}
              </button>
            )}
          </div>
        </header>

        {/* ========= TABLE VIEWS ========= */}
        <div className="bg-[#111] border-3 border-neutral-800 shadow-[4px_4px_0_#000] overflow-hidden">

          {/* INSTITUTIONS TABLE */}
          {activeTab === 'institutions' && (
            <DataTable
              data={data.institutions.filter(i => normalize(i.name).includes(normalize(searchQuery)))}
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

          {/* ROBOTS TABLE / DASHBOARD */}
          {activeTab === 'robots' && (
            <div>
              {/* Toggle bar + filtros */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-neutral-800">
                {/* Chips filtro nivel */}
                <div className="flex flex-wrap items-center gap-2">
                  {['ALL', ...Array.from(new Set(data.robots.map(r => r.level)))].map(lvl => (
                    <button key={lvl} onClick={() => setRobotFilterLevel(lvl)}
                      className={`text-[10px] font-tech font-black uppercase px-3 py-1.5 border transition-all duration-75 ${robotFilterLevel === lvl ? 'bg-cb-yellow-neon text-black border-cb-yellow-neon' : 'text-neutral-400 border-neutral-700 hover:border-cb-yellow-neon hover:text-cb-yellow-neon'}`}>
                      {lvl === 'ALL' ? 'Todos' : lvl}
                    </button>
                  ))}
                  <div className="w-px h-5 bg-neutral-700 mx-1" />
                  {[['ALL', 'Estado'], ['true', 'Homologados'], ['false', 'Pendientes']].map(([val, label]) => (
                    <button key={val} onClick={() => setRobotFilterHomologated(val)}
                      className={`text-[10px] font-tech font-black uppercase px-3 py-1.5 border transition-all duration-75 ${robotFilterHomologated === val ? (val === 'true' ? 'bg-cb-green-vibrant text-black border-cb-green-vibrant' : val === 'false' ? 'bg-red-500 text-white border-red-500' : 'bg-cb-yellow-neon text-black border-cb-yellow-neon') : 'text-neutral-400 border-neutral-700 hover:border-neutral-500 hover:text-neutral-300'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowRobotDashboard(v => !v)}
                  className={`flex items-center gap-2 text-[10px] font-tech font-black uppercase px-3 py-1.5 border transition-all duration-75 cursor-pointer ${showRobotDashboard ? 'bg-cb-yellow-neon text-black border-cb-yellow-neon' : 'text-cb-yellow-neon border-cb-yellow-neon/40 hover:border-cb-yellow-neon hover:bg-cb-yellow-neon/10'}`}
                >
                  <LayoutDashboard size={13} />
                  {showRobotDashboard ? 'Ver Lista' : 'Ver Dashboard'}
                </button>
              </div>

              {showRobotDashboard ? (
                <div className="p-4 md:p-6">
                  <CategoryDashboard
                    categories={data.categories}
                    robots={data.robots}
                    maxRobotsPerCategory={Number(data.categories[0]?.maxRobotsPerCategory) || 0}
                  />
                </div>
              ) : (() => {
                const q = normalize(searchQuery);
                const filteredRobots = data.robots.filter(r => {
                  // Buscar registro vinculado para acceder a integrantes y asesor
                  const reg = data.registrations.find(
                    (reg: Registration) => reg.data?.robotName === r.name || reg.data?.teamName === r.name
                  );
                  const members: string = reg?.data?.members || '';
                  const advisorName: string = reg?.data?.advisorName || '';

                  const matchesSearch = !q ||
                    normalize(r.name).includes(q) ||
                    normalize(r.Institution?.name || '').includes(q) ||
                    normalize(r.category).includes(q) ||
                    normalize(r.level).includes(q) ||
                    normalize(members).includes(q) ||
                    normalize(advisorName).includes(q);

                  const matchesLevel = robotFilterLevel === 'ALL' || r.level === robotFilterLevel;
                  const matchesHomologated =
                    robotFilterHomologated === 'ALL' ||
                    (robotFilterHomologated === 'true' && r.isHomologated) ||
                    (robotFilterHomologated === 'false' && !r.isHomologated);

                  return matchesSearch && matchesLevel && matchesHomologated;
                });

                return (
                  <DataTable
                    data={filteredRobots}
                    keyField="id"
                    columns={[
                      { key: 'name', header: 'Robot', render: (r) => (
                        <div className="flex items-center gap-2">
                          <span className="font-tech font-black uppercase tracking-wider">{r.name}</span>
                          {r.isHomologated
                            ? <span className="bg-cb-green-vibrant/20 text-cb-green-vibrant text-[9px] font-tech font-black uppercase px-1.5 py-0.5 border border-cb-green-vibrant/40">✓ OK</span>
                            : <span className="bg-red-500/10 text-red-400 text-[9px] font-tech font-black uppercase px-1.5 py-0.5 border border-red-500/30">Pendiente</span>}
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
                    expandedContent={(robot) => {
                      const reg = data.registrations.find(
                        (reg: Registration) => reg.data?.robotName === robot.name || reg.data?.teamName === robot.name
                      );
                      const members: string[] = reg?.data?.members
                        ? reg.data.members.split(',').map((m: string) => m.trim()).filter(Boolean)
                        : [];
                      const advisorName: string = reg?.data?.advisorName || '';
                      const advisorPhone: string = reg?.data?.advisorPhone || '';
                      return (
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <p className="text-[10px] font-tech font-black uppercase tracking-widest text-cb-yellow-neon mb-2">Integrantes</p>
                            <div className="flex flex-wrap gap-2">
                              {members.length > 0
                                ? members.map((m, i) => <span key={i} className="text-xs font-tech font-bold text-cb-white-tech px-3 py-1.5 bg-black/50 border border-neutral-700">{m}</span>)
                                : <span className="text-xs text-neutral-500 font-tech">Sin datos</span>}
                            </div>
                          </div>
                          {advisorName && (
                            <div>
                              <p className="text-[10px] font-tech font-black uppercase tracking-widest text-cb-yellow-neon mb-2">Asesor</p>
                              <span className="text-xs font-tech font-bold text-cb-white-tech px-3 py-1.5 bg-black/50 border border-neutral-700">{advisorName}</span>
                              {advisorPhone && <span className="text-xs font-tech text-neutral-400 ml-2">{advisorPhone}</span>}
                            </div>
                          )}
                        </div>
                      );
                    }}
                    emptyMessage="Sin robots registrados"
                  />
                );
              })()}
            </div>
          )}

          {/* REFEREES TABLE */}
          {activeTab === 'referees' && (
            <DataTable
              data={data.referees.filter(u => normalize(u.username).includes(normalize(searchQuery)))}
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
              data={data.matches.filter(m => normalize(m.robotA?.name || '').includes(normalize(searchQuery)) || normalize(m.robotB?.name || '').includes(normalize(searchQuery)))}
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
                  <button
                    onClick={() => handleViewAudit(m)}
                    className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-yellow-neon"
                    title="Ver Auditoría de Combate"
                  >
                    <FileSearch size={15} />
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
              data={data.sponsors.filter(s => normalize(s.name).includes(normalize(searchQuery)))}
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


          {/* EVENTO CONFIG */}
          {activeTab === 'evento' && (
            <EventConfigPanel token={token} />
          )}

          {/* LEVELS TABLE */}
          {activeTab === 'levels' && (
            <DataTable
              data={data.levels}
              keyField="id"
              columns={[
                { key: 'name', header: 'Nombre', render: (l) => (
                  <span className="font-tech font-black uppercase tracking-wider">{l.name}</span>
                )},
                { key: 'description', header: 'Descripción', render: (l) => (
                  <span className="text-xs text-neutral-400 font-tech whitespace-pre-line">{l.description || '---'}</span>
                )},
                { key: 'icon', header: 'Icono', render: (l) => (
                  <span className="text-xs text-neutral-400 font-tech font-bold">{l.icon || '---'}</span>
                )},
                { key: 'order', header: 'Orden', render: (l) => (
                  <span className="text-xs text-neutral-500 font-tech font-bold">{l.order}</span>
                )},
                { key: 'isActive', header: 'Activo', render: (l) => (
                  l.isActive
                    ? <span className="bg-cb-green-vibrant/20 text-cb-green-vibrant text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-cb-green-vibrant/40">Sí</span>
                    : <span className="bg-red-500/20 text-red-400 text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-red-500/40">No</span>
                )},
              ]}
              actions={(lvl) => (
                <>
                  <button onClick={() => handleEdit(lvl)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(lvl.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-red-500"><Trash2 size={15} /></button>
                </>
              )}
              emptyMessage="Sin niveles registrados"
            />
          )}

          {/* CATEGORIES TABLE */}
          {activeTab === 'categories' && (
            <DataTable
              data={data.categories.filter(c => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return c.name?.toLowerCase().includes(q) || (c.levels || []).some((l: string) => l.toLowerCase().includes(q));
              })}
              keyField="id"
              columns={[
                { key: 'name', header: 'Nombre', render: (c) => (
                  <span className="font-tech font-black uppercase tracking-wider">{c.name}</span>
                )},
                { key: 'levels', header: 'Niveles', render: (c) => (
                  <div className="flex gap-1 flex-wrap">{(c.levels || []).map((l: string) => <span key={l} className="text-[10px] font-tech font-bold text-cb-yellow-neon px-2 py-0.5 bg-cb-yellow-neon/10 border border-cb-yellow-neon/30">{l}</span>)}</div>
                )},
                { key: 'robots', header: 'Robots', render: (c) => {
                  const total = data.robots.filter((r: Robot) => r.category?.toLowerCase().trim() === c.name?.toLowerCase().trim()).length;
                  const ok = data.robots.filter((r: Robot) => r.category?.toLowerCase().trim() === c.name?.toLowerCase().trim() && r.isHomologated).length;
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-tech font-black text-cb-white-tech">{total}</span>
                      <span className="text-[9px] font-tech text-cb-green-vibrant border border-cb-green-vibrant/30 px-1.5 py-0.5">{ok} ✓</span>
                    </div>
                  );
                }},
                { key: 'isActive', header: 'Activa', render: (c) => (
                  c.isActive
                    ? <span className="bg-cb-green-vibrant/20 text-cb-green-vibrant text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-cb-green-vibrant/40">Sí</span>
                    : <span className="bg-red-500/20 text-red-400 text-[10px] font-tech font-black uppercase px-2 py-0.5 border border-red-500/40">No</span>
                )},
              ]}
              actions={(cat) => (
                <>
                  <button onClick={() => setCategoryDetailCat(cat)} className="text-neutral-500 hover:text-cb-green-vibrant hover:bg-cb-green-vibrant/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-green-vibrant" title="Ver Detalles"><Bot size={15} /></button>
                  <button onClick={() => handleEdit(cat)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-red-500"><Trash2 size={15} /></button>
                </>
              )}
              emptyMessage="Sin categorías registradas"
            />
          )}

          {/* PAYMENTS TABLE */}
          {activeTab === 'payments' && (
            <DataTable
              data={data.registrations.filter(r => {
                if (!searchQuery) return true;
                const q = normalize(searchQuery);
                return (
                  normalize(r.google_email || '').includes(q) ||
                  normalize(r.data?.category || '').includes(q) ||
                  normalize(r.data?.robotName || '').includes(q) ||
                  normalize(r.data?.teamName || '').includes(q) ||
                  normalize(r.data?.advisorName || '').includes(q) ||
                  normalize(r.data?.institution || '').includes(q) ||
                  normalize(r.data?.members || '').includes(q) ||
                  normalize(r.data?.level || '').includes(q)
                );
              })}
              keyField="id"
              columns={[
                { key: 'google_email', header: 'Email', render: (r) => (
                  <span className="font-tech font-black text-xs uppercase break-all">{r.google_email}</span>
                )},
                { key: 'category', header: 'Categoría', render: (r) => {
                  const subCategory = r.data?.juniorCategory || r.data?.seniorCategory || r.data?.masterCategory || r.data?.level || '---';
                  return <span className="text-xs text-neutral-400 font-tech font-bold">{subCategory}</span>;
                }},
                { key: 'level', header: 'Nivel', render: (r) => (
                  <span className="text-[10px] font-tech font-bold text-cb-yellow-neon px-2 py-0.5 bg-cb-yellow-neon/10 border border-cb-yellow-neon/30">{r.data?.category || '---'}</span>
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
                        <button 
                          onClick={() => handleUpdatePaymentStatus(reg, 'APPROVED')} 
                          disabled={processingPayments.has(reg.id)}
                          className="py-2 px-4 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-cb-green-vibrant text-cb-black-pure border-2 border-cb-green-vibrant hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingPayments.has(reg.id) ? 'Procesando...' : 'Aprobar Pago'}
                        </button>
                      )}
                      {reg.paymentStatus === 'PENDING' && (
                        <button 
                          onClick={() => handleUpdatePaymentStatus(reg, 'REJECTED')} 
                          disabled={processingPayments.has(reg.id)}
                          className="py-2 px-4 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-transparent text-red-400 border-2 border-red-500/40 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingPayments.has(reg.id) ? 'Procesando...' : 'Rechazar'}
                        </button>
                      )}
                      {(reg.paymentStatus === 'APPROVED' || reg.paymentStatus === 'REJECTED') && (
                        <button 
                          onClick={() => handleUpdatePaymentStatus(reg, 'PENDING')} 
                          disabled={processingPayments.has(reg.id)}
                          className="py-2 px-4 font-tech font-black uppercase text-[10px] tracking-wider transition-all duration-75 bg-transparent text-neutral-500 border-2 border-neutral-700 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingPayments.has(reg.id) ? 'Procesando...' : 'Restaurar a Pendiente'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              }}
              actions={(reg) => (
                <>
                  <button onClick={() => handleEdit(reg)} className="text-neutral-500 hover:text-cb-yellow-neon hover:bg-cb-yellow-neon/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-cb-yellow-neon"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(reg.id)} className="text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-75 p-2 border border-neutral-700 hover:border-red-500"><Trash2 size={15} /></button>
                </>
              )}
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
                          {formData.level && (CATEGORIES_BY_LEVEL[formData.level] || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
                  <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
                    {/* Nombre + Nivel */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre del Robot</label>
                        <input required value={formData.name || ''} placeholder="ej. Destroyer 3000" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nivel de Competencia</label>
                        <select required value={formData.level || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 appearance-none" onChange={e => setFormData({ ...formData, level: e.target.value, category: '' })}>
                          <option value="">Seleccionar...</option>
                          {COMPETITION_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                          {/* Fallback: show current value if not in list */}
                          {formData.level && !COMPETITION_LEVELS.includes(formData.level as string) && (
                            <option value={formData.level}>{formData.level}</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Categoría + Institución */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Categoría</label>
                        <select required value={formData.category || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 appearance-none" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {(CATEGORIES_BY_LEVEL[formData.level] || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          {/* Fallback: show current category if not in level list */}
                          {formData.category && !(CATEGORIES_BY_LEVEL[formData.level] || []).includes(formData.category) && (
                            <option value={formData.category}>{formData.category}</option>
                          )}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Institución</label>
                        <select required value={formData.institutionId || ''} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 appearance-none" onChange={e => setFormData({ ...formData, institutionId: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {data.institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Homologado */}
                    <div className="flex items-center gap-4 p-4 bg-[#0a0a0a] border-2 border-neutral-700">
                      <input type="checkbox" id="homologated" checked={formData.isHomologated || false} onChange={e => setFormData({ ...formData, isHomologated: e.target.checked })} className="w-5 h-5 accent-[#10B961]" />
                      <label htmlFor="homologated" className="text-[10px] font-tech font-black uppercase text-neutral-400 cursor-pointer tracking-widest">Robot Homologado (Pasó revisión técnica)</label>
                    </div>

                    {/* Asesor */}
                    <div className="border-t-2 border-neutral-800 pt-4 space-y-4">
                      <p className="text-[10px] font-tech font-black uppercase text-cb-yellow-neon tracking-widest">Datos del Asesor</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre del Asesor</label>
                          <input value={formData.advisorName || ''} placeholder="ej. Ing. Juan Pérez" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, advisorName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Teléfono del Asesor</label>
                          <input value={formData.advisorPhone || ''} placeholder="ej. 0987654321" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, advisorPhone: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    {/* Miembros del equipo */}
                    <div className="border-t-2 border-neutral-800 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-tech font-black uppercase text-cb-yellow-neon tracking-widest">Miembros del Equipo</p>
                        <button type="button" onClick={() => setFormData({ ...formData, members: [...(formData.members || []), ''] })} className="text-[10px] font-tech font-black uppercase text-cb-green-vibrant border border-cb-green-vibrant/40 px-3 py-1 hover:bg-cb-green-vibrant/10 transition-all duration-75">
                          + Agregar
                        </button>
                      </div>
                      {(formData.members || []).length === 0 && (
                        <p className="text-[10px] font-tech text-neutral-600 uppercase tracking-widest">Sin miembros registrados</p>
                      )}
                      {(formData.members || []).map((member: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            value={member}
                            placeholder={`Estudiante ${idx + 1}`}
                            className="flex-1 bg-[#0a0a0a] border-2 border-neutral-700 p-3 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600"
                            onChange={e => {
                              const updated = [...(formData.members || [])];
                              updated[idx] = e.target.value;
                              setFormData({ ...formData, members: updated });
                            }}
                          />
                          <button type="button" onClick={() => {
                            const updated = (formData.members || []).filter((_: string, i: number) => i !== idx);
                            setFormData({ ...formData, members: updated });
                          }} className="w-9 h-9 border-2 border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:border-red-500 transition-all duration-75 shrink-0">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
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
                      <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Logo</label>
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <input value={formData.logoUrl || ''} placeholder="URL o subir archivo..." className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} />
                        </div>
                        <div className="relative w-48">
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="bg-[#1a1a1a] border-2 border-neutral-700 p-4 flex items-center justify-center text-cb-yellow-neon hover:border-cb-yellow-neon transition-all duration-75 cursor-pointer">
                            <span className="text-[10px] font-tech font-black uppercase tracking-widest">Subir Imagen</span>
                          </div>
                        </div>
                      </div>
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

                {activeTab === 'categories' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre de la Categoría</label>
                        <input required value={formData.name || ''} placeholder="ej. Minisumo Autónomo" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Niveles</label>
                        <div className="flex gap-3 bg-[#0a0a0a] border-2 border-neutral-700 p-4">
                          {data.levels.map((l: any) => {
                            const selected = (formData.levels || []).includes(l.name);
                            return (
                              <label key={l.id} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={selected} className="w-4 h-4 accent-[#10B961]"
                                  onChange={() => {
                                    const current: string[] = formData.levels || [];
                                    const updated = selected ? current.filter((n: string) => n !== l.name) : [...current, l.name];
                                    setFormData({ ...formData, levels: updated });
                                  }} />
                                <span className="text-xs font-tech font-bold text-cb-white-tech uppercase">{l.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Icono (Lucide)</label>
                        <select value={formData.icon || 'Gamepad2'} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 appearance-none" onChange={e => setFormData({ ...formData, icon: e.target.value })}>
                          <option value="Gamepad2">Gamepad2</option>
                          <option value="Bot">Bot</option>
                          <option value="Trophy">Trophy</option>
                          <option value="Map">Map</option>
                          <option value="Hammer">Hammer</option>
                          <option value="Activity">Activity</option>
                          <option value="Code">Code</option>
                          <option value="Leaf">Leaf</option>
                          <option value="Baby">Baby</option>
                          <option value="GraduationCap">GraduationCap</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Orden</label>
                        <input type="number" value={formData.order ?? 0} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75" onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">URL del Reglamento</label>
                      <input value={formData.rulesUrl || ''} placeholder="https://..." className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, rulesUrl: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-[#0a0a0a] border-2 border-neutral-700">
                      <input type="checkbox" id="catActive" checked={formData.isActive !== false} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 accent-[#10B961]" />
                      <label htmlFor="catActive" className="text-[10px] font-tech font-black uppercase text-neutral-400 cursor-pointer tracking-widest">Categoría Activa (visible en formulario)</label>
                    </div>
                  </div>
                )}

                {activeTab === 'levels' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Nombre del Nivel</label>
                        <input required value={formData.name || ''} placeholder="ej. Leyenda" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Icono (Lucide)</label>
                        <select value={formData.icon || 'Bot'} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 appearance-none" onChange={e => setFormData({ ...formData, icon: e.target.value })}>
                          <option value="Baby">Baby</option>
                          <option value="Bot">Bot</option>
                          <option value="GraduationCap">GraduationCap</option>
                          <option value="Trophy">Trophy</option>
                          <option value="Gamepad2">Gamepad2</option>
                          <option value="Star">Star</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Descripción</label>
                      <input value={formData.description || ''} placeholder="ej. EXPERTOS VETERANOS (Pro)" className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75 placeholder:text-neutral-600" onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-tech font-black uppercase text-neutral-500 tracking-widest">Orden</label>
                        <input type="number" value={formData.order ?? 0} className="w-full bg-[#0a0a0a] border-2 border-neutral-700 p-4 text-sm font-tech text-cb-white-tech focus:border-cb-yellow-neon outline-none transition-all duration-75" onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-[#0a0a0a] border-2 border-neutral-700 self-end">
                        <input type="checkbox" id="lvlActive" checked={formData.isActive !== false} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 accent-[#10B961]" />
                        <label htmlFor="lvlActive" className="text-[10px] font-tech font-black uppercase text-neutral-400 cursor-pointer tracking-widest">Nivel Activo</label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <PaymentRegistrationForm
                    formData={formData}
                    setFormData={setFormData}
                    levelsData={data.levels}
                    categoriesData={data.categories}
                    isEditMode={isEditMode}
                    handlePaymentProofUpload={handlePaymentProofUpload}
                  />
                )}

                <button type="submit" className="w-full bg-cb-yellow-neon text-cb-black-pure font-tech font-black py-5 border-3 border-cb-black-pure shadow-[4px_4px_0_#10B961] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75 mt-6 text-sm uppercase tracking-widest">{isEditMode ? 'Guardar Cambios' : 'Desplegar Cambios'}</button>
              </form>
            </motion.div>
          </div>
        )}
        {/* AUDIT MODAL */}
        {showAuditModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] w-full max-w-4xl max-h-[90vh] shadow-[12px_12px_0_#000] overflow-hidden border-3 border-cb-green-vibrant flex flex-col">
              <div className="p-6 border-b-2 border-neutral-800 flex justify-between items-center bg-[#0a0a0a]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cb-green-vibrant/20 border-2 border-cb-green-vibrant text-cb-green-vibrant">
                    <History size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-tech font-black text-cb-white-tech uppercase tracking-wider">Auditoría de Combate</h2>
                    <p className="text-[10px] font-tech font-bold text-cb-green-vibrant uppercase tracking-widest mt-1">
                      {auditedMatch?.category} • {auditedMatch?.robotA?.name} vs {auditedMatch?.robotB?.name}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAuditModal(false)} className="w-12 h-12 border-2 border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-cb-yellow-neon hover:border-cb-yellow-neon transition-all duration-75">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/30">
                {loadingLogs ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-cb-yellow-neon border-t-transparent animate-spin rounded-full" />
                    <p className="font-tech font-black text-xs text-neutral-500 uppercase">Recuperando registros...</p>
                  </div>
                ) : selectedMatchLogs.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-neutral-600 gap-4">
                    <FileSearch size={48} />
                    <p className="font-tech font-black text-sm uppercase">Sin registros de eventos para este encuentro</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Vertical line for the timeline */}
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-neutral-800" />
                    
                    <div className="flex flex-col gap-6">
                      {selectedMatchLogs.map((log) => {
                        const isPoint = log.type === 'POINT';
                        const isPenalty = log.type === 'PENALTY';
                        const isState = log.type === 'STATE_CHANGE';
                        
                        return (
                          <div key={log.id} className="flex gap-6 relative group">
                            <div className={`w-16 h-16 flex-shrink-0 flex flex-col items-center justify-center border-2 z-10 
                              ${isPoint ? 'bg-cb-green-vibrant border-cb-black-pure text-cb-black-pure' : 
                                isPenalty ? 'bg-red-500 border-cb-black-pure text-cb-white-tech' : 
                                isState ? 'bg-cb-yellow-neon border-cb-black-pure text-cb-black-pure' :
                                'bg-[#1a1a1a] border-neutral-700 text-neutral-400'}`}>
                              <Clock size={16} />
                              <span className="font-mono font-black text-xs mt-1">
                                {Math.floor(log.matchTime / 60)}:{(log.matchTime % 60).toString().padStart(2, '0')}
                              </span>
                            </div>

                            <div className="flex-1 bg-[#1a1a1a] border-2 border-neutral-800 p-4 transition-all duration-75 hover:border-neutral-600 group-hover:translate-x-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-tech font-black uppercase px-2 py-0.5 
                                  ${isPoint ? 'bg-cb-green-vibrant/20 text-cb-green-vibrant' : 
                                    isPenalty ? 'bg-red-500/20 text-red-500' : 
                                    'text-neutral-500'}`}>
                                  {log.type}
                                </span>
                                <span className="text-[9px] font-mono text-neutral-600 uppercase">
                                  {new Date(log.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="font-tech font-black text-cb-white-tech text-sm tracking-wide">{log.description}</p>
                              {log.Robot && (
                                <p className="text-[10px] font-tech font-bold text-neutral-500 mt-1 uppercase">Afectado: {log.Robot.name}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t-2 border-neutral-800 flex justify-end bg-[#0a0a0a]">
                <button onClick={() => setShowAuditModal(false)} className="bg-cb-yellow-neon text-cb-black-pure px-8 py-3 font-tech font-black uppercase text-xs tracking-widest border-2 border-cb-black-pure shadow-[4px_4px_0_#FFF]">
                  Cerrar Auditoría
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* CATEGORY DETAIL MODAL */}
        {categoryDetailCat && (() => {
          const catRobots = data.robots.filter((r: Robot) => r.category?.toLowerCase().trim() === categoryDetailCat.name?.toLowerCase().trim());
          const homologated = catRobots.filter((r: Robot) => r.isHomologated);
          const pending = catRobots.filter((r: Robot) => !r.isHomologated);
          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#111] w-full max-w-2xl border-2 border-cb-yellow-neon shadow-[8px_8px_0_#000] overflow-hidden">
                <div className="h-2 bg-warning-tape" />
                <div className="p-5 border-b-2 border-neutral-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-tech font-black uppercase text-cb-yellow-neon tracking-wider">{categoryDetailCat.name}</h2>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(categoryDetailCat.levels || []).map((l: string) => (
                        <span key={l} className="text-[9px] font-tech font-black text-cb-yellow-neon/70 border border-cb-yellow-neon/30 px-2 py-0.5 uppercase">{l}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setCategoryDetailCat(null)} className="w-9 h-9 border-2 border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-red-400 hover:border-red-500 transition-all duration-75 cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 divide-x-2 divide-neutral-800 border-b-2 border-neutral-800">
                  {[
                    { label: 'Total', value: catRobots.length, color: 'text-cb-white-tech' },
                    { label: 'Homologados', value: homologated.length, color: 'text-cb-green-vibrant' },
                    { label: 'Pendientes', value: pending.length, color: 'text-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-4 text-center">
                      <p className={`text-3xl font-tech font-black ${color}`}>{value}</p>
                      <p className="text-[9px] font-tech font-black uppercase text-neutral-500 tracking-widest mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 max-h-72 overflow-y-auto space-y-2">
                  {catRobots.length === 0 && (
                    <p className="text-center text-xs font-tech text-neutral-600 uppercase py-6">Sin robots en esta categoría</p>
                  )}
                  {catRobots.map((robot: Robot) => (
                    <div key={robot.id} className={`flex items-center justify-between p-3 border-2 ${robot.isHomologated ? 'border-cb-green-vibrant/30 bg-cb-green-vibrant/5' : 'border-neutral-800 bg-[#0a0a0a]'}`}>
                      <div className="flex items-center gap-3">
                        <Bot size={14} className={robot.isHomologated ? 'text-cb-green-vibrant' : 'text-neutral-600'} strokeWidth={2.5} />
                        <div>
                          <p className="text-xs font-tech font-black uppercase text-cb-white-tech">{robot.name}</p>
                          <p className="text-[10px] font-tech text-neutral-500">{robot.level} · {robot.Institution?.name || '---'}</p>
                        </div>
                      </div>
                      {robot.isHomologated
                        ? <span className="flex items-center gap-1 text-[9px] font-tech font-black text-cb-green-vibrant border border-cb-green-vibrant/40 px-2 py-0.5 uppercase"><ShieldCheck size={10} /> Homologado</span>
                        : <span className="flex items-center gap-1 text-[9px] font-tech font-black text-red-400 border border-red-500/40 px-2 py-0.5 uppercase"><AlertTriangle size={10} /> Pendiente</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          type={confirmConfig.type}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        />
      </main>
    </div>
  );
};

export default AdminPanel;
  