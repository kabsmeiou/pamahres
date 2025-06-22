import { useEffect, useState } from "react";
import { Eye, EyeOff, Clock, Pause } from "react-feather";

const TimeLimitBar = ({ totalMinutes = 10, isPaused = false }: { totalMinutes?: number, isPaused?: boolean }) => {
    const [secondsLeft, setSecondsLeft] = useState((totalMinutes ?? 10) * 60);
    const [showTime, setShowTime] = useState(true);

    useEffect(() => {
        if (isPaused) {
            return;
        }
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused]);

    const percentage = (secondsLeft / (totalMinutes * 60)) * 100;
    
    // Determine color based on time left
    const getColorClass = () => {
        if (percentage > 60) return "bg-gradient-to-r from-green-400 to-green-500 dark:from-green-500 dark:to-green-600";
        if (percentage > 30) return "bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600";
        return "bg-gradient-to-r from-red-400 to-red-500 dark:from-red-500 dark:to-red-600";
    };

    // Format time for display
    const formattedMinutes = Math.floor(secondsLeft / 60);
    const formattedSeconds = String(secondsLeft % 60).padStart(2, "0");

    return (
        <div className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-3">
                {!showTime ? (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                            <Clock size={16} className="text-primary-500 dark:text-primary-400" />
                        </div>
                        <p className="text-surface-700 dark:text-surface-200 text-sm font-medium">
                            <span className="hidden sm:inline">Good luck, have fun!</span>
                            <span className="sm:hidden">Good luck!</span>
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            percentage <= 30 
                                ? "bg-red-100 dark:bg-red-900/30" 
                                : "bg-primary-100 dark:bg-primary-900/30"
                        }`}>
                            <Clock size={16} className={`
                                ${percentage <= 30 
                                    ? "text-red-600 dark:text-red-400" 
                                    : "text-primary-600 dark:text-primary-400"
                                }
                                ${percentage <= 30 && !isPaused ? "animate-pulse" : ""}
                            `} />
                        </div>
                        <span className="text-surface-700 dark:text-surface-200 text-sm font-medium">
                            Time Remaining: <span className={`font-semibold ${
                                percentage <= 30 
                                    ? "text-red-600 dark:text-red-400" 
                                    : "text-surface-900 dark:text-surface-100"
                            }`}>
                                {formattedMinutes}:{formattedSeconds}
                            </span>
                        </span>
                    </div>
                )}

                <button
                    className="p-1.5 rounded-full text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 transition-all"
                    onClick={() => setShowTime(!showTime)}
                    aria-label={showTime ? "Hide time" : "Show time"}
                    title={showTime ? "Hide time" : "Show time"}
                >
                    {showTime ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            <div className="relative w-full h-3 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden shadow-inner">
                <div
                    className={`h-full ${getColorClass()} rounded-full transition-all duration-1000 ease-linear relative`}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                    </div>
                </div>
                
                {isPaused && (
                    <div className="absolute inset-0 bg-surface-100 bg-opacity-70 dark:bg-surface-800 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-200/80 dark:bg-surface-700/80 shadow-sm">
                            <Pause size={12} className="text-surface-500 dark:text-surface-300" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-surface-600 dark:text-surface-300">Paused</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeLimitBar;