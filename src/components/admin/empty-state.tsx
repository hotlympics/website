interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

const EmptyState = ({
    title,
    description,
    icon,
    action,
    className = "",
}: EmptyStateProps) => {
    const defaultIcon = (
        <svg
            className="mx-auto mb-3 h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
    );

    return (
        <div className={`py-8 text-center ${className}`}>
            <div className="text-gray-500">
                {icon || defaultIcon}
                <p className="text-lg font-medium">{title}</p>
                {description && <p className="mt-1 text-sm">{description}</p>}
                {action && <div className="mt-4">{action}</div>}
            </div>
        </div>
    );
};

export default EmptyState;
