import { useEffect, useState } from "react";
import { Eye, EyeOff } from "react-feather";

const TimeLimitBar = ({ totalMinutes = 10, isPaused = false }: { totalMinutes?: number, isPaused?: boolean }) => {
    const [secondsLeft, setSecondsLeft] = useState((totalMinutes ?? 10) * 60);
    const [showTime, setShowTime] = useState(false);

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
        if (percentage > 60) return "bg-green-500 dark:bg-green-600";
        if (percentage > 30) return "bg-yellow-500 dark:bg-yellow-600";
        return "bg-red-500 dark:bg-red-600";
    };

    // Format time for display
    const formattedMinutes = Math.floor(secondsLeft / 60);
    const formattedSeconds = String(secondsLeft % 60).padStart(2, "0");

    return (
        <div className="flex items-center w-full gap-3">
            <div className="w-full">
                {!showTime &&
                    <p className={`flex text-gray-700 dark:text-gray-300 justify-between mb-1.5 text-sm font-medium transition-opacity duration-300`}>Good luck, have fun!</p>
                }
                {showTime && (
                    <div className={`flex justify-between mb-1.5 text-sm font-medium transition-opacity duration-300 ${!showTime ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="flex items-center">
                            <span className="text-gray-700 dark:text-gray-300">
                                Time Remaining: <span className={percentage <= 30 ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-900 dark:text-gray-100"}>
                                    {formattedMinutes}:{formattedSeconds}
                                </span>
                            </span>
                        </div>
                    </div>
                )}
                <div className="relative w-full h-3.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getColorClass()} rounded-full transition-all duration-1000 ease-linear`}
                        style={{ width: `${percentage}%` }}
                    />
                    {isPaused && (
                        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-70 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">PAUSED</span>
                        </div>
                    )}
                </div>
            </div>
            <button
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all duration-200 flex-shrink-0"
                onClick={() => setShowTime(!showTime)}
                aria-label={showTime ? "Hide time" : "Show time"}
                title={showTime ? "Hide time" : "Show time"}
            >
                {showTime ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
};

export default TimeLimitBar;