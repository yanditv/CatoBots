import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle, CreditCard, Mail, Trophy, Users, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 100);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const steps = [
        {
            id: 1,
            title: "Prepara tu Información",
            description: "Ten a la mano el correo electrónico del capitán y los datos exactos de la Institución Educativa.",
            icon: Mail,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            id: 2,
            title: "Elige tu Categoría",
            description: "Selecciona entre Junior (Escolar), Senior (Colegio) o Master (Universidad/Clubes).",
            icon: Trophy,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20"
        },
        {
            id: 3,
            title: "Detalles del Equipo",
            description: "Ingresa el nombre de tu robot o equipo, y los datos de los 2 integrantes y el asesor.",
            icon: Users,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            id: 4,
            title: "Pago de Inscripción",
            description: "El costo es de $10.00 por Institución. Realiza el pago a la cuenta oficial.",
            icon: CreditCard,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        },
        {
            id: 5,
            title: "Confirmación",
            description: "Sube tu comprobante y recibe la confirmación de tu registro para el evento.",
            icon: CheckCircle,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] opacity-50" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px] opacity-50" />
            </div>

            {/* Sticky Header */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5 py-4 px-6 flex justify-between items-center"
            >
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    CatoBots IV
                </span>
                <Link
                    to={accepted ? "/registro" : "#"}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg ${accepted
                            ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30"
                            : "bg-neutral-700 text-neutral-400 cursor-not-allowed opacity-50"
                        }`}
                    onClick={(e) => !accepted && e.preventDefault()}
                >
                    Inscribirse
                </Link>
            </motion.nav>

            <main className="relative z-10 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-900/30 border border-yellow-500/30 text-yellow-300 text-sm font-medium mb-6">
                        ⚠ Por favor, lee detenidamente los pasos antes de inscribirte
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-neutral-400 mb-6 leading-tight">
                        CatoBots IV
                    </h1>

                    <p className="text-xl md:text-2xl text-neutral-400 mb-8 leading-relaxed">
                        Demuestra tu ingenio en la competencia más grande de la región.<br />
                        <span className="text-purple-400 font-semibold">20 de Marzo del 2026</span> • Coliseo de las Aguilas Rojas
                        <a
                            href="https://maps.app.goo.gl/dwUEErcrpNe4CiN59"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center ml-2 p-1.5 rounded-full bg-white/5 text-purple-400 hover:bg-white/10 hover:text-purple-300 transition-all border border-white/10"
                            title="Ver ubicación"
                        >
                            <MapPin size={18} />
                        </a>
                    </p>
                </motion.div>

                {/* Process Steps */}
                <div className="w-full max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Proceso de Inscripción</h2>
                        <p className="text-neutral-400">Sigue estos 5 sencillos pasos para asegurar tu lugar en la competencia.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                        {/* Connecting Line for Desktop */}
                        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-purple-900/0 via-purple-900/50 to-purple-900/0 -z-10 transform -translate-y-1/2" />

                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    relative p-6 rounded-2xl border backdrop-blur-sm
                                    ${step.bg} ${step.border} hover:border-opacity-50 transition-all group
                                    ${index === 3 ? "md:col-span-2 lg:col-span-1" : ""}
                                    ${index === 4 ? "md:col-span-2 lg:col-span-1 md:mx-auto lg:mx-0" : ""}
                                `}
                            >
                                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-neutral-950 border border-neutral-800 group-hover:scale-110 transition-transform`}>
                                    <step.icon size={24} className={step.color} />
                                </div>
                                <div className="absolute top-6 right-6 text-4xl font-black text-white/5 select-none">
                                    0{step.id}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Payment Info Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 w-full max-w-4xl bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 md:p-12 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-4">Información de Pago</h2>
                            <p className="text-neutral-400 mb-6">
                                Puedes realizar el pago con anticipación para agilizar tu registro.
                                El costo es único por equipo, con un máximo de 2 integrantes.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                                    <div className="bg-purple-500/20 p-3 rounded-lg">
                                        <CreditCard className="text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 text-xs uppercase font-bold">Banco</p>
                                        <p className="text-white font-medium">Cooperativa Biblián - Cuenta de Ahorros</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                                    <div className="bg-blue-500/20 p-3 rounded-lg">
                                        <Users className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 text-xs uppercase font-bold">Cuenta</p>
                                        <p className="text-white font-medium">0212011159836 - CatoBots</p>
                                        <p className="text-neutral-500 text-xs uppercase font-bold mt-1">Nombre:</p>
                                        <p className="text-white font-medium">Segundo Leopoldo Pauta Ayabaca</p>
                                        <p className="text-neutral-500 text-xs uppercase font-bold mt-1">CI: </p>
                                        <p className="text-white font-medium">0101995843</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent z-10 md:hidden" />
                            <img
                                src="/src/assets/pago.png"
                                alt="Información de Pago"
                                className="rounded-xl shadow-2xl border border-neutral-700 transform md:rotate-3 transition-transform hover:rotate-0"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Final CTA & Checkbox */}
                <div className="mt-24 text-center pb-8 max-w-md mx-auto">
                    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl mb-8">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex-shrink-0 mt-1">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <div className={`w-5 h-5 rounded border transition-all ${accepted
                                    ? "bg-purple-600 border-purple-600"
                                    : "bg-transparent border-neutral-600 group-hover:border-purple-400"
                                    }`}>
                                    {accepted && <CheckCircle size={14} className="text-white absolute top-0.5 left-0.5" />}
                                </div>
                            </div>
                            <span className="text-sm text-neutral-400 text-left leading-relaxed select-none group-hover:text-neutral-300 transition-colors">
                                He leído detenidamente los pasos de inscripción y cuento con toda la información necesaria.
                            </span>
                        </label>
                    </div>

                    <p className="text-neutral-400 mb-6">¿Listo para competir?</p>

                    <Link
                        to={accepted ? "/registro" : "#"}
                        onClick={(e) => !accepted && e.preventDefault()}
                        className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-xl transition-all ${accepted
                                ? "bg-white text-neutral-900 hover:bg-neutral-200"
                                : "bg-neutral-800 text-neutral-500 cursor-not-allowed grayscale opacity-50"
                            }`}
                    >
                        REGISTRAR EQUIPO <ArrowRight size={18} />
                    </Link>

                    <div className="mt-8 flex justify-center gap-6 text-sm text-neutral-500">
                        <a href="#" className="hover:text-purple-400 transition-colors flex items-center gap-1"><BookOpen size={14} /> Reglamento</a>
                        <a href="#" className="hover:text-purple-400 transition-colors">Términos y Condiciones</a>
                        <a href="#" className="hover:text-purple-400 transition-colors">Contacto</a>
                    </div>
                </div>

            </main>
        </div >
    );
}
