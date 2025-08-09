import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MenuBar from "../shared/menu-bar.js";

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    const location = useLocation();
    
    // Determine which pages should show the menu bar
    const showMenuBar = ["/", "/profile"].includes(location.pathname);
    
    // Check if we're on the rating page (which should not scroll)
    const isRatingPage = location.pathname === "/";
    
    // Reset scroll position when navigating to rating page
    useEffect(() => {
        if (isRatingPage) {
            window.scrollTo(0, 0);
        }
    }, [isRatingPage]);
    
    return (
        <div className={`min-h-screen ${isRatingPage ? "overflow-hidden" : ""}`}>
            {/* Main content area with conditional bottom padding */}
            <div className={showMenuBar && !isRatingPage ? "pb-32" : ""}>
                {children}
            </div>
            
            {/* Persistent MenuBar - only shown on specific pages */}
            {showMenuBar && (
                <div
                    className="fixed right-0 bottom-0 left-0 z-20 flex w-full justify-center px-3 pb-4"
                    style={{
                        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                        paddingLeft: "env(safe-area-inset-left)",
                        paddingRight: "env(safe-area-inset-right)",
                    }}
                >
                    <div className="w-full max-w-7xl">
                        <MenuBar />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppLayout;