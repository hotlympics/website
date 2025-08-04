import { useEffect, useState } from "react";

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
}

const PerformanceMonitor = () => {
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Override console.log to capture performance logs
        const originalLog = console.log;
        console.log = (...args: unknown[]) => {
            const message = args[0];
            if (typeof message === "string" && message.includes("[PERF]")) {
                // Parse performance messages
                const matches = message.match(/(\d+(?:\.\d+)?)\s*ms/);
                if (matches) {
                    const duration = parseFloat(matches[1]);
                    const cleanMessage = message
                        .replace("[PERF]", "")
                        .replace(/\sat\s[\d\-T:.Z]+/, "")
                        .replace(/\sin\s\d+(?:\.\d+)?ms/, "")
                        .trim();

                    setMetrics((prev) => [
                        ...prev.slice(-19), // Keep last 20 metrics
                        {
                            name: cleanMessage,
                            duration,
                            timestamp: Date.now(),
                        },
                    ]);
                }
            }
            originalLog.apply(console, args);
        };

        return () => {
            console.log = originalLog;
        };
    }, []);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    const clearMetrics = () => {
        setMetrics([]);
    };

    if (!isVisible) {
        return (
            <button
                onClick={toggleVisibility}
                className="fixed right-4 bottom-4 rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg hover:bg-gray-700"
            >
                Show Performance
            </button>
        );
    }

    return (
        <div className="fixed right-4 bottom-4 max-h-96 w-96 overflow-hidden rounded-lg bg-gray-900 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-700 p-3">
                <h3 className="text-sm font-semibold">Performance Monitor</h3>
                <div className="flex gap-2">
                    <button
                        onClick={clearMetrics}
                        className="rounded px-2 py-1 text-xs hover:bg-gray-700"
                    >
                        Clear
                    </button>
                    <button
                        onClick={toggleVisibility}
                        className="rounded px-2 py-1 text-xs hover:bg-gray-700"
                    >
                        Hide
                    </button>
                </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-3">
                {metrics.length === 0 ? (
                    <p className="text-xs text-gray-400">
                        No performance data yet...
                    </p>
                ) : (
                    <div className="space-y-2">
                        {metrics.map((metric, index) => (
                            <div
                                key={`${metric.timestamp}-${index}`}
                                className="border-b border-gray-800 pb-2 last:border-0"
                            >
                                <div className="text-xs text-gray-300">
                                    {metric.name}
                                </div>
                                <div className="mt-1 font-mono text-sm">
                                    <span
                                        className={
                                            metric.duration > 1000
                                                ? "text-red-400"
                                                : metric.duration > 500
                                                  ? "text-yellow-400"
                                                  : "text-green-400"
                                        }
                                    >
                                        {metric.duration.toFixed(2)}ms
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerformanceMonitor;
