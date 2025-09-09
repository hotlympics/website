interface InlineLoadingStateProps {
    message?: string;
    className?: string;
}

const InlineLoadingState = ({ 
    message = "Loading...", 
    className = "" 
}: InlineLoadingStateProps) => {
    return (
        <div className={`py-12 text-center ${className}`}>
            <div className="text-lg text-gray-600">{message}</div>
        </div>
    );
};

export default InlineLoadingState;