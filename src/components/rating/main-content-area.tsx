import type { ReactNode } from "react";

interface MainContentAreaProps {
    children: ReactNode;
}

export const MainContentArea = ({ children }: MainContentAreaProps) => {
    return (
        <div
            className="
                w-full min-h-[100dvh]
                flex flex-col items-center justify-center
                bg-black
            "
            style={{
                paddingBottom: "calc(5rem + env(safe-area-inset-bottom))",
            }}
        >
            {children}
        </div>
    );
};
