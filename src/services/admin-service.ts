const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
    eloScore: number;
    inPool: boolean;
}

export interface AdminStats {
    totalUsers: number;
    totalImages: number;
    totalBattles: number;
    totalPoolImages: number;
    usersByGender: {
        male: number;
        female: number;
        unknown: number;
    };
}

export interface UserDetails {
    user: AdminUser;
    imageData: AdminImageData[];
}

export interface CreateUserData {
    email: string;
    displayName: string | null;
    gender: 'male' | 'female';
    dateOfBirth: string;
    images: File[];
    poolImageIndices?: number[];
}

export interface PhotoModalData {
    imageData: AdminImageData;
    isInPool: boolean;
}

class AdminService {
    private getAuthHeaders(): { Authorization: string } {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            throw new Error("No admin token found");
        }
        return { Authorization: `Bearer ${token}` };
    }

    async login(username: string, password: string): Promise<{ token: string }> {
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
    }

    logout(): void {
        localStorage.removeItem("adminToken");
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem("adminToken");
    }

    async getUsers(): Promise<{ users: AdminUser[] }> {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to fetch users");
        }

        return response.json();
    }

    async getUserDetails(userId: string): Promise<UserDetails> {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to fetch user details");
        }

        return response.json();
    }

    async deleteUser(userId: string): Promise<{ message: string; deletedUserId: string; deletedImageCount: number }> {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to delete user");
        }

        return response.json();
    }

    async getStats(): Promise<AdminStats> {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to fetch stats");
        }

        return response.json();
    }

    async deletePhoto(imageId: string): Promise<{ message: string; deletedImageId: string; userId: string }> {
        const response = await fetch(`${API_BASE_URL}/admin/photos/${imageId}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to delete photo");
        }

        return response.json();
    }

    async createUser(userData: CreateUserData): Promise<{ message: string; userId: string; uploadedImages: number }> {
        const formData = new FormData();
        formData.append('email', userData.email);
        formData.append('gender', userData.gender);
        formData.append('dateOfBirth', userData.dateOfBirth);
        
        if (userData.displayName) {
            formData.append('displayName', userData.displayName);
        }

        // Add images to form data
        userData.images.forEach((image) => {
            formData.append(`images`, image);
        });

        // Add pool image indices if any
        if (userData.poolImageIndices && userData.poolImageIndices.length > 0) {
            formData.append('poolImageIndices', JSON.stringify(userData.poolImageIndices));
        }

        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to create user");
        }

        return response.json();
    }

    async togglePhotoPool(imageId: string, userId: string, addToPool: boolean): Promise<{ message: string; isInPool: boolean }> {
        const response = await fetch(`${API_BASE_URL}/admin/photos/${imageId}/pool`, {
            method: "PUT",
            headers: {
                ...this.getAuthHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, addToPool }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Failed to toggle photo pool status");
        }

        return response.json();
    }
}

export const adminService = new AdminService();