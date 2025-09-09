interface SearchButtonProps {
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    loadingText?: string;
    className?: string;
}

const SearchButton = ({
    onClick,
    loading = false,
    disabled = false,
    loadingText = "Searching...",
    className = "",
}: SearchButtonProps) => {
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
            {loading ? loadingText : "Search"}
        </button>
    );
};

export default SearchButton;