import {
    ActionCodeSettings,
    AuthError,
    getAuth,
    GoogleAuthProvider,
    isSignInWithEmailLink,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    signInWithPopup,
    signOut,
    User,
} from "firebase/auth";
import app from "../config/firebase";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export interface AuthUser {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName: string | null;
    photoURL: string | null;
}

export const firebaseAuthService = {
    // Send magic link to email
    async sendMagicLink(email: string): Promise<void> {
        try {
            const actionCodeSettings: ActionCodeSettings = {
                // URL to redirect back to after email link is clicked
                url: `${window.location.origin}/auth/verify`,
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);

            // Store email for later use when completing sign-in
            window.localStorage.setItem("emailForSignIn", email);
        } catch (error) {
            const authError = error as AuthError;
            throw new Error(this.getErrorMessage(authError.code));
        }
    },

    // Complete sign in with magic link
    async signInWithMagicLink(
        email: string,
        emailLink: string
    ): Promise<AuthUser> {
        try {
            // Verify this is a sign-in email link
            if (!isSignInWithEmailLink(auth, emailLink)) {
                throw new Error("Invalid sign-in link");
            }

            const userCredential = await signInWithEmailLink(
                auth,
                email,
                emailLink
            );
            const user = userCredential.user;

            // Clear the stored email
            window.localStorage.removeItem("emailForSignIn");

            return {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                displayName: user.displayName,
                photoURL: user.photoURL,
            };
        } catch (error) {
            const authError = error as AuthError;
            throw new Error(this.getErrorMessage(authError.code));
        }
    },

    // Check if the current URL is a sign-in link
    isSignInLink(url: string): boolean {
        return isSignInWithEmailLink(auth, url);
    },

    // Get stored email for sign-in
    getStoredEmail(): string | null {
        return window.localStorage.getItem("emailForSignIn");
    },

    // Sign in with Google
    async signInWithGoogle(): Promise<AuthUser> {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            return {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                displayName: user.displayName,
                photoURL: user.photoURL,
            };
        } catch (error) {
            const authError = error as AuthError;
            throw new Error(this.getErrorMessage(authError.code));
        }
    },

    // Sign out
    async signOut(): Promise<void> {
        try {
            await signOut(auth);
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_info");
        } catch (error) {
            const authError = error as AuthError;
            throw new Error(this.getErrorMessage(authError.code));
        }
    },

    // Get current user
    getCurrentUser(): User | null {
        return auth.currentUser;
    },

    // Get ID token for API calls
    async getIdToken(): Promise<string | null> {
        const user = auth.currentUser;
        if (!user) return null;

        try {
            return await user.getIdToken();
        } catch (error) {
            console.error("Error getting ID token:", error);
            return null;
        }
    },

    // Listen to auth state changes
    onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
        return onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                callback({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    emailVerified: firebaseUser.emailVerified,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                });
            } else {
                callback(null);
            }
        });
    },

    // Helper to get user-friendly error messages
    getErrorMessage(code: string): string {
        switch (code) {
            case "auth/email-already-in-use":
                return "This email is already registered";
            case "auth/invalid-email":
                return "Invalid email address";
            case "auth/operation-not-allowed":
                return "Email link sign-in is not enabled";
            case "auth/user-disabled":
                return "This account has been disabled";
            case "auth/user-not-found":
                return "No account found with this email";
            case "auth/invalid-action-code":
                return "This sign-in link is invalid or has expired";
            case "auth/expired-action-code":
                return "This sign-in link has expired";
            case "auth/invalid-continue-uri":
                return "Invalid configuration. Please contact support";
            case "auth/unauthorized-continue-uri":
                return "Unauthorized domain. Please contact support";
            case "auth/missing-continue-uri":
                return "Missing configuration. Please contact support";
            case "auth/popup-closed-by-user":
                return "Sign in was cancelled";
            case "auth/network-request-failed":
                return "Network error. Please check your connection";
            default:
                return "An error occurred. Please try again";
        }
    },
};
