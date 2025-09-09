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
            path: "/upload",
            onClick: () => {
                if (user) {
                    navigate("/upload");
                } else {
                    navigate("/signin?redirect=/upload");
                }
            },
            functional: true,
        },
        {
            icon: Images,
            label: "My Photos",
            path: "/my-photos",
            onClick: () => {
                if (user) {
                    navigate("/my-photos");
                } else {
                    navigate("/signin?redirect=/my-photos");
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

        // Handle direct path matches
        if (itemPath === "/upload") {
            return location.pathname === "/upload";
        }
        if (itemPath === "/my-photos") {
            return location.pathname === "/my-photos";
        }
        if (itemPath === "/profile") {
            return location.pathname === "/profile";
        }
        if (itemPath === "/leaderboard") {
            return location.pathname === "/leaderboard";
        }

        // Handle cases where user is on signin page but intended for a specific page
        if (location.pathname === "/signin") {
            const searchParams = new URLSearchParams(location.search);
            const redirect = searchParams.get("redirect");

            if (redirect === itemPath) {
                return true;
            }
        }

        return location.pathname.startsWith(itemPath);
    };

    return (
        <div className="mx-0 flex w-full items-center justify-center rounded-none bg-black p-6 shadow-lg sm:p-8">
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
                                fill={
                                    isActive &&
                                    item.functional &&
                                    item.label !== "My Photos"
                                        ? "currentColor"
                                        : "none"
                                }
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MenuBar;
