import { ChartColumnIncreasing, House, ImagePlus, Settings, UserPen } from "lucide-react";
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
        },
        {
            icon: ChartColumnIncreasing,
            label: "Leaderboard",
            onClick: () => {
                // TODO: Implement leaderboard navigation
            },
        },
        {
            icon: ImagePlus,
            label: "Add",
            onClick: () => {
                if (user) {
                    navigate("/profile"); // Navigate to profile where photo upload is handled
                } else {
                    navigate("/signin?redirect=/profile");
                }
            },
        },
        {
            icon: Settings,
            label: "Settings",
            onClick: () => {
                // TODO: Implement settings navigation
            },
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
        },
    ];

    return (
        <div className="mx-3 flex w-[calc(100%-1.5rem)] items-center justify-center rounded-2xl bg-white/80 p-3 shadow-md backdrop-blur-sm sm:mx-4 sm:w-[calc(100%-2rem)] sm:p-5">
            <div className="flex items-center justify-center gap-6 sm:gap-8">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            disabled={loading}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12"
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
