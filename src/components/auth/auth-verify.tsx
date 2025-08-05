import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseAuthService } from "../../services/auth/firebase-auth.js";
import { syncUserWithBackend } from "../../services/auth/auth-sync.js";

export const AuthVerify = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading"
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        let processed = false;

        const handleMagicLink = async () => {
            // Prevent multiple executions
            if (processed) return;
            processed = true;

            try {
                // Check if this is a sign-in link
                const emailLink = window.location.href;

                if (!firebaseAuthService.isSignInLink(emailLink)) {
                    throw new Error("Invalid sign-in link");
                }

                // Get the email from localStorage or prompt user
                let email = firebaseAuthService.getStoredEmail();

                if (!email) {
                    // If email is not stored, prompt the user
                    email = window.prompt(
                        "Please provide your email for confirmation"
                    );
                    if (!email) {
                        throw new Error(
                            "Email is required to complete sign-in"
                        );
                    }
                }

                // Complete sign-in
                const user = await firebaseAuthService.signInWithMagicLink(
                    email,
                    emailLink
                );

                // Only proceed if component is still mounted
                if (!mounted) return;

                // Sync with backend
                await syncUserWithBackend(user.uid);

                if (mounted) {
                    setStatus("success");

                    // Redirect after a short delay
                    setTimeout(() => {
                        if (mounted) {
                            navigate("/profile");
                        }
                    }, 2000);
                }
            } catch (error) {
                console.error("Magic link error:", error);
                if (mounted) {
                    setStatus("error");
                    if (error instanceof Error) {
                        setError(error.message);
                    } else {
                        setError("Failed to complete sign-in");
                    }
                }
            }
        };

        // Small delay to ensure Firebase is initialized
        const timer = setTimeout(() => {
            handleMagicLink();
        }, 100);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Remove dependencies to ensure it only runs once

    return (
        <div className="text-center">
            {status === "loading" && (
                <>
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-800">
                        Signing you in...
                    </h2>
                    <p className="text-gray-600">
                        Please wait while we verify your sign-in link.
                    </p>
                </>
            )}

            {status === "success" && (
                <>
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <svg
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-800">
                        Success!
                    </h2>
                    <p className="text-gray-600">
                        You've been signed in successfully. Redirecting...
                    </p>
                </>
            )}

            {status === "error" && (
                <>
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <svg
                            className="h-8 w-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-800">
                        Sign-in Failed
                    </h2>
                    <p className="mb-4 text-gray-600">
                        {error || "Something went wrong. Please try again."}
                    </p>
                    <button
                        onClick={() => navigate("/signin")}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                        Back to Sign In
                    </button>
                </>
            )}
        </div>
    );
};
