import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { getCurrentTosFile } from "../../config/tos-config"

interface TermsOfServiceProps {
    onAccept: () => void
    onDecline: () => void
}

export function TermsOfService({ onAccept, onDecline }: TermsOfServiceProps) {
    const [tosContent, setTosContent] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTos = async () => {
            try {
                const tosFile = getCurrentTosFile()
                const response = await fetch(tosFile)
                if (!response.ok) {
                    throw new Error("Failed to load Terms of Service")
                }
                const text = await response.text()
                setTosContent(text)
            } catch (err) {
                console.error("Error loading TOS:", err)
                setError("Failed to load Terms of Service. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchTos()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
                    <p className="text-gray-600">Loading terms of service...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onDecline}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
                <p className="text-gray-600 mb-4">
                    Please read and accept our terms of service to continue.
                </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => (
                                <h1 className="text-xl font-bold mb-4 text-gray-900">{children}</h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="text-lg font-semibold mb-3 mt-6 text-gray-800">{children}</h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-base font-semibold mb-2 mt-4 text-gray-800">{children}</h3>
                            ),
                            p: ({ children }) => (
                                <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
                            ),
                            ul: ({ children }) => (
                                <ul className="list-disc ml-5 mb-4 text-gray-700">{children}</ul>
                            ),
                            li: ({ children }) => (
                                <li className="mb-1">{children}</li>
                            ),
                            strong: ({ children }) => (
                                <strong className="font-semibold text-gray-900">{children}</strong>
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
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                    Decline
                </button>
                <button
                    onClick={onAccept}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Accept Terms
                </button>
            </div>
        </div>
    )
}