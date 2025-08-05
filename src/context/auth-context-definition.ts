import { createContext } from "react";
import { AuthUser } from "../services/auth/firebase-auth";

export interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);
