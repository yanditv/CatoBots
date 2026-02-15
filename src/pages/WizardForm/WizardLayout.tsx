import { motion } from "framer-motion";
import { Check } from "lucide-react";
import React from "react";

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

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-purple-500/30 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400"
                    >
                        {title}
                    </motion.h1>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-neutral-400 mt-2"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>

                {/* Steps Indicator */}
                {showSteps && (
                    <div className="mb-12">
                        {/* Mobile Progress Bar */}
                        <div className="md:hidden w-full bg-neutral-800 h-2 rounded-full overflow-hidden mb-4">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Desktop Steps */}
                        <div className="hidden md:flex justify-between items-center relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-800 -z-10 transform -translate-y-1/2" />
                            <motion.div
                                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 -z-10 transform -translate-y-1/2 origin-left"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: Math.max(0, (currentStep - 1) / (totalSteps - 1)) }}
                                transition={{ duration: 0.5 }}
                                style={{ width: "100%" }}
                            />

                            {steps.map((step) => {
                                const isCompleted = step.id < currentStep;
                                const isCurrent = step.id === currentStep;

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2 relative">
                                        <motion.div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 z-10 ${isCompleted
                                                    ? "bg-purple-600 border-purple-600 text-white"
                                                    : isCurrent
                                                        ? "bg-neutral-950 border-purple-500 text-purple-400"
                                                        : "bg-neutral-950 border-neutral-700 text-neutral-500"
                                                }`}
                                            animate={{ scale: isCurrent ? 1.1 : 1 }}
                                        >
                                            {isCompleted ? <Check size={20} /> : step.id}
                                        </motion.div>
                                        <div className="absolute top-14 w-32 text-center text-sm font-medium">
                                            <span className={`${isCurrent ? "text-white" : "text-neutral-500"}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Content Container */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl shadow-purple-900/10 min-h-[400px]"
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
