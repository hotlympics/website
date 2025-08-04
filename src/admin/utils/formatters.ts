export const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
};

export const getImageUrl = (fileName: string) => {
    const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    return `${API_BASE_URL}/images/serve/${fileName}`;
};
