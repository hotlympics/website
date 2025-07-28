import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

const SignInPage = () => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isSignUp && password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            if (isSignUp) {
                await authService.signUpWithEmail(email, password);
            } else {
                await authService.signInWithEmail(email, password);
            }
            navigate("/upload");
        } catch {
            setError(
                isSignUp
                    ? "Sign up failed. Please try again."
                    : "Sign in failed. Please check your credentials."
            );
        }
    };

    const handleSocialLogin = (provider: "google") => {
        authService.initiateOAuthLogin(provider);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <button
                    onClick={() => navigate("/")}
                    className="mb-4 text-gray-600 hover:text-gray-800"
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
                        onClick={() => handleSocialLogin("google")}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
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
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
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
                        className="w-full rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                        {isSignUp ? "Create Account" : "Sign In"}
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
                        className="ml-1 text-blue-600 hover:text-blue-700"
                    >
                        {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SignInPage;
