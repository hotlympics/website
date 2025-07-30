interface OAuthConfig {
    google: {
        clientId: string;
        redirectUri: string;
        scope: string;
    };
}

const oauthConfig: OAuthConfig = {
    google: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        redirectUri: `${window.location.origin}/auth/google/callback`,
        scope: "openid email profile",
    },
};

export const authService = {
    initiateOAuthLogin(provider: "google", redirectPath?: string) {
        const config = oauthConfig[provider];

        if (!config.clientId) {
            console.error(`${provider} client ID not configured`);
            return;
        }

        let authUrl = "";

        if (redirectPath) {
            sessionStorage.setItem("auth_redirect", redirectPath);
        }

        switch (provider) {
            case "google":
                authUrl =
                    `https://accounts.google.com/o/oauth2/v2/auth?` +
                    `client_id=${config.clientId}` +
                    `&redirect_uri=${encodeURIComponent(config.redirectUri)}` +
                    `&response_type=code` +
                    `&scope=${encodeURIComponent(config.scope)}` +
                    `&access_type=offline` +
                    `&prompt=consent`;
                break;
        }

        if (authUrl) {
            window.location.href = authUrl;
        }
    },

    async handleOAuthCallback(provider: string, code: string) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

        try {
            const response = await fetch(
                `${apiUrl}/auth/${provider}/callback`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code }),
                }
            );

            if (!response.ok) {
                throw new Error("Authentication failed");
            }

            const data = await response.json();

            if (data.token) {
                localStorage.setItem("auth_token", data.token);
            }
            if (data.user) {
                localStorage.setItem("user_info", JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error("OAuth callback error:", error);
            throw error;
        }
    },

    async signInWithEmail(email: string, password: string) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

        try {
            const response = await fetch(`${apiUrl}/auth/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Sign in failed");
            }

            const data = await response.json();

            if (data.token) {
                localStorage.setItem("auth_token", data.token);
            }
            if (data.user) {
                localStorage.setItem("user_info", JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error("Sign in error:", error);
            throw error;
        }
    },

    async signUpWithEmail(email: string, password: string) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

        try {
            const response = await fetch(`${apiUrl}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Sign up failed");
            }

            const data = await response.json();

            if (data.token) {
                localStorage.setItem("auth_token", data.token);
            }
            if (data.user) {
                localStorage.setItem("user_info", JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error("Sign up error:", error);
            throw error;
        }
    },
};
