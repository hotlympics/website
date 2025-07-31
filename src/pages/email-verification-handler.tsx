import {
    applyActionCode,
    getAuth,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const EmailVerificationHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"verifying" | "success" | "error">(
        "verifying"
    );
    const [message, setMessage] = useState("");

    useEffect(() => {
        const handleVerification = async () => {
            const mode = searchParams.get("mode");
            const oobCode = searchParams.get("oobCode");

            if (mode !== "verifyEmail" || !oobCode) {
                setStatus("error");
                setMessage("Invalid verification link");
                return;
            }

            try {
                const auth = getAuth();

                // Apply the email verification code
                await applyActionCode(auth, oobCode);

                setStatus("success");
                setMessage(
                    "Email verified successfully! Redirecting to sign in..."
                );

                // Check if we have stored credentials to auto-sign in
                const storedEmail = localStorage.getItem(
                    "pending_verification_email"
                );
                const storedPassword = localStorage.getItem(
                    "pending_verification_password"
                );

                if (storedEmail && storedPassword) {
                    try {
                        // Auto sign in with stored credentials
                        await signInWithEmailAndPassword(
                            auth,
                            storedEmail,
                            storedPassword
                        );

                        // Clear stored credentials
                        localStorage.removeItem("pending_verification_email");
                        localStorage.removeItem(
                            "pending_verification_password"
                        );

                        // Get ID token and sync with backend
                        const user = auth.currentUser;
                        if (user) {
                            const idToken = await user.getIdToken();
                            const apiUrl =
                                import.meta.env.VITE_API_URL ||
                                "http://localhost:3000";

                            const response = await fetch(
                                `${apiUrl.replace(/\/$/, "")}/auth/sync`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${idToken}`,
                                    },
                                    body: JSON.stringify({
                                        firebaseUid: user.uid,
                                    }),
                                }
                            );

                            if (response.ok) {
                                const data = await response.json();
                                localStorage.setItem(
                                    "user_info",
                                    JSON.stringify(data.user)
                                );
                                navigate("/profile");
                                return;
                            }
                        }
                    } catch (error) {
                        console.error("Auto sign-in failed:", error);
                    }
                }

                // If auto sign-in failed or no stored credentials, redirect to sign in
                setTimeout(() => {
                    navigate("/signin");
                }, 2000);
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                setMessage(
                    "Failed to verify email. The link may have expired."
                );
            }
        };

        handleVerification();
    }, [searchParams, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <div className="text-center">
                    {status === "verifying" && (
                        <>
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <svg
                                    className="h-8 w-8 animate-spin text-blue-600"
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
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-gray-800">
                                Verifying Email
                            </h2>
                            <p className="text-gray-600">
                                Please wait while we verify your email...
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
                                Email Verified!
                            </h2>
                            <p className="text-gray-600">{message}</p>
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
                                Verification Failed
                            </h2>
                            <p className="mb-4 text-gray-600">{message}</p>
                            <button
                                onClick={() => navigate("/signin")}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                Go to sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationHandler;
