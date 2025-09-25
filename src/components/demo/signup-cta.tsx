import { Link } from "react-router-dom";

interface SignUpCTAProps {
    className?: string;
}

const SignUpCTA = ({ className = "" }: SignUpCTAProps) => {
    return (
        <div className={`border-t border-gray-700 bg-gray-800 ${className}`}>
            <div className="mx-auto max-w-4xl px-4 py-8 pb-24">
                <div className="text-center">
                    <h2 className="mb-3 text-2xl font-bold text-white">
                        Ready to Find Out How Your Photos Compare?
                    </h2>
                    <p className="mx-auto mb-6 max-w-2xl text-gray-300">
                        Join Hotlympics to upload your photos, get real ratings
                        from other users, and discover which looks work best for
                        you through head-to-head competitions.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            to="/signin"
                            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
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
