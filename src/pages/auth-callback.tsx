import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { authService } from "../services/auth";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { provider } = useParams<{ provider: string }>();
    const [searchParams] = useSearchParams();
    const code = searchParams.get("code");

    useEffect(() => {
        if (!provider || !code) {
            navigate("/signin");
            return;
        }

        const handleCallback = async () => {
            try {
                await authService.handleOAuthCallback(provider, code);
                const redirectPath =
                    sessionStorage.getItem("auth_redirect") || "/profile";
                sessionStorage.removeItem("auth_redirect");
                navigate(redirectPath);
            } catch (error) {
                console.error("Authentication failed:", error);
                navigate("/signin");
            }
        };

        handleCallback();
    }, [provider, code, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-600">Authenticating...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
