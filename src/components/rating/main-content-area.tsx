import type { ReactNode } from "react";

interface MainContentAreaProps {
    children: ReactNode;
}

export const MainContentArea = ({ children }: MainContentAreaProps) => {
    return (
        <div
            className="flex min-h-[100dvh] w-full flex-col items-center justify-center"
            style={{
                paddingTop: "1rem",
                paddingBottom: "calc(4rem + env(safe-area-inset-bottom))",
            }}
        >
            {children}
        </div>
    );
};
