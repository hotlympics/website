import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { firebaseAuthService } from "../services/firebase-auth";

const SignInPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect") || "/profile";
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [checkingVerification, setCheckingVerification] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (isSignUp && password !== confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                const result = await firebaseAuthService.signUpWithEmail(
                    email,
                    password
                );

                if (result.needsVerification) {
                    // Store credentials temporarily for auto-sign in after verification
                    localStorage.setItem("pending_verification_email", email);
                    localStorage.setItem(
                        "pending_verification_password",
                        password
                    );

                    setVerificationSent(true);
                    setLoading(false);
                    return;
                }

                // If email is already verified (shouldn't happen with new signups)
                await syncUserWithBackend(result.user.uid);
                navigate(redirect);
            } else {
                const user = await firebaseAuthService.signInWithEmail(
                    email,
                    password
                );
                await syncUserWithBackend(user.uid);
                navigate(redirect);
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    isSignUp
                        ? "Sign up failed. Please try again."
                        : "Sign in failed. Please check your credentials."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);

        try {
            const user = await firebaseAuthService.signInWithGoogle();
            await syncUserWithBackend(user.uid);
            navigate(redirect);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Google sign in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Sync user with backend after successful authentication
    // Auto-check email verification status
    useEffect(() => {
        if (!verificationSent || checkingVerification) return;

        const checkInterval = setInterval(async () => {
            try {
                setCheckingVerification(true);
                const isVerified =
                    await firebaseAuthService.checkEmailVerified();
                if (isVerified) {
                    clearInterval(checkInterval);
                    // Auto sign in when email is verified
                    const user = await firebaseAuthService.signInWithEmail(
                        email,
                        password
                    );
                    const apiUrl =
                        import.meta.env.VITE_API_URL || "http://localhost:3000";
                    const idToken = await firebaseAuthService.getIdToken();

                    if (idToken) {
                        const response = await fetch(
                            `${apiUrl.replace(/\/$/, "")}/auth/sync`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${idToken}`,
                                },
                                body: JSON.stringify({ firebaseUid: user.uid }),
                            }
                        );

                        if (response.ok) {
                            const data = await response.json();
                            localStorage.setItem(
                                "user_info",
                                JSON.stringify(data.user)
                            );
                            navigate(redirect);
                        }
                    }
                }
            } catch (error) {
                // Silently ignore errors during auto-check
                console.log("Auto-check error:", error);
            } finally {
                setCheckingVerification(false);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(checkInterval);
    }, [
        verificationSent,
        email,
        password,
        navigate,
        redirect,
        checkingVerification,
    ]);

    const syncUserWithBackend = async (firebaseUid: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const idToken = await firebaseAuthService.getIdToken();

        if (!idToken) {
            throw new Error("Failed to get authentication token");
        }

        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ firebaseUid }),
        });

        if (!response.ok) {
            let errorMessage = "Failed to sync with backend";
            try {
                const errorData = await response.json();
                console.error("Sync failed:", errorData);
                errorMessage =
                    typeof errorData.error === "string"
                        ? errorData.error
                        : errorData.message || errorMessage;
            } catch (e) {
                console.error("Failed to parse error response:", e);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        localStorage.setItem("user_info", JSON.stringify(data.user));
    };

    if (verificationSent) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
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
                            Verify Your Email
                        </h2>

                        <p className="mb-6 text-gray-600">
                            We've sent a verification email to{" "}
                            <strong>{email}</strong>. Please check your inbox
                            and click the verification link to complete your
                            registration.
                        </p>

                        <p className="mb-4 text-sm text-gray-500">
                            After verifying your email, click the button below
                            to continue.
                        </p>

                        {checkingVerification && (
                            <p className="mb-4 animate-pulse text-sm text-blue-600">
                                Checking verification status...
                            </p>
                        )}

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 p-3 text-center">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={async () => {
                                setLoading(true);
                                setError(null);
                                try {
                                    // Check if email is verified and sign in
                                    const isVerified =
                                        await firebaseAuthService.checkEmailVerified();
                                    if (isVerified) {
                                        // Email is verified, proceed with sign in
                                        const user =
                                            await firebaseAuthService.signInWithEmail(
                                                email,
                                                password
                                            );
                                        await syncUserWithBackend(user.uid);
                                        navigate(redirect);
                                    } else {
                                        setError(
                                            "Email not yet verified. Please check your inbox."
                                        );
                                    }
                                } catch {
                                    setError(
                                        "Please sign in again after verifying your email."
                                    );
                                    setVerificationSent(false);
                                    setIsSignUp(false);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            className="mb-4 w-full rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Checking..." : "I've verified my email"}
                        </button>

                        <button
                            onClick={() => {
                                setVerificationSent(false);
                                setIsSignUp(false);
                                setPassword("");
                                // Clear stored credentials
                                localStorage.removeItem(
                                    "pending_verification_email"
                                );
                                localStorage.removeItem(
                                    "pending_verification_password"
                                );
                            }}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Back to sign in
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <button
                    onClick={() => navigate("/")}
                    className="mb-4 text-gray-600 hover:text-gray-800"
                    disabled={loading}
                >
                    ← Back to rating
                </button>

                <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
                    {isSignUp ? "Create Account" : "Sign In"}
                </h2>

                <p className="mb-6 text-center text-gray-600">
                    {isSignUp
                        ? "Create an account to upload your photo"
                        : "Sign in to upload your photo"}
                </p>

                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    {isSignUp && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="mb-2 rounded-lg bg-red-50 p-3 text-center">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Please wait..."
                            : isSignUp
                              ? "Create Account"
                              : "Sign In"}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                    {isSignUp
                        ? "Already have an account?"
                        : "Don't have an account?"}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                        }}
                        disabled={loading}
                        className="ml-1 text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
