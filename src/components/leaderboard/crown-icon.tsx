interface CrownIconProps {
    className?: string;
    size?: number;
}

const CrownIcon = ({ className = "", size = 24 }: CrownIconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M5 16L3 7l5.5 5L12 4l3.5 8L21 7l-2 9H5z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 16h14v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default CrownIcon;
