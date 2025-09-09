interface ErrorMessageProps {
    message: string;
    className?: string;
}

const ErrorMessage = ({ message, className = "" }: ErrorMessageProps) => {
    return (
        <div
            className={`border-l-4 border-red-400 bg-red-50 px-4 py-3 ${className}`}
        >
            <div className="text-sm text-red-700">{message}</div>
        </div>
    );
};

export default ErrorMessage;
