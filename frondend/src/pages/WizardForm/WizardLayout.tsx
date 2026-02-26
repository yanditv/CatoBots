import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
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
    // Calculate progress percentage
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

    // Background logos data for "Step-and-Repeat" animated backdrop effect
    const backgroundLogos = [
        // --- Massive Background Watermarks (Very faint, anchors) ---
        { id: 101, top: "-10%", left: "-10%", size: "w-[600px] md:w-[900px]", rotate: [-10, 5, -10], scale: [1, 1.05, 1], opacity: [0.01, 0.03, 0.01], duration: 30, delay: 0 },
        { id: 102, top: "60%", left: "60%", size: "w-[500px] md:w-[800px]", rotate: [15, -10, 15], scale: [1, 1.08, 1], opacity: [0.01, 0.04, 0.01], duration: 35, delay: 5 },
        { id: 103, top: "30%", left: "30%", size: "w-[400px] md:w-[700px]", rotate: [-5, 15, -5], scale: [1, 1.03, 1], opacity: [0.01, 0.02, 0.01], duration: 40, delay: 2 },

        // --- Step-and-Repeat Grid Layout (No overlaps, very faint visibility) ---
        // Row 1 (y: ~5-10%)
        { id: 1, top: "8%", left: "5%", size: "w-20 md:w-32", rotate: [10, -5, 10], scale: [1, 1.1, 1], opacity: [0.04, 0.08, 0.04], duration: 18, delay: 0 },
        { id: 2, top: "5%", left: "35%", size: "w-16 md:w-24", rotate: [-15, 10, -15], scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06], duration: 22, delay: 2 },
        { id: 3, top: "10%", left: "65%", size: "w-24 md:w-40", rotate: [5, -10, 5], scale: [1, 1.15, 1], opacity: [0.05, 0.1, 0.05], duration: 25, delay: 1 },
        { id: 4, top: "6%", left: "85%", size: "w-12 md:w-20", rotate: [-20, 20, -20], scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08], duration: 15, delay: 4 },

        // Row 2 (y: ~25-30%)
        { id: 5, top: "30%", left: "15%", size: "w-12 md:w-16", rotate: [45, 0, 45], scale: [1, 1.2, 1], opacity: [0.07, 0.14, 0.07], duration: 20, delay: 3 },
        { id: 6, top: "25%", left: "45%", size: "w-32 md:w-48", rotate: [-5, 5, -5], scale: [1, 1.05, 1], opacity: [0.03, 0.08, 0.03], duration: 28, delay: 1 },
        { id: 7, top: "28%", left: "80%", size: "w-20 md:w-32", rotate: [15, -15, 15], scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05], duration: 24, delay: 5 },

        // Row 3 (y: ~50%)
        { id: 8, top: "50%", left: "5%", size: "w-24 md:w-36", rotate: [-10, 10, -10], scale: [1, 1.15, 1], opacity: [0.04, 0.09, 0.04], duration: 26, delay: 0 },
        { id: 9, top: "45%", left: "75%", size: "w-16 md:w-24", rotate: [20, -20, 20], scale: [1, 1.25, 1], opacity: [0.06, 0.12, 0.06], duration: 19, delay: 2 },

        // Row 4 (y: ~70-75%)
        { id: 10, top: "75%", left: "15%", size: "w-32 md:w-48", rotate: [5, -5, 5], scale: [1, 1.08, 1], opacity: [0.03, 0.07, 0.03], duration: 29, delay: 4 },
        { id: 11, top: "70%", left: "40%", size: "w-12 md:w-20", rotate: [-25, 25, -25], scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08], duration: 17, delay: 1 },
        { id: 12, top: "73%", left: "65%", size: "w-20 md:w-28", rotate: [10, -15, 10], scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05], duration: 23, delay: 6 },
        { id: 13, top: "68%", left: "85%", size: "w-40 md:w-56", rotate: [-10, 5, -10], scale: [1, 1.05, 1], opacity: [0.03, 0.08, 0.03], duration: 32, delay: 2 },

        // Row 5 (y: ~85-95%)
        { id: 14, top: "90%", left: "8%", size: "w-16 md:w-24", rotate: [15, -10, 15], scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06], duration: 21, delay: 5 },
        { id: 15, top: "93%", left: "35%", size: "w-24 md:w-36", rotate: [-5, 15, -5], scale: [1, 1.1, 1], opacity: [0.04, 0.09, 0.04], duration: 25, delay: 0 },
        { id: 16, top: "85%", left: "60%", size: "w-12 md:w-16", rotate: [30, -30, 30], scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08], duration: 16, delay: 3 },
        { id: 17, top: "89%", left: "90%", size: "w-20 md:w-32", rotate: [-15, 0, -15], scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05], duration: 27, delay: 1 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-cb-green-vibrant to-cb-green-dark bg-noise text-cb-black-pure font-sans overflow-x-hidden relative flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
            
            {/* --- CREATIVE BACKGROUND ELEMENTS --- */}
            {/* Using fixed inset-0 keeps it glued to the screen while you scroll */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Tech Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.2] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBWNDBIMHptMzkuNSAwdjEwaDFWMEg0MHoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] mix-blend-overlay bg-repeat" />
                
                {/* Removed mix-blend-overlay to let the bright yellow shine cleanly through its standard opacity */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">

                    {/* Dynamic Step-and-Repeat background grid */}
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
            {/* Nav Back Header (Minimal Aggressive) */}
            <div className="absolute top-4 left-4 z-50">
                <Link to="/" className="inline-flex items-center gap-2 bg-cb-black-pure text-cb-white-tech px-4 py-2 border-2 border-cb-black-pure font-tech text-xs uppercase hover:text-cb-yellow-neon shadow-block-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                    ← RETIRADA ESTRATÉGICA
                </Link>
            </div>

            <div className="relative z-10 w-full max-w-5xl mt-8">
                {/* Header (Text and Title) */}
                <div className="mb-8 md:mb-12 text-center md:text-left flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        {/* Fused Logo + "IV" Container */}
                        <div className="flex items-center justify-center md:justify-start -ml-2">
                            <img 
                                src="/logo-yellow.png" 
                                alt="CatoBots Logo" 
                                className="h-24 md:h-35 w-auto object-contain drop-shadow-[5px_2px_0_#000] z-10" 
                            />
                            <motion.h1
                                initial={{ opacity: 0, x: -10, y:10, rotate: -4 }}
                                animate={{ opacity: 1, x: 20, rotate: -4 }}
                                className="text-5xl mt-6 md:text-7xl lg:text-8xl font-tech font-black uppercase text-cb-yellow-neon leading-none italic tracking-tighter drop-shadow-[5px_5px_0_#000] -ml-5 z-0"
                                style={{ WebkitTextStroke: "3px #000" }}
                            >
                                {title}
                            </motion.h1>
                        </div>
                        {subtitle && (
                            <div className="mt-2 md:pl-0">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="inline-block bg-cb-black-pure text-cb-yellow-warning px-4 py-2 border-2 border-cb-black-pure font-tech text-sm md:text-base tracking-[0.2em] shadow-block-sm -rotate-2"
                                >
                                    <span className="w-2 h-2 rounded-full bg-cb-yellow-warning inline-block mr-2 animate-pulse" />
                                    {subtitle}
                                </motion.div>
                            </div>
                        )}
                    </div>
                    {/* Badge/Seal */}
                    <div className="w-20 h-20 bg-cb-black-pure flex items-center justify-center border-4 border-cb-black-pure shadow-block-sm rotate-6">
                        <ShieldCheck size={40} className="text-cb-yellow-neon" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Tracking / Steps Indicator (Industrial Bar) */}
                {showSteps && (
                    <div className="mb-14 px-2">
                        {/* Mobile Progress Bar (Tape) */}
                        <div className="md:hidden w-full bg-cb-black-pure h-4 border-2 border-cb-black-pure mb-6 relative overflow-hidden">
                            <motion.div
                                className="h-full bg-cb-yellow-neon"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>

                        {/* Desktop Steps Grid */}
                        <div className="hidden md:flex justify-between items-center relative py-6">
                            {/* Connecting Line (Massive Black Bar) */}
                            <div className="absolute top-1/2 left-[5%] right-[5%] h-2 bg-cb-black-pure -z-10 transform -translate-y-1/2" />
                            
                            {/* Loading Bar (Yellow Overlay) */}
                            <motion.div
                                className="absolute top-1/2 left-[5%] h-2 bg-cb-yellow-neon -z-10 transform -translate-y-1/2 origin-left shadow-[0_0_10px_rgba(255,240,0,0.8)]"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: Math.max(0, (currentStep - 1) / (totalSteps - 1)) }}
                                transition={{ duration: 0.5, ease: "circOut" }}
                                style={{ width: "90%" }}
                            />

                            {steps.map((step) => {
                                const isCompleted = step.id < currentStep;
                                const isCurrent = step.id === currentStep;

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2 relative group w-1/6">
                                        <motion.div
                                            className={`w-12 h-12 flex items-center justify-center border-4 font-tech text-xl transition-all duration-300 z-10 shadow-block-sm
                                                ${isCompleted
                                                    ? "bg-cb-yellow-neon border-cb-black-pure text-cb-black-pure"
                                                    : isCurrent
                                                        ? "bg-cb-black-pure border-cb-yellow-neon text-cb-yellow-neon -translate-y-2 shadow-[4px_10px_0_#000]"
                                                        : "bg-cb-white-tech border-cb-black-pure text-cb-black-pure grayscale"
                                                }`}
                                        >
                                            {isCompleted ? <Check size={28} strokeWidth={3} /> : step.id}
                                        </motion.div>
                                        
                                        {/* Status Text (Below Icon) */}
                                        <div className={`absolute top-16 text-center w-max max-w-[120px] transition-colors ${isCurrent ? "font-black" : "font-bold"}`}>
                                            <span className={`block text-xs uppercase tracking-widest leading-tight ${isCurrent ? "text-cb-black-pure drop-shadow-[1px_1px_0_#FFF]" : isCompleted ? "text-cb-black-pure" : "text-cb-black-pure/50"}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Massive Form Container */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20, rotateX: 10 }}
                    animate={{ opacity: 1, x: 0, rotateX: 0 }}
                    exit={{ opacity: 0, x: -20, rotateX: -10 }}
                    transition={{ duration: 0.3, type: "spring" }}
                    className="w-full bg-cb-white-tech border-8 border-cb-black-pure shadow-block-lg min-h-[500px] relative mt-10 md:mt-4 p-8 md:p-12 mb-20"
                >
                    {/* Warning Tape Headers */}
                    <div className="absolute top-0 left-0 w-full h-4 bg-warning-tape -translate-y-[8px]" />
                    <div className="absolute bottom-0 left-0 w-full h-4 bg-warning-tape translate-y-[8px]" />
                    
                    {/* Main Children rendering for the Step */}
                    <div className="w-full relative z-10">
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
