import type { ReactNode } from "react";

interface MainContentAreaProps {
    children: ReactNode;
}

export const MainContentArea = ({ children }: MainContentAreaProps) => {
    return (
        <div
            className="flex min-h-[100dvh] w-full flex-col items-center justify-center pb-20 sm:pb-16"
            style={{
                paddingTop: "1rem",
                paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))",
            }}
        >
            {children}
        </div>
    );
};
