export const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
};

export const getImageUrl = (url: string) => {
    // If it's already a full URL (signed URL from Firebase), return as-is
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    // Otherwise, it's a legacy filename that shouldn't happen anymore
    console.warn("Received non-URL image path:", url);
    return url;
};
