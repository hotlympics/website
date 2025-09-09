interface RefreshButtonProps {
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
}

const RefreshButton = ({
    onClick,
    loading = false,
    disabled = false,
    className = "",
}: RefreshButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 ${className}`}
        >
            <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
            </svg>
            {loading ? "Loading..." : "Refresh"}
        </button>
    );
};

export default RefreshButton;