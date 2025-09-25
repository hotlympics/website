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
            onClick: () => navigate("/my-photos"), // Always navigate to show demo for unauthenticated users
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
            const directMatch = location.pathname === "/upload";
            if (directMatch) return true;
        }
        if (itemPath === "/my-photos") {
            const directMatch = location.pathname === "/my-photos";
            if (directMatch) return true;
        }
        if (itemPath === "/profile") {
            const directMatch = location.pathname === "/profile";
            if (directMatch) return true;
        }
        if (itemPath === "/leaderboard") {
            const directMatch = location.pathname === "/leaderboard";
            if (directMatch) return true;
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
        <div
            className="fixed right-0 bottom-0 left-0 z-20 flex justify-center"
            style={{
                paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom))`,
                paddingLeft: "env(safe-area-inset-left)",
                paddingRight: "env(safe-area-inset-right)",
            }}
        >
            <nav className="mx-4 flex w-full max-w-md items-center justify-evenly rounded-2xl border border-white/10 bg-black/80 px-4 py-2 shadow-lg backdrop-blur-md">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = getIsActive(item.path);
                    
                    return (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            disabled={loading || !item.functional}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 focus:border-transparent focus:ring-0 focus:outline-none active:outline-none sm:h-14 sm:w-14 ${
                                item.functional
                                    ? `${
                                          isActive
                                              ? "bg-blue-500/20 text-blue-400 shadow-md"
                                              : "text-gray-400 hover:bg-white/10 hover:text-gray-300"
                                      } active:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50`
                                    : "cursor-not-allowed text-gray-600"
                            }`}
                            style={{
                                outline: "none",
                                border: "none",
                                boxShadow: "none",
                            }}
                            title={item.label}
                        >
                            <Icon
                                size={24}
                                className="sm:size-7"
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
            </nav>
        </div>
    );
};

export default MenuBar;
