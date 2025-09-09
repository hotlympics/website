import { getApiUrl } from "../utils/api.js";
import { firebaseAuthService } from "./auth/firebase-auth.js";

export interface SubmitReportRequest {
    imageId: string;
    category: string;
    description?: string;
}

export interface SubmitReportResponse {
    success: boolean;
    reportId: string;
    message: string;
}

class ReportService {
    private readonly baseUrl = `${getApiUrl()}/reports`;

    async submitReport(
        request: SubmitReportRequest
    ): Promise<SubmitReportResponse> {
        // Try to get token but don't require it for anonymous reporting
        const token = await firebaseAuthService.getIdToken();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Add authorization header if user is authenticated
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage =
                errorData.error ||
                `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        return response.json();
    }
}

export const reportService = new ReportService();
