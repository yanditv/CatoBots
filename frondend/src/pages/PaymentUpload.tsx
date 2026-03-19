import { useState } from 'react';
import { Upload, X, Search, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';

type RegistrationStatus = {
  id: string;
  google_email: string;
  paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  payment_proof_filename: string | null;
  data: {
    institution?: string;
    robotName?: string;
    teamName?: string;
    category?: string;
    members?: string;
  };
};

export default function PaymentUpload() {
  const [email, setEmail] = useState('');
  const [registration, setRegistration] = useState<RegistrationStatus | null>(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSearching(true);
    setError('');
    setRegistration(null);
    setUploadSuccess(false);
    try {
      const res = await api.get(`/api/registrations/status?email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) {
        setError('No se encontró ningún registro para ese correo. Verifica que sea el mismo correo con el que te inscribieron.');
        return;
      }
      const data = await res.json();
      setRegistration(data);
    } catch {
      setError('Error al conectar con el servidor. Intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !registration) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo excede el límite de 2MB.');
      return;
    }
    setIsUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.upload('/api/registrations/upload', formData);
      const uploadData = await uploadRes.json();
      if (!uploadData.filename) throw new Error('Upload fallido');

      // Asociar al registro
      const patchRes = await fetch(`/api/registrations/${registration.id}/payment-proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registration.google_email, payment_proof_filename: uploadData.filename }),
      });
      if (!patchRes.ok) throw new Error('Error al guardar');

      setRegistration(prev => prev ? { ...prev, payment_proof_filename: uploadData.filename } : prev);
      setUploadSuccess(true);
    } catch {
      setError('Error al subir el archivo. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const statusInfo = {
    PENDING: { label: 'Pendiente de revisión', icon: <Clock size={20} />, color: 'text-yellow-600 bg-yellow-50 border-yellow-300' },
    APPROVED: { label: 'Pago aprobado', icon: <CheckCircle size={20} />, color: 'text-green-700 bg-green-50 border-green-300' },
    REJECTED: { label: 'Pago rechazado', icon: <XCircle size={20} />, color: 'text-red-700 bg-red-50 border-red-300' },
  };

  return (
    <div className="min-h-screen bg-cb-green-vibrant bg-noise text-cb-black-pure font-sans flex flex-col items-center">
      <header className="w-full bg-cb-black-pure border-b-3 border-cb-yellow-neon shadow-block-sm py-2 px-4 flex justify-between items-center z-50">
        <Link to="/" className="flex items-center gap-2 text-cb-white-tech font-tech uppercase tracking-widest text-xs hover:text-cb-yellow-neon transition-colors">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
        <span className="font-tech text-sm italic tracking-widest text-cb-white-tech">
          CatoBots <span className="text-cb-yellow-neon">IV</span>
        </span>
      </header>

      <main className="flex-1 w-full max-w-2xl px-4 py-10 flex flex-col gap-6">
        <div className="bg-cb-white-tech border-4 border-cb-black-pure p-6 shadow-block-lg">
          <h1 className="text-2xl font-tech font-black text-cb-black-pure uppercase tracking-widest mb-1 drop-shadow-[2px_2px_0_rgba(255,240,0,1)]">
            Subir Comprobante de Pago
          </h1>
          <p className="text-sm text-cb-black-pure font-bold mb-6">
            Ingresa el correo con el que fuiste registrado para encontrar tu inscripción y subir el comprobante.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="flex-1 bg-cb-gray-industrial border-3 border-cb-black-pure rounded-none px-3 py-2 font-tech text-sm focus:outline-none focus:ring-2 focus:ring-cb-yellow-neon placeholder:text-neutral-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-cb-black-pure text-cb-yellow-neon border-3 border-cb-black-pure px-4 py-2 font-tech font-bold uppercase text-sm flex items-center gap-2 hover:bg-cb-yellow-neon hover:text-cb-black-pure transition-colors disabled:opacity-50"
            >
              <Search size={16} />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-700 font-bold border border-red-300 bg-red-50 px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {registration && (
          <div className="bg-cb-white-tech border-4 border-cb-black-pure p-6 shadow-block-lg space-y-5">
            {/* Info del registro */}
            <div className="border-b-4 border-cb-black-pure pb-4">
              <h2 className="font-tech font-black text-lg uppercase tracking-widest mb-3">Tu Inscripción</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {registration.data.institution && (
                  <div>
                    <p className="text-xs text-neutral-500 font-bold uppercase">Institución</p>
                    <p className="font-bold">{registration.data.institution}</p>
                  </div>
                )}
                {(registration.data.robotName || registration.data.teamName) && (
                  <div>
                    <p className="text-xs text-neutral-500 font-bold uppercase">Robot / Equipo</p>
                    <p className="font-bold">{registration.data.robotName || registration.data.teamName}</p>
                  </div>
                )}
                {registration.data.category && (
                  <div>
                    <p className="text-xs text-neutral-500 font-bold uppercase">Nivel</p>
                    <p className="font-bold">{registration.data.category}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Estado del pago */}
            <div className={`flex items-center gap-3 border-2 px-4 py-3 font-bold text-sm ${statusInfo[registration.paymentStatus].color}`}>
              {statusInfo[registration.paymentStatus].icon}
              <span>{statusInfo[registration.paymentStatus].label}</span>
            </div>

            {/* Upload de comprobante */}
            {registration.paymentStatus !== 'APPROVED' && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2">Comprobante de Pago</p>

                {registration.payment_proof_filename && !uploadSuccess ? (
                  <div className="bg-yellow-50 border-2 border-yellow-400 px-4 py-3 text-sm font-bold text-yellow-800 flex items-center justify-between">
                    <span>Ya tienes un comprobante cargado. Puedes reemplazarlo.</span>
                  </div>
                ) : uploadSuccess ? (
                  <div className="bg-green-50 border-2 border-green-400 px-4 py-3 text-sm font-bold text-green-800 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Comprobante enviado correctamente. El equipo lo revisará pronto.
                  </div>
                ) : null}

                {!uploadSuccess && (
                  <label className="mt-3 flex flex-col items-center justify-center border-4 border-dashed border-cb-black-pure bg-cb-gray-industrial h-36 cursor-pointer hover:bg-neutral-200 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <p className="font-tech font-bold text-cb-yellow-neon text-lg animate-pulse">SUBIENDO...</p>
                    ) : (
                      <>
                        <Upload size={28} className="text-cb-black-pure mb-2" />
                        <p className="font-tech font-bold text-sm uppercase">
                          {registration.payment_proof_filename ? 'Reemplazar comprobante' : 'Seleccionar comprobante'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">IMG o PDF · Máx 2MB</p>
                      </>
                    )}
                  </label>
                )}
              </div>
            )}

            {registration.paymentStatus === 'APPROVED' && (
              <p className="text-sm text-green-700 font-bold">
                Tu pago ya fue aprobado. No necesitas subir ningún comprobante adicional.
              </p>
            )}

            {registration.paymentStatus === 'REJECTED' && (
              <p className="text-sm text-red-700 font-bold">
                Tu pago fue rechazado. Por favor sube un nuevo comprobante válido.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
