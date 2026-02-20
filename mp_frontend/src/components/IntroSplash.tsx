import { motion, AnimatePresence } from "framer-motion";
import { Store } from "lucide-react";
import { useEffect, useState } from "react";

interface IntroSplashProps {
    onComplete: () => void;
}

const IntroSplash = ({ onComplete }: IntroSplashProps) => {
    const [phase, setPhase] = useState(0); // 0: Logo, 1: Text, 2: Final
    const brandName = "e-pasal";

    useEffect(() => {
        const sequence = async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setPhase(1);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setPhase(2);
            await new Promise((resolve) => setTimeout(resolve, 800));
            onComplete();
        };
        sequence();
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50 dark:bg-[#050505] overflow-hidden">
            {/* Dynamic Background Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -50, 100, 0],
                        scale: [1, 1.2, 0.8, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 50, 0],
                        y: [0, 100, -50, 0],
                        scale: [1, 0.8, 1.2, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px]"
                />
            </div>

            <AnimatePresence mode="wait">
                {phase === 0 && (
                    <motion.div
                        key="logo-phase"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="p-6 rounded-[2.5rem] bg-white dark:bg-gray-900 shadow-2xl shadow-primary/20 border border-white/50 dark:border-gray-800">
                            <Store size={80} className="text-primary animate-pulse" />
                        </div>
                    </motion.div>
                )}

                {phase === 1 && (
                    <motion.div
                        key="text-phase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ y: -20, opacity: 0, filter: "blur(5px)" }}
                        className="flex flex-col items-center"
                    >
                        <div className="flex gap-1 overflow-hidden">
                            {brandName.split("").map((char, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: i * 0.08,
                                        type: "spring",
                                        stiffness: 150,
                                        damping: 12,
                                    }}
                                    className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white"
                                    style={{
                                        fontFamily: "'Poppins', sans-serif",
                                        textShadow: "0 10px 30px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "100%", opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="h-[4px] mt-4 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                        />
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            className="mt-6 text-gray-400 dark:text-gray-500 font-medium tracking-[0.3em] uppercase text-xs"
                        >
                            Your Smart Marketplace
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Finishing Flash */}
            <AnimatePresence>
                {phase === 2 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-white dark:bg-[#050505] z-[110]"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default IntroSplash;
