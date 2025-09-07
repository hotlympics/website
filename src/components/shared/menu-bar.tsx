import { Flame, Images, Plus, Trophy, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/use-auth.js";

const MenuBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading } = useAuth();

    const menuItems = [
        {
            icon: Flame,
            label: "Rating",
            path: "/",
            onClick: () => navigate("/"),
            functional: true,
        },
        {
            icon: Trophy,
            label: "Leaderboard",
            path: "/leaderboard",
            onClick: () => navigate("/leaderboard"),
            functional: true,
        },
        {
            icon: Plus,
            label: "Upload",
            path: "/upload", // Virtual path for selection state
            onClick: () => {
                if (user) {
                    navigate("/profile"); // Navigate to profile for upload functionality
                } else {
                    navigate("/signin?redirect=/profile");
                }
            },
            functional: true,
        },
        {
            icon: Images,
            label: "My Photos",
            path: "/my-photos", // Virtual path for selection state
            onClick: () => {
                if (user) {
                    navigate("/profile"); // Navigate to profile where photos are shown
                } else {
                    navigate("/signin?redirect=/profile");
                }
            },
            functional: true,
        },
        {
            icon: User,
            label: "Profile",
            path: "/profile",
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

    // Determine which tab is active based on current path
    const getIsActive = (itemPath: string) => {
        if (itemPath === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(itemPath);
    };

    return (
        <div 
            className="mx-0 flex w-full items-center justify-center rounded-none bg-black/95 p-6 shadow-lg backdrop-blur-sm sm:p-8"
        >
            <div className="flex w-full max-w-md items-start justify-between px-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = getIsActive(item.path);
                    return (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            disabled={loading || !item.functional}
                            className={`flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-200 sm:h-18 sm:w-18 ${
                                item.functional
                                    ? `${
                                          isActive 
                                              ? "text-blue-500" 
                                              : "text-gray-400 hover:text-gray-300"
                                      } hover:bg-white/10 active:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50`
                                    : "cursor-not-allowed text-gray-600"
                            }`}
                            title={item.label}
                        >
                            <Icon 
                                size={30} 
                                className="sm:size-9" 
                                strokeWidth={1.5} 
                                fill={isActive && item.functional ? "currentColor" : "none"}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MenuBar;
