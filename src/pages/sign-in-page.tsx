import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MagicLinkSent } from "../components/auth/magic-link-sent.js";
import { SignInForm } from "../components/auth/sign-in-form.js";

const SignInPage = () => {
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect") || "/profile";
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [email, setEmail] = useState("");

    const handleMagicLinkSent = (emailAddress: string) => {
        setEmail(emailAddress);
        setMagicLinkSent(true);
    };

    const handleBackToSignIn = () => {
        setMagicLinkSent(false);
        setEmail("");
    };

    if (magicLinkSent) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg ring-1 ring-white/5">
                    <MagicLinkSent
                        email={email}
                        onBackToSignIn={handleBackToSignIn}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg ring-1 ring-white/5">
                <SignInForm
                    redirect={redirect}
                    onMagicLinkSent={handleMagicLinkSent}
                />
            </div>
        </div>
    );
};

export default SignInPage;
