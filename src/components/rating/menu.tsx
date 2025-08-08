import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/use-auth.js";

const MenuBar = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    return (
        <div className="mx-3 flex w-[calc(100%-1.5rem)] items-center justify-end rounded-2xl bg-white/80 p-3 shadow-md backdrop-blur-sm sm:mx-4 sm:w-[calc(100%-2rem)] sm:p-5">
            <button
                onClick={() => {
                    if (user) {
                        navigate("/profile");
                    } else {
                        navigate("/signin?redirect=/profile");
                    }
                }}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-base"
            >
                {user ? "Profile" : "Sign In"}
            </button>
        </div>
    );
};

export default MenuBar;
