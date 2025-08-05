import { AuthVerify } from "../components/auth/auth-verify.js";

const AuthVerifyPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                <AuthVerify />
            </div>
        </div>
    );
};

export default AuthVerifyPage;
