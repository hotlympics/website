import { getApiUrl } from "../../utils/api";
const API_BASE_URL = getApiUrl();

export type ReportCategory =
    | "NOT_PERSON"
    | "IMPERSONATION"
    | "NUDITY"
    | "VIOLENCE"
    | "SPAM"
    | "INAPPROPRIATE"
    | "OTHER";

export type ReportStatus =
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "DUPLICATE";

export interface AdminReport {
    reportID: string;
    imageId: string;
    userId: string;
    category: ReportCategory;
    description?: string;
    status: ReportStatus;
    createdAt: string; // ISO string from server
    reviewedAt?: string; // ISO string from server
    reviewedBy?: string;
    adminNotes?: string;
    imageOwnerEmail?: string; // Email of the user who owns the reported image
}

export interface AdminUser {
    id: string;
    firebaseUid: string;
    email: string;
    googleId: string | null;
    gender: "unknown" | "male" | "female";
    dateOfBirth: string | null;
    rateCount: number;
    uploadedImageIds: string[];
    poolImageIds: string[];
    displayName?: string | null;
    photoUrl?: string | null;
}

export interface AdminImageData {
    id: string;
    imageId: string;
    userId: string;
    imageUrl: string;
    gender: "male" | "female";
    dateOfBirth: string;
    battles: number;
    wins: number;
    losses: number;
    draws: number;
    rating: number;
    rd: number;
    inPool: boolean;
}

export interface UserDetails {
    user: AdminUser;
    imageData: AdminImageData[];
}

export interface CreateUserData {
    email: string;
    displayName: string | null;
    gender: "male" | "female";
    dateOfBirth: string;
    images: File[];
    poolImageIndices?: number[];
}

export interface AdminBattle {
    battleId: string;
    winnerImageId: string;
    loserImageId: string;
    winnerUserId: string;
    loserUserId: string;
    winnerEmail?: string;
    loserEmail?: string;
    winnerRatingBefore: number;
    winnerRdBefore: number;
    loserRatingBefore: number;
    loserRdBefore: number;
    winnerRatingAfter: number;
    winnerRdAfter: number;
    loserRatingAfter: number;
    loserRdAfter: number;
    voterId?: string;
    voterEmail?: string;
    timestamp: string;
    systemVersion: number;
}

export interface BattleSearchResult {
    battles: AdminBattle[];
    totalCount: number;
    searchTerm: string;
}

export interface ReportSearchResult {
    reports: AdminReport[];
    totalCount: number;
    searchEmail: string;
    returnedCount: number;
    message?: string;
}

const getAuthHeaders = (): { Authorization: string } => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
        throw new Error("No admin token found");
    }
    return { Authorization: `Bearer ${token}` };
};

const login = async (
    username: string,
    password: string
): Promise<{ token: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("adminToken", data.token);
    return data;
};

const logout = (): void => {
    localStorage.removeItem("adminToken");
};

const isLoggedIn = (): boolean => {
    return !!localStorage.getItem("adminToken");
};

const getUsers = async (
    startAfter?: string,
    limit: number = 10,
    endBefore?: string,
    searchEmail?: string
): Promise<{
    users: AdminUser[];
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
    hasPrevious: boolean;
    searchEmail: string | null;
}> => {
    const url = new URL(`${API_BASE_URL}/admin/users`);
    url.searchParams.set("limit", limit.toString());
    if (startAfter) {
        url.searchParams.set("startAfter", startAfter);
    }
    if (endBefore) {
        url.searchParams.set("endBefore", endBefore);
    }
    if (searchEmail && searchEmail.trim()) {
        url.searchParams.set("searchEmail", searchEmail.trim());
    }

    const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch users");
    }

    return response.json();
};

const getUserDetails = async (userId: string): Promise<UserDetails> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error?.message || "Failed to fetch user details"
        );
    }

    return response.json();
};

const deleteUser = async (
    userId: string
): Promise<{
    message: string;
    deletedUserId: string;
    deletedImageCount: number;
}> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to delete user");
    }

    return response.json();
};

const deletePhoto = async (
    imageId: string
): Promise<{ message: string; deletedImageId: string; userId: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/photos/${imageId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to delete photo");
    }

    return response.json();
};

const createUser = async (
    userData: CreateUserData
): Promise<{ message: string; userId: string; uploadedImages: number }> => {
    const formData = new FormData();
    formData.append("email", userData.email);
    formData.append("gender", userData.gender);
    formData.append("dateOfBirth", userData.dateOfBirth);

    if (userData.displayName) {
        formData.append("displayName", userData.displayName);
    }

    // Add images to form data
    userData.images.forEach((image) => {
        formData.append(`images`, image);
    });

    // Add pool image indices if any
    if (userData.poolImageIndices && userData.poolImageIndices.length > 0) {
        formData.append(
            "poolImageIndices",
            JSON.stringify(userData.poolImageIndices)
        );
    }

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create user");
    }

    return response.json();
};

const togglePhotoPool = async (
    imageId: string,
    userId: string,
    addToPool: boolean
): Promise<{ message: string; isInPool: boolean }> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/photos/${imageId}/pool`,
        {
            method: "PUT",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, addToPool }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error?.message || "Failed to toggle photo pool status"
        );
    }

    return response.json();
};

const searchBattlesWithEmails = async (
    imageId: string,
    limit: number = 50
): Promise<BattleSearchResult> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/battles/search-with-emails?imageId=${encodeURIComponent(imageId)}&limit=${limit}`,
        {
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error?.message || "Failed to search battles with emails"
        );
    }

    return response.json();
};

const getImageUrl = async (
    imageId: string
): Promise<{ imageId: string; imageUrl: string }> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/images/${encodeURIComponent(imageId)}/url`,
        {
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to get image URL");
    }

    return response.json();
};

const getReports = async (
    status?: ReportStatus,
    limit: number = 20,
): Promise<{
    reports: AdminReport[];
    limit: number;
    status: ReportStatus | null;
}> => {
    const url = new URL(`${API_BASE_URL}/admin/reports`);
    if (status) {
        url.searchParams.set("status", status);
    }
    url.searchParams.set("limit", limit.toString());

    const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch reports");
    }

    return response.json();
};

const updateReportStatus = async (
    reportId: string,
    status: ReportStatus,
    adminNotes?: string
): Promise<{ message: string; reportId: string; status: ReportStatus }> => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
        method: "PUT",
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, adminNotes }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error?.message || "Failed to update report status"
        );
    }

    return response.json();
};

const searchReportsByEmail = async (
    email: string,
    limit: number = 20
): Promise<ReportSearchResult> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/reports/search-by-email?email=${encodeURIComponent(email)}&limit=${limit}`,
        {
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error?.message || "Failed to search reports by email"
        );
    }

    return response.json();
};

const getReportsForImage = async (
    imageId: string
): Promise<{
    reports: AdminReport[];
    imageId: string;
    totalCount: number;
}> => {
    const response = await fetch(
        `${API_BASE_URL}/admin/images/${encodeURIComponent(imageId)}/reports`,
        {
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error?.message || "Failed to fetch image reports"
        );
    }

    return response.json();
};

export const adminService = {
    login,
    logout,
    isLoggedIn,
    getUsers,
    getUserDetails,
    deleteUser,
    deletePhoto,
    createUser,
    togglePhotoPool,
    searchBattlesWithEmails,
    getImageUrl,
    getReports,
    updateReportStatus,
    searchReportsByEmail,
    getReportsForImage,
};
