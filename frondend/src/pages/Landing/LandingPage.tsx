import { motion } from "framer-motion";
import { ShieldCheck, Zap, Bot, Swords, Terminal, FileCode2, CalendarDays, MapPin, LogIn, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            icon: Terminal,
            color: "text-cb-white-tech",
            bg: "bg-neutral-900",
            border: "border-cb-green-dark"
        },
        {
            id: 2,
            title: "Elige tu Categoría",
            description: "Selecciona entre Junior (Escolar), Senior (Colegio) o Master (Universidad/Clubes).",
            icon: Swords,
            color: "text-cb-yellow-warning",
            bg: "bg-neutral-900",
            border: "border-cb-yellow-warning"
        },
        {
            id: 3,
            title: "Detalles del Robot",
            description: "Ingresa el nombre de tu robot o equipo, y los datos de los 2 integrantes y el asesor.",
            icon: Bot,
            color: "text-cb-green-base",
            bg: "bg-neutral-900",
            border: "border-cb-green-base"
        },
        {
            id: 4,
            title: "Activación Oficial",
            description: "El costo es de $10.00 por Institución. Realiza el pago a la cuenta oficial para habilitar tu nodo.",
            icon: Zap,
            color: "text-cb-white-tech",
            bg: "bg-neutral-900",
            border: "border-neutral-700"
        },
        {
            id: 5,
            title: "Confirmación",
            description: "Sube tu comprobante y recibe la confirmación criptográfica de tu registro para el evento.",
            icon: ShieldCheck,
            color: "text-cb-yellow-neon",
            bg: "bg-neutral-900",
            border: "border-cb-yellow-neon"
        }
    ];

    return (
        <div className="min-h-screen bg-cb-green-vibrant bg-noise text-cb-black-pure font-sans overflow-hidden">
            {/* Header / Navbar Aggressive */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-cb-black-pure border-b-4 border-cb-yellow-neon shadow-block-sm py-3" : "bg-transparent py-5"}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="/logo-white.png" alt="CatoBots" className={`h-8 md:h-10 transition-transform ${scrolled ? "scale-90" : "scale-100"}`} />
                        <span className={`font-tech text-lg md:text-xl mt-2 md:mt-3 italic tracking-widest hidden sm:block ${scrolled ? "text-cb-white-tech" : "text-cb-black-pure"}`}>IV EDICIÓN</span>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link 
                            to="/login" 
                            className="flex items-center gap-2 px-5 py-4 border-3 border-cb-black-pure bg-cb-yellow-neon text-cb-black-pure font-tech text-sm font-bold uppercase hover:bg-cb-white-tech transition-all shadow-[4px_4px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        >
                            <LogIn /> Iniciar Sesión
                        </Link>
                        <Link to="/registro" className="btn-primary py-3 px-6 text-sm">
                            Inscribirse
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-cb-black-pure border-t-4 border-cb-yellow-neon py-4 px-4 flex flex-col gap-3">
                        <Link 
                            to="/login" 
                            className="flex items-center justify-center gap-2 px-5 py-3 border-3 border-cb-yellow-neon bg-cb-yellow-neon text-cb-black-pure font-tech text-sm font-bold uppercase hover:bg-cb-white-tech transition-colors shadow-[3px_3px_0_#000]"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <LogIn size={16} /> Iniciar Sesión
                        </Link>
                        <Link 
                            to="/registro" 
                            className="btn-primary py-3 px-6 text-sm text-center"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Inscribirse
                        </Link>
                    </div>
                )}
            </header>

            {/* Hero Section V2 (Extreme Grunge) */}
            <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 lg:pt-48 lg:pb-32 px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[85vh] md:min-h-[90vh] text-center border-b-8 border-cb-black-pure overflow-hidden">
                {/* Rayos/Speedlines Background Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwb2wiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0yMCAwbDJwLTEwaDEwbDItMTBoLTEyem0tMTAtMTBsMmwtMTBoMTBsMi0xMGgtMTJ6IiBmaWxsPSIjMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcG9sKSIvPjwvc3ZnPg==')] mix-blend-overlay" />
                
                {/* Cinta de peligro flotante */}
                <div className="absolute top-24 -left-10 w-[120%] h-8 bg-warning-tape -rotate-3 border-y-4 border-cb-black-pure z-0 shadow-block-sm" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center"
                >
                    {/* Badge impactante */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-cb-black-pure text-cb-yellow-neon border-2 border-cb-yellow-neon font-tech text-xs tracking-[0.2em] mb-8 rotate-[-2deg] shadow-block-sm uppercase">
                        <span>SISTEMA OFICIAL ABIERTO</span>
                    </div>

                    <h1 className="flex justify-center mb-6 md:mb-8 relative">
                        <img src="/logo-yellow.png" alt="CatoBots Logo" className="h-32 md:h-48 lg:h-[28rem] w-auto drop-shadow-[8px_8px_0_rgba(0,0,0,1)]" />
                    </h1>
                    
                    <div className="text-xl md:text-3xl lg:text-5xl font-tech uppercase text-cb-black-pure mb-6 md:mb-10 tracking-wider font-extrabold leading-none" style={{ textShadow: "4px 4px 0 #FFF" }}>
                        LA BATALLA COMIENZA.<br className="md:hidden" />
                        <span className="text-cb-white-tech" style={{ textShadow: "4px 4px 0 #000" }}>CONSTRUYE.</span> <span className="text-cb-yellow-warning" style={{ textShadow: "4px 4px 0 #000" }}>COMPITE.</span> <span className="text-cb-black-pure" style={{ textShadow: "4px 4px 0 #FFF" }}>DOMINA.</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-xs md:text-sm font-tech font-bold">
                        <div className="flex items-center gap-2 md:gap-3 bg-cb-black-pure text-cb-white-tech px-4 md:px-6 py-3 md:py-4 border-4 border-cb-black-pure shadow-block-yellow rotate-1">
                            <CalendarDays className="text-cb-yellow-neon w-5 md:w-6" /> <span className="whitespace-nowrap">20 de Marzo 2026</span>
                        </div>
                        <a href="https://maps.app.goo.gl/FjRKZn9o9d1hV2nA7" target="_blank" rel="noreferrer" className="flex items-center gap-2 md:gap-3 bg-cb-white-tech text-cb-black-pure px-4 md:px-6 py-3 md:py-4 border-4 border-cb-black-pure shadow-block-md rotate-[-1deg] hover:bg-cb-yellow-neon hover:text-cb-black-pure transition-colors cursor-pointer group">
                            <MapPin size={20} className="md:w-6 md:h-6 group-hover:text-cb-black-pure transition-colors" /> 
                            <span className="text-xs md:text-sm">Complejo Deportivo Banco Central</span>
                        </a>
                    </div>
                </motion.div>
                
                {/* Cinta de peligro inferior */}
                <div className="absolute bottom-10 -right-10 w-[120%] h-12 bg-warning-tape rotate-2 border-y-4 border-cb-black-pure z-0 shadow-block-sm" />
            </section>

            {/* Steps Section V2 (Solid Blocks) */}
            <section className="py-12 md:py-24 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-8 md:mb-16">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-tech text-cb-black-pure mb-2 md:mb-4 uppercase drop-shadow-[4px_4px_0_#FFF]">
                        PROCESO DE INSCRIPCIÓN
                    </h2>
                    <p className="text-cb-black-pure font-bold font-sans text-sm md:text-lg">
                        Sigue estos 5 pasos para asegurar tu lugar en la arena.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20, y: 20 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.2 }}
                            className={`
                                relative p-4 md:p-8 bg-cb-black-pure border-4 border-cb-black-pure shadow-block-lg
                                hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-75 group
                                ${index === 3 ? "md:col-span-2 lg:col-span-1" : ""}
                                ${index === 4 ? "md:col-span-2 lg:col-span-1 md:mx-auto lg:mx-0" : ""}
                            `}
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 flex items-center justify-center bg-cb-white-tech border-4 border-cb-black-pure shadow-block-sm group-hover:bg-cb-yellow-neon transition-colors duration-75">
                                <step.icon size={24} className="md:w-8 md:h-8 text-cb-black-pure" />
                            </div>
                            
                            <div className="absolute top-4 right-4 text-7xl font-tech text-white/[0.05] select-none font-extrabold group-hover:text-cb-yellow-neon/20 transition-colors">
                                0{step.id}
                            </div>
                            
                            <h3 className="text-lg md:text-2xl font-tech font-extrabold text-cb-white-tech mb-2 md:mb-3 uppercase tracking-wider group-hover:text-cb-yellow-neon transition-colors">{step.title}</h3>
                            
                            <p className="text-neutral-300 text-xs md:text-sm leading-relaxed font-sans font-medium">
                                {step.description}
                            </p>
                            
                            {/* Accent line simulating a barcode/tech mark */}
                            <div className="absolute bottom-4 right-4 flex gap-1">
                                <div className="w-1 h-4 bg-cb-yellow-neon" />
                                <div className="w-2 h-4 bg-cb-yellow-neon" />
                                <div className="w-1 h-4 bg-cb-yellow-neon" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Payment Info Preview (Fighting Game Select Style) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 md:mt-32 w-full max-w-5xl bg-cb-black-pure border-4 md:border-8 border-cb-black-pure p-4 md:p-8 lg:p-12 relative shadow-block-lg rotate-1"
                >
                    <div className="absolute top-0 right-0 w-full h-3 md:h-4 bg-warning-tape -translate-y-full" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center relative z-10">
                        <div>
                            <h2 className="text-2xl md:text-4xl font-tech text-cb-yellow-neon mb-3 md:mb-4 uppercase drop-shadow-[2px_2px_0_#FFF]">INFO DE PAGO</h2>
                            <p className="text-cb-white-tech font-bold mb-4 md:mb-8 font-sans text-sm md:text-base">
                                Habilita tu participación transfiriendo a nuestras coordenadas.
                                COSTO: <span className="text-cb-yellow-neon bg-cb-black-pure px-2 py-1">$10.00</span> por equipo.
                            </p>

                            <div className="space-y-3 md:space-y-6">
                                <div className="flex items-center gap-3 md:gap-5 bg-cb-white-tech p-3 md:p-4 border-4 border-cb-black-pure shadow-block-sm group hover:-translate-y-1 transition-transform duration-75">
                                    <div className="bg-cb-black-pure p-2 md:p-3">
                                        <Zap className="text-cb-yellow-neon w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div>
                                        <p className="text-cb-black-pure text-xs font-black uppercase tracking-widest font-tech mb-0.5">Entidad Financiera</p>
                                        <p className="text-cb-green-dark font-tech font-bold text-base md:text-xl uppercase">Cooperativa Biblián</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 md:gap-5 bg-cb-white-tech p-3 md:p-4 border-4 border-cb-black-pure shadow-block-sm group hover:-translate-y-1 transition-transform duration-75">
                                    <div className="bg-cb-black-pure p-2 md:p-3">
                                        <Bot className="text-cb-yellow-neon w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="w-full text-cb-black-pure">
                                        <p className="text-cb-black-pure text-xs font-black uppercase tracking-widest font-tech mb-0.5">Número de Cuenta Ahorros</p>
                                        <p className="font-tech tracking-wider text-lg md:text-2xl mb-1 text-black font-black">0212011159836</p>
                                        
                                        <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm pt-2 border-t-2 border-cb-black-pure">
                                            <div>
                                                <p className="text-xs uppercase font-black font-sans">Beneficiario:</p>
                                                <p className="font-bold text-xs">Segundo Pauta</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase font-black font-sans">ID:</p>
                                                <p className="font-bold text-xs">0101995843</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative group hidden md:block">
                            <div className="absolute inset-0 bg-cb-black-pure translate-x-4 translate-y-4" />
                            <img
                                src="/src/assets/pago.png"
                                alt="Información de Pago"
                                className="relative z-10 border-4 border-cb-black-pure grayscale hover:grayscale-0 transition-all duration-300"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Final CTA & Checkbox (Aggressive) */}
                <div className="mt-12 md:mt-24 text-center pb-8 md:pb-16 max-w-xl mx-auto px-2">
                    <div id="registro-check" className="bg-cb-white-tech border-4 border-cb-black-pure p-3 md:p-4 mb-6 md:mb-10 shadow-block-sm -rotate-1 relative">
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-cb-black-pure z-10" />
                        <label className="flex items-center gap-3 md:gap-4 cursor-pointer group p-2 relative z-20">
                            <div className="relative flex-shrink-0">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <div className={`w-8 h-8 md:w-10 md:h-10 border-4 transition-all duration-75 flex items-center justify-center ${accepted
                                    ? "bg-cb-green-vibrant border-cb-black-pure shadow-[2px_2px_0_#000]"
                                    : "bg-white border-cb-black-pure hover:bg-neutral-200 shadow-none"
                                    }`}>
                                    {accepted && <ShieldCheck size={20} className="text-cb-black-pure md:w-6 md:h-6" strokeWidth={3} />}
                                </div>
                            </div>
                            <span className="text-xs md:text-base text-cb-black-pure text-left font-black uppercase leading-tight select-none">
                                CONFIRMO QUE LOS SISTEMAS Y REQUERIMIENTOS ESTÁN LISTOS PARA EL ENLACE DE REGISTRO.
                            </span>
                        </label>
                    </div>

                    <Link
                        to={accepted ? "/registro" : "#"}
                        onClick={(e) => !accepted && e.preventDefault()}
                        className={`inline-flex items-center justify-center gap-2 md:gap-3 w-full md:w-auto text-base md:text-xl ${accepted
                            ? "btn-primary"
                            : "bg-neutral-400 text-neutral-600 px-6 md:px-8 py-3 md:py-4 border-4 border-neutral-500 font-tech uppercase tracking-widest font-extrabold cursor-not-allowed grayscale"
                            }`}
                    >
                        INICIALIZAR REGISTRO <Terminal size={20} className="md:w-6 md:h-6" strokeWidth={3} />
                    </Link>

                    <div className="mt-8 md:mt-14 flex flex-col md:flex-row justify-center gap-3 md:gap-10 text-xs font-tech font-bold uppercase underline decoration-2 underline-offset-4 text-cb-black-pure">
                        <a href="#" className="hover:text-cb-yellow-warning hover:bg-cb-black-pure px-2 py-1 transition-colors flex items-center justify-center gap-2">
                            <FileCode2 size={14} className="md:w-4 md:h-4" strokeWidth={3} /> REGLAMENTO OFICIAL
                        </a>
                        <a href="#" className="hover:text-cb-yellow-warning hover:bg-cb-black-pure px-2 py-1 transition-colors">TÉRMINOS DEL EVENTO</a>
                        <a href="#" className="hover:text-cb-white-tech hover:bg-cb-black-pure px-2 py-1 transition-colors">SOPORTE</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
