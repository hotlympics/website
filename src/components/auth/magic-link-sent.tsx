export const MagicLinkSent = ({
    email,
    onBackToSignIn,
}: {
    email: string;
    onBackToSignIn: () => void;
}) => {
    return (
        <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Check Your Email
            </h2>

            <p className="mb-6 text-gray-600">
                We've sent a magic sign-in link to <strong>{email}</strong>
            </p>

            <p className="mb-4 text-sm text-gray-500">
                Click the link in your email to sign in instantly. The link will
                expire in 1 hour.
            </p>

            <div className="mb-6 rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Keep this tab open. You'll be
                    automatically signed in when you click the link.
                </p>
            </div>

            <button
                onClick={onBackToSignIn}
                className="text-blue-600 hover:text-blue-700"
            >
                Use a different email
            </button>
        </div>
    );
};
