import {
    AuthError,
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
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
    // Sign up with email and password
    async signUpWithEmail(
        email: string,
        password: string
    ): Promise<{ user: AuthUser; needsVerification: boolean }> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // Send verification email
            await sendEmailVerification(user);

            return {
                user: {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                },
                needsVerification: !user.emailVerified,
            };
        } catch (error) {
            const authError = error as AuthError;
            throw new Error(this.getErrorMessage(authError.code));
        }
    },

    // Sign in with email and password
    async signInWithEmail(email: string, password: string): Promise<AuthUser> {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            if (!user.emailVerified) {
                throw new Error("Please verify your email before signing in");
            }

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

    // Resend verification email
    async resendVerificationEmail(): Promise<void> {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("No user is signed in");
        }

        try {
            await sendEmailVerification(user);
        } catch (error) {
            const authError = error as AuthError;
            throw new Error(this.getErrorMessage(authError.code));
        }
    },

    // Check if email is verified (refresh user data)
    async checkEmailVerified(): Promise<boolean> {
        const user = auth.currentUser;
        if (!user) return false;

        await user.reload();
        return user.emailVerified;
    },

    // Helper to get user-friendly error messages
    getErrorMessage(code: string): string {
        switch (code) {
            case "auth/email-already-in-use":
                return "This email is already registered";
            case "auth/invalid-email":
                return "Invalid email address";
            case "auth/operation-not-allowed":
                return "Email/password accounts are not enabled";
            case "auth/weak-password":
                return "Password is too weak";
            case "auth/user-disabled":
                return "This account has been disabled";
            case "auth/user-not-found":
                return "No account found with this email";
            case "auth/wrong-password":
                return "Incorrect password";
            case "auth/invalid-credential":
                return "Invalid email or password";
            case "auth/popup-closed-by-user":
                return "Sign in was cancelled";
            case "auth/network-request-failed":
                return "Network error. Please check your connection";
            default:
                return "An error occurred. Please try again";
        }
    },
};
