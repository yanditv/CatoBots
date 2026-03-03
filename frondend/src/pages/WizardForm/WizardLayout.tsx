import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, ChevronLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface WizardLayoutProps {
    currentStep: number;
    totalSteps: number;
    steps: {
        id: number;
        title: string;
        description: string;
    }[];
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    showSteps?: boolean;
}

export default function WizardLayout({
    currentStep,
    totalSteps,
    steps,
    children,
    title,
    subtitle,
    showSteps = true
}: WizardLayoutProps) {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

    // Background logos for the content area
    const backgroundLogos = [
        { id: 101, top: "-10%", left: "-5%", size: "w-[400px] md:w-[600px]", rotate: [-10, 5, -10], scale: [1, 1.05, 1], opacity: [0.01, 0.03, 0.01], duration: 30, delay: 0 },
        { id: 102, top: "60%", left: "55%", size: "w-[350px] md:w-[500px]", rotate: [15, -10, 15], scale: [1, 1.08, 1], opacity: [0.01, 0.04, 0.01], duration: 35, delay: 5 },
        { id: 1, top: "8%", left: "70%", size: "w-20 md:w-32", rotate: [10, -5, 10], scale: [1, 1.1, 1], opacity: [0.04, 0.08, 0.04], duration: 18, delay: 0 },
        { id: 2, top: "40%", left: "5%", size: "w-16 md:w-24", rotate: [-15, 10, -15], scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06], duration: 22, delay: 2 },
        { id: 3, top: "75%", left: "80%", size: "w-24 md:w-40", rotate: [5, -10, 5], scale: [1, 1.15, 1], opacity: [0.05, 0.1, 0.05], duration: 25, delay: 1 },
        { id: 4, top: "25%", left: "85%", size: "w-12 md:w-20", rotate: [-20, 20, -20], scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08], duration: 15, delay: 4 },
        { id: 5, top: "55%", left: "30%", size: "w-12 md:w-16", rotate: [45, 0, 45], scale: [1, 1.2, 1], opacity: [0.07, 0.14, 0.07], duration: 20, delay: 3 },
        { id: 6, top: "90%", left: "15%", size: "w-16 md:w-24", rotate: [15, -10, 15], scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06], duration: 21, delay: 5 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-cb-green-vibrant to-cb-green-dark bg-noise text-cb-black-pure font-sans overflow-x-hidden relative">

            {/* ==================== MOBILE HEADER ==================== */}
            <div className="md:hidden sticky top-0 z-50">
                {/* Warning Tape Top Decoration */}
                <div className="h-2 bg-warning-tape" />
                
                {/* Main Mobile Header */}
                <div className="bg-cb-black-pure border-b-4 border-cb-black-pure">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link to="/" className="text-cb-white-tech font-tech text-xs uppercase flex items-center gap-1 hover:text-cb-yellow-neon transition-colors">
                            <ChevronLeft size={16} strokeWidth={3} />
                            SALIR
                        </Link>
                        <div className="text-center">
                            <h1 className="text-lg font-tech font-black text-cb-yellow-neon uppercase italic tracking-tight"
                                style={{ WebkitTextStroke: "1px #000" }}
                            >
                                {title}
                            </h1>
                        </div>
                        <div className="w-8 h-8 bg-cb-gray-industrial flex items-center justify-center border-2 border-cb-yellow-neon">
                            <ShieldCheck size={16} className="text-cb-yellow-neon" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Mobile Step Info & Progress */}
                    {showSteps && (
                        <div className="px-4 pb-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-tech text-cb-yellow-neon text-xs font-bold uppercase tracking-widest">
                                    PASO {currentStep}/{totalSteps}
                                </span>
                                <span className="font-tech text-cb-white-tech text-xs font-bold uppercase">
                                    {steps.find(s => s.id === currentStep)?.title}
                                </span>
                            </div>
                            <div className="w-full bg-cb-gray-industrial h-3 border-2 border-cb-white-tech/20 relative overflow-hidden">
                                <motion.div
                                    className="h-full bg-cb-yellow-neon"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                />
                                {/* Scanline effect on progress */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, #000 4px, #000 5px)'
                                }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ==================== MAIN LAYOUT ==================== */}
            <div className="flex min-h-screen">

                {/* ==================== DESKTOP SIDEBAR ==================== */}
                <aside className="hidden md:flex flex-col w-[280px] lg:w-[320px] bg-cb-black-pure border-r-8 border-cb-black-pure fixed top-0 left-0 h-screen sidebar-noise z-30 overflow-hidden">
                    {/* Warning Tape Top */}
                    <div className="h-3 bg-warning-tape shrink-0" />

                    {/* Sidebar Header */}
                    <div className="p-6 pb-4 shrink-0">
                        {/* Back Link */}
                        <Link to="/" className="inline-flex items-center gap-2 text-cb-white-tech font-tech text-xs uppercase hover:text-cb-yellow-neon transition-colors duration-75 mb-4 group">
                            <ChevronLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform duration-75" />
                            RETIRADA ESTRATÉGICA
                        </Link>

                        {/* Logo */}
                        <div className="flex justify-center mb-3">
                            <img src="/logo-yellow.png" alt="CatoBots" className="w-36 h-auto object-contain" />
                        </div>

                        {/* Logo replaces title */}
                        {subtitle && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="mt-3 bg-cb-gray-industrial text-cb-yellow-neon px-3 py-1.5 border-2 border-cb-yellow-neon/30 font-tech text-[11px] tracking-[0.15em] uppercase inline-flex items-center gap-2 w-full justify-center"
                            >
                                <span className="w-1.5 h-1.5 bg-cb-yellow-neon animate-pulse" />
                                {subtitle}
                            </motion.div>
                        )}
                    </div>

                    {/* Divider Tape */}
                    <div className="h-2 bg-warning-tape mx-4 shrink-0" />

                    {/* Step Tracker — Vertical */}
                    {showSteps && (
                        <nav className="flex-1 overflow-y-auto custom-scrollbar px-5 py-6">
                            <div className="relative">
                                {steps.map((step, index) => {
                                    const isCompleted = step.id < currentStep;
                                    const isCurrent = step.id === currentStep;
                                    const isLast = index === steps.length - 1;

                                    return (
                                        <div key={step.id} className="relative flex gap-4 items-start">
                                            {/* Vertical Connector Line */}
                                            {!isLast && (
                                                <div className="absolute top-10 left-[18px] w-1 bottom-0 bg-neutral-600">
                                                    {isCompleted && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: "100%" }}
                                                            transition={{ duration: 0.3 }}
                                                            className="w-full bg-cb-yellow-neon"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* Node / Number Circle */}
                                            <motion.div
                                                animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                                                transition={isCurrent ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                                                className={`relative z-10 w-9 h-9 flex items-center justify-center border-4 font-tech text-sm font-black shrink-0 transition-all duration-150
                                                    ${isCompleted
                                                        ? "bg-cb-yellow-neon border-cb-yellow-neon text-cb-black-pure shadow-[2px_2px_0_#FFF000]"
                                                        : isCurrent
                                                            ? "bg-cb-black-pure border-cb-yellow-neon text-cb-yellow-neon shadow-[3px_3px_0_#FFF000]"
                                                            : "bg-cb-gray-industrial border-cb-white-tech/40 text-cb-white-tech/70"
                                                    }`}
                                            >
                                                {isCompleted ? <Check size={18} strokeWidth={3.5} /> : step.id}
                                            </motion.div>

                                            {/* Step Label */}
                                            <div className={`pb-6 pt-1 transition-all duration-150 ${isCurrent ? "opacity-100" : isCompleted ? "opacity-80" : "opacity-70"}`}>
                                                <p className={`font-tech text-sm font-black uppercase tracking-wider leading-tight
                                                    ${isCurrent ? "text-cb-yellow-neon" : isCompleted ? "text-cb-white-tech" : "text-cb-white-tech/80"}`}
                                                >
                                                    {step.title}
                                                </p>
                                                <p className={`font-sans text-[10px] font-bold uppercase tracking-wide mt-0.5
                                                    ${isCurrent ? "text-cb-white-tech" : isCompleted ? "text-neutral-400" : "text-neutral-400"}`}
                                                >
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </nav>
                    )}

                    {/* Sidebar Footer — Shield */}
                    <div className="shrink-0 p-5 border-t-4 border-neutral-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cb-gray-industrial flex items-center justify-center border-2 border-cb-yellow-neon/40">
                                <ShieldCheck size={22} className="text-cb-yellow-neon" strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="font-tech text-[10px] font-bold text-neutral-500 uppercase tracking-widest">IV EDICIÓN</p>
                                <p className="font-tech text-xs font-bold text-cb-white-tech uppercase">REGISTRO OFICIAL</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning Tape Bottom */}
                    <div className="h-3 bg-warning-tape shrink-0" />
                </aside>

                {/* ==================== MAIN CONTENT AREA ==================== */}
                <main className="flex-1 relative min-h-screen md:ml-[280px] lg:ml-[320px]">
                    {/* Background Effect Layer (confined to main area) */}
                    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden md:left-[280px] lg:left-[320px]">
                        {/* Tech Grid Pattern */}
                        <div className="absolute inset-0 opacity-[0.15] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBWNDBIMHptMzkuNSAwdjEwaDFWMEg0MHoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] mix-blend-overlay bg-repeat" />
                        
                        {/* Dynamic Step-and-Repeat background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {backgroundLogos.map((logo) => (
                                <motion.img
                                    key={logo.id}
                                    src="/logo-yellow.png"
                                    alt=""
                                    initial={{
                                        scale: logo.scale[0],
                                        rotate: logo.rotate[0],
                                        opacity: logo.opacity[0]
                                    }}
                                    animate={{
                                        scale: logo.scale,
                                        rotate: logo.rotate,
                                        opacity: logo.opacity
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: logo.duration,
                                        delay: logo.delay,
                                        ease: "easeInOut"
                                    }}
                                    className={`absolute ${logo.size} h-auto object-contain`}
                                    style={{
                                        top: logo.top,
                                        left: logo.left
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 w-full max-w-4xl mx-auto py-6 md:py-10 px-4 sm:px-6 lg:px-10">

                        {/* Form Container */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                                className="w-full bg-cb-white-tech border-8 border-cb-black-pure shadow-block-lg min-h-[500px] relative p-6 md:p-10 lg:p-12"
                            >
                                {/* Warning Tape Decorations */}
                                <div className="absolute top-0 left-0 w-full h-3 bg-warning-tape -translate-y-[6px]" />
                                <div className="absolute bottom-0 left-0 w-full h-3 bg-warning-tape translate-y-[6px]" />

                                {/* Corner Decorations */}
                                <div className="absolute -top-2 -left-2 w-4 h-4 bg-cb-yellow-neon border-2 border-cb-black-pure hidden md:block" />
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-cb-yellow-neon border-2 border-cb-black-pure hidden md:block" />
                                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-cb-black-pure border-2 border-cb-yellow-neon hidden md:block" />
                                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-cb-black-pure border-2 border-cb-yellow-neon hidden md:block" />

                                {/* Step content */}
                                <div className="w-full relative z-10">
                                    {children}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Mobile Step Dots (bottom summary) */}
                        {showSteps && (
                            <div className="md:hidden flex justify-center gap-2 mt-6 mb-4">
                                {steps.map((step) => (
                                    <div
                                        key={step.id}
                                        className={`h-2 transition-all duration-150 border border-cb-black-pure
                                            ${step.id === currentStep
                                                ? "w-8 bg-cb-yellow-neon shadow-[2px_2px_0_#000]"
                                                : step.id < currentStep
                                                    ? "w-4 bg-cb-green-vibrant"
                                                    : "w-4 bg-cb-white-tech/50"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
