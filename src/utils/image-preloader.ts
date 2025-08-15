export interface PreloadResult {
    url: string;
    success: boolean;
    image?: HTMLImageElement;
    error?: Error;
}

/**
 * Pre-load a single image
 */
export const preloadImage = (url: string): Promise<PreloadResult> => {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            resolve({
                url,
                success: true,
                image: img,
            });
        };

        img.onerror = () => {
            resolve({
                url,
                success: false,
                error: new Error(`Failed to load image: ${url}`),
            });
        };

        img.src = url;
    });
};

/**
 * Pre-load images with retry logic
 */
export const preloadImageWithRetry = async (
    url: string,
    maxRetries: number = 3
): Promise<PreloadResult> => {
    let attempts = 0;

    while (attempts < maxRetries) {
        const result = await preloadImage(url);

        if (result.success) {
            return result;
        }

        attempts++;

        if (attempts < maxRetries) {
            const delay = Math.pow(2, attempts) * 100;
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    return {
        url,
        success: false,
        error: new Error(
            `Failed to load image after ${maxRetries} attempts: ${url}`
        ),
    };
};
