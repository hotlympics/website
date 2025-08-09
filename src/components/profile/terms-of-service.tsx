import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getCurrentTosFile } from "../../config/tos-config";

interface TermsOfServiceProps {
    onAccept: () => void;
    onDecline: () => void;
}

export function TermsOfService({ onAccept, onDecline }: TermsOfServiceProps) {
    const [tosContent, setTosContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTos = async () => {
            try {
                const tosFile = getCurrentTosFile();
                const response = await fetch(tosFile);
                if (!response.ok) {
                    throw new Error("Failed to load Terms of Service");
                }
                const text = await response.text();
                setTosContent(text);
            } catch (err) {
                console.error("Error loading TOS:", err);
                setError(
                    "Failed to load Terms of Service. Please try again later."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTos();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="mb-4 text-2xl font-bold">
                        Terms of Service
                    </h2>
                    <p className="text-gray-600">Loading terms of service...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="mb-4 text-2xl font-bold">
                        Terms of Service
                    </h2>
                    <div className="rounded-lg bg-red-50 p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onDecline}
                        className="flex-1 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="mb-4 text-2xl font-bold">Terms of Service</h2>
                <p className="mb-4 text-gray-600">
                    Please read and accept our terms of service to continue.
                </p>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-6">
                <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => (
                                <h1 className="mb-4 text-xl font-bold text-gray-900">
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="mt-6 mb-3 text-lg font-semibold text-gray-800">
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="mt-4 mb-2 text-base font-semibold text-gray-800">
                                    {children}
                                </h3>
                            ),
                            p: ({ children }) => (
                                <p className="mb-4 leading-relaxed text-gray-700">
                                    {children}
                                </p>
                            ),
                            ul: ({ children }) => (
                                <ul className="mb-4 ml-5 list-disc text-gray-700">
                                    {children}
                                </ul>
                            ),
                            li: ({ children }) => (
                                <li className="mb-1">{children}</li>
                            ),
                            strong: ({ children }) => (
                                <strong className="font-semibold text-gray-900">
                                    {children}
                                </strong>
                            ),
                        }}
                    >
                        {tosContent}
                    </ReactMarkdown>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onDecline}
                    className="flex-1 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                >
                    Decline
                </button>
                <button
                    onClick={onAccept}
                    className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                    Accept Terms
                </button>
            </div>
        </div>
    );
}
