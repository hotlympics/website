import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface EmailVerificationPendingProps {
    firebaseUid: string;
    email: string;
    isGoogleUser?: boolean;
    userId?: string;
}

export const EmailVerificationPending: React.FC<
    EmailVerificationPendingProps
> = ({ firebaseUid, email, isGoogleUser = false, userId }) => {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        // Check verification status every 5 seconds
        const interval = setInterval(async () => {
            await checkVerificationStatus();
        }, 5000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firebaseUid]);

    const checkVerificationStatus = async () => {
        setIsChecking(true);
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/verify-status`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        firebaseUid,
                        isGoogleUser,
                        userId,
                    }),
                }
            );

            const data = await response.json();

            if (data.verified) {
                // Email is verified, store token and user info
                if (data.token) {
                    localStorage.setItem("auth_token", data.token);
                }
                if (data.user) {
                    localStorage.setItem(
                        "user_info",
                        JSON.stringify(data.user)
                    );
                }

                // Redirect to main app
                navigate("/");
            }
        } catch (error) {
            console.error("Error checking verification status:", error);
        } finally {
            setIsChecking(false);
        }
    };

    const resendVerificationEmail = async () => {
        setIsResending(true);
        setResendMessage("");
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/resend-verification`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ firebaseUid }),
                }
            );

            if (response.ok) {
                setResendMessage(
                    "Verification email sent! Please check your inbox."
                );
            } else {
                const data = await response.json();
                setError(data.error || "Failed to resend verification email");
            }
        } catch {
            setError("Failed to resend verification email");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Verify your email
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    We've sent a verification email to{" "}
                    <span className="font-medium text-gray-900">{email}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="mt-4 text-sm text-gray-600">
                                Please check your email and click the
                                verification link to continue.
                            </p>
                            {isGoogleUser && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Once verified, your password will be added
                                    to your existing Google account.
                                </p>
                            )}
                        </div>

                        {isChecking && (
                            <div className="text-center">
                                <div className="inline-flex items-center">
                                    <svg
                                        className="mr-3 -ml-1 h-5 w-5 animate-spin text-indigo-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span className="text-sm text-gray-600">
                                        Checking verification status...
                                    </span>
                                </div>
                            </div>
                        )}

                        {resendMessage && (
                            <div className="rounded-md bg-green-50 p-4">
                                <p className="text-sm font-medium text-green-800">
                                    {resendMessage}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={resendVerificationEmail}
                                disabled={isResending}
                                className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isResending
                                    ? "Sending..."
                                    : "Resend verification email"}
                            </button>

                            <button
                                type="button"
                                onClick={() => checkVerificationStatus()}
                                disabled={isChecking}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isChecking
                                    ? "Checking..."
                                    : "I've verified my email"}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/signin")}
                                className="flex w-full justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-500"
                            >
                                Back to sign in
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
