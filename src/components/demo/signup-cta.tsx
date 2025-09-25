import { Link } from "react-router-dom";

interface SignUpCTAProps {
    className?: string;
}

const SignUpCTA = ({ className = "" }: SignUpCTAProps) => {
    return (
        <div
            className={`fixed right-0 bottom-0 left-0 z-10 border-t border-gray-700 bg-gray-800 ${className}`}
            style={{
                paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)",
                paddingLeft: "env(safe-area-inset-left)",
                paddingRight: "env(safe-area-inset-right)",
            }}
        >
            <div className="mx-auto max-w-4xl px-4 py-4 pb-4">
                <div className="text-center">
                    <h2 className="mb-2 text-lg font-bold text-white sm:text-xl">
                        Ready to Find Out How Your Photos Compare?
                    </h2>
                    <p className="mx-auto mb-4 max-w-2xl text-xs text-gray-300 sm:text-sm">
                        Join Hotlympics to upload your photos, get real ratings
                        from other users, and discover which looks work best for
                        you through head-to-head competitions.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            to="/signin"
                            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:px-8 sm:py-3 sm:text-base"
                        >
                            Sign In or Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpCTA;
