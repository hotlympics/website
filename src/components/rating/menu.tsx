import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/use-auth.js";

const MenuBar = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    return (
        <div className="bg-gray-100 p-6 rounded-2xl shadow-md w-full flex items-center justify-end">
            <button
                onClick={() => {
                    if (user) {
                        navigate("/profile");
                    } else {
                        navigate("/signin?redirect=/profile");
                    }
                }}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {user ? "Profile" : "Sign In"}
            </button>
        </div>
    );
};

export default MenuBar;
