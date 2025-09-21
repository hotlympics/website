import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MenuBar from "../shared/menu-bar.js";

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    const location = useLocation();

    // Determine which pages should show the menu bar
    const showMenuBar = [
        "/",
        "/profile",
        "/upload",
        "/my-photos",
        "/leaderboard",
        "/signin",
    ].includes(location.pathname);

    // Check if we're on the rating page (which should not scroll)
    const isRatingPage = location.pathname === "/";

    // Reset scroll position when navigating to rating page
    useEffect(() => {
        if (isRatingPage) {
            window.scrollTo(0, 0);
        }
    }, [isRatingPage]);

    return (
        <div className={`min-v-screen min-h-screen bg-black`}>
            {/* Main content area with conditional bottom padding */}
            <div>{children}</div>

            {/* Persistent MenuBar - only shown on specific pages */}
            {showMenuBar && <MenuBar />}
        </div>
    );
};

export default AppLayout;
