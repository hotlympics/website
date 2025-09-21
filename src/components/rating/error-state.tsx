interface ErrorStateProps {
    error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-32">
            <p className="mb-4 text-xl text-red-400">{error}</p>
            <span className="text-gray-300">
                We encountered an error. Please refresh the page
            </span>
        </div>
    );
};
