interface DemoBannerProps {
    className?: string;
}

const DemoBanner = ({ className = "" }: DemoBannerProps) => {
    return (
        <div className={`border-b border-blue-500 bg-blue-600 ${className}`}>
            <div className="mx-auto max-w-6xl px-4 py-3">
                <div className="flex items-center justify-center text-center">
                    <div className="flex items-center space-x-2">
                        <svg
                            className="h-5 w-5 text-blue-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium text-white">
                            🎪 Demo Mode
                        </span>
                        <span className="text-sm text-blue-100">
                            This is a preview of your photo rating experience
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoBanner;
