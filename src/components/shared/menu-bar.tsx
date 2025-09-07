import { Circle, House, Square, Trophy, UserPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/use-auth.js";

const MenuBar = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const menuItems = [
        {
            icon: House,
            label: "Home",
            onClick: () => navigate("/"),
            functional: true,
        },
        {
            icon: Trophy,
            label: "Leaderboard",
            onClick: () => navigate("/leaderboard"),
            functional: true,
        },
        {
            icon: Circle,
            label: "Temp 2",
            onClick: () => {},
            functional: false,
        },
        {
            icon: Square,
            label: "Temp 3",
            onClick: () => {},
            functional: false,
        },
        {
            icon: UserPen,
            label: "Profile",
            onClick: () => {
                if (user) {
                    navigate("/profile");
                } else {
                    navigate("/signin?redirect=/profile");
                }
            },
            functional: true,
        },
    ];

    return (
        <div className="mx-3 flex w-[calc(100%-1.5rem)] items-center justify-center rounded-2xl bg-gray-900/90 p-3 shadow-md backdrop-blur-sm sm:mx-4 sm:w-[calc(100%-2rem)] sm:p-5">
            <div className="flex items-center justify-center gap-6 sm:gap-8">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            disabled={loading || !item.functional}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-md transition-colors sm:h-12 sm:w-12 ${
                                item.functional
                                    ? "bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    : "cursor-not-allowed bg-gray-700 text-gray-500"
                            }`}
                            title={item.label}
                        >
                            <Icon size={20} className="sm:size-6" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MenuBar;
