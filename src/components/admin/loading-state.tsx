interface LoadingStateProps {
    message?: string;
    className?: string;
}

const LoadingState = ({
    message = "Loading...",
    className = "",
}: LoadingStateProps) => {
    return (
        <div
            className={`flex min-h-screen items-center justify-center bg-gray-50 ${className}`}
        >
            <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <div className="text-lg text-gray-600">{message}</div>
            </div>
        </div>
    );
};

export default LoadingState;
