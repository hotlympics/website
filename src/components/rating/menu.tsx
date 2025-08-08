import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/use-auth.js";

const MenuBar = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    return (
        <div className="flex w-full items-center justify-end rounded-2xl bg-gray-100 p-2 shadow-md sm:p-4">
            <button
                onClick={() => {
                    if (user) {
                        navigate("/profile");
                    } else {
                        navigate("/signin?redirect=/profile");
                    }
                }}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-2 py-1 text-sm text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-base"
            >
                {user ? "Profile" : "Sign In"}
            </button>
        </div>
    );
};

export default MenuBar;
