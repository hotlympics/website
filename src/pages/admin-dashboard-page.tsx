import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminService, type AdminUser, type AdminStats, type UserDetails } from "../services/admin-service";
import { compressImage, validateImageFile } from "../utils/image-compression";

interface PhotoModalData {
    imageData: {
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
    };
    isInPool: boolean;
}

const AdminDashboardPage = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
    const [userDetails, setUserDetails] = useState<Record<string, UserDetails>>({});
    const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
    const [photoModal, setPhotoModal] = useState<PhotoModalData | null>(null);
    const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        imageId: string;
        userId: string;
        isInPool: boolean;
    } | null>(null);
    const [userDeleteConfirmation, setUserDeleteConfirmation] = useState<{
        userId: string;
        userEmail: string;
        step: 'confirm' | 'final';
    } | null>(null);
    const [searchEmail, setSearchEmail] = useState<string>("");
    const [createUserModal, setCreateUserModal] = useState<boolean>(false);
    const [createUserForm, setCreateUserForm] = useState({
        email: "",
        displayName: "",
        gender: "",
        dateOfBirth: "",
        images: [] as File[],
        poolImageIndices: new Set<number>()
    });
    const [createUserLoading, setCreateUserLoading] = useState<boolean>(false);
    const [imageUploadStatus, setImageUploadStatus] = useState<string>("");
    const [togglingPool, setTogglingPool] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [usersPerPage] = useState<number>(10);
    const navigate = useNavigate();

    useEffect(() => {
        if (!adminService.isLoggedIn()) {
            navigate("/admin/login");
            return;
        }

        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, statsData] = await Promise.all([
                adminService.getUsers(),
                adminService.getStats(),
            ]);
            setUsers(usersData.users);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        adminService.logout();
        navigate("/admin/login");
    };

    const handleDeleteUser = async (userId: string, userEmail: string) => {
        // Show initial confirmation modal
        setUserDeleteConfirmation({
            userId,
            userEmail,
            step: 'confirm'
        });
    };

    const proceedToFinalConfirmation = () => {
        if (!userDeleteConfirmation) return;
        setUserDeleteConfirmation({
            ...userDeleteConfirmation,
            step: 'final'
        });
    };

    const confirmDeleteUser = async () => {
        if (!userDeleteConfirmation) return;

        const { userId } = userDeleteConfirmation;

        try {
            setDeleteLoading(userId);
            await adminService.deleteUser(userId);
            
            // Remove user from local state
            setUsers(users.filter(user => user.id !== userId));
            // Remove from expanded users
            setExpandedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            // Remove from user details
            setUserDetails(prev => {
                const newDetails = { ...prev };
                delete newDetails[userId];
                return newDetails;
            });
            
            // Reload stats
            const newStats = await adminService.getStats();
            setStats(newStats);
            
            // Close confirmation modal
            setUserDeleteConfirmation(null);
        } catch (err) {
            console.error("Error deleting user:", err);
            alert(`Failed to delete user: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleCreateUser = async () => {
        if (!createUserForm.email || !createUserForm.gender || !createUserForm.dateOfBirth) {
            alert("Please fill in all required fields (email, gender, date of birth)");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(createUserForm.email)) {
            alert("Please enter a valid email address");
            return;
        }

        // Validate date of birth (user must be 18+)
        const birthDate = new Date(createUserForm.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            alert("User must be at least 18 years old");
            return;
        }

        try {
            setCreateUserLoading(true);
            
            // Create user via admin API
            const userData = {
                email: createUserForm.email,
                displayName: createUserForm.displayName || null,
                gender: createUserForm.gender as 'male' | 'female',
                dateOfBirth: createUserForm.dateOfBirth,
                images: createUserForm.images,
                poolImageIndices: Array.from(createUserForm.poolImageIndices)
            };

            await adminService.createUser(userData);
            
            // Reset form and close modal
            setCreateUserForm({
                email: "",
                displayName: "",
                gender: "",
                dateOfBirth: "",
                images: [],
                poolImageIndices: new Set<number>()
            });
            setImageUploadStatus("");
            setCreateUserModal(false);
            
            // Reload data to show new user
            await loadData();
            
        } catch (err) {
            console.error("Error creating user:", err);
            alert(`Failed to create user: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setCreateUserLoading(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const validFiles: File[] = [];
        const errors: string[] = [];

        setImageUploadStatus("Validating and compressing images...");

        try {
            for (const file of newFiles) {
                // Validate each file
                const validation = validateImageFile(file);
                if (!validation.valid) {
                    errors.push(`${file.name}: ${validation.error}`);
                    continue;
                }

                try {
                    // Compress the image using the same settings as normal upload
                    const compressedFile = await compressImage(file, {
                        maxSizeMB: 0.5, // Compress to max 500KB
                        maxWidthOrHeight: 1280, // Max dimension 1280px
                        useWebWorker: true,
                    });

                    validFiles.push(compressedFile);
                } catch (compressionError) {
                    console.error(`Failed to compress ${file.name}:`, compressionError);
                    errors.push(`${file.name}: Failed to compress image`);
                }
            }

            if (errors.length > 0) {
                alert(`Some files could not be processed:\n${errors.join('\n')}`);
            }

            if (validFiles.length > 0) {
                setCreateUserForm(prev => ({
                    ...prev,
                    images: [...prev.images, ...validFiles]
                }));
            }
        } catch (error) {
            console.error("Image upload error:", error);
            alert("Failed to process images. Please try again.");
        } finally {
            setImageUploadStatus("");
            // Clear the input so the same files can be selected again if needed
            event.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setCreateUserForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
            poolImageIndices: new Set([...prev.poolImageIndices].filter(i => i !== index).map(i => i > index ? i - 1 : i))
        }));
    };

    const togglePoolImage = (index: number) => {
        setCreateUserForm(prev => {
            const newPoolIndices = new Set(prev.poolImageIndices);
            if (newPoolIndices.has(index)) {
                newPoolIndices.delete(index);
            } else {
                newPoolIndices.add(index);
            }
            return {
                ...prev,
                poolImageIndices: newPoolIndices
            };
        });
    };

    const toggleUserExpansion = async (userId: string) => {
        const isExpanded = expandedUsers.has(userId);
        
        if (isExpanded) {
            // Collapse
            setExpandedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        } else {
            // Expand - load user details if not already loaded
            setExpandedUsers(prev => new Set(prev).add(userId));
            
            if (!userDetails[userId]) {
                setLoadingDetails(prev => new Set(prev).add(userId));
                try {
                    const details = await adminService.getUserDetails(userId);
                    setUserDetails(prev => ({
                        ...prev,
                        [userId]: details,
                    }));
                } catch (err) {
                    console.error("Failed to load user details:", err);
                } finally {
                    setLoadingDetails(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(userId);
                        return newSet;
                    });
                }
            }
        }
    };

    const openPhotoModal = (imageData: UserDetails['imageData'][0], userId: string) => {
        const user = userDetails[userId]?.user;
        const isInPool = user?.poolImageIds.includes(imageData.imageId) || false;
        
        setPhotoModal({
            imageData,
            isInPool,
        });
    };

    const handleDeletePhoto = async (imageId: string, userId: string, event?: React.MouseEvent) => {
        // Prevent event bubbling if called from gallery
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Find if the photo is in pool
        const userDetail = userDetails[userId];
        const isInPool = userDetail?.user.poolImageIds.includes(imageId) || false;

        // Show confirmation modal
        setDeleteConfirmation({
            imageId,
            userId,
            isInPool
        });
    };

    const confirmDeletePhoto = async () => {
        if (!deleteConfirmation) return;

        const { imageId, userId } = deleteConfirmation;

        try {
            setDeletingPhoto(imageId);
            await adminService.deletePhoto(imageId);

            // Update local state - remove photo from user details
            setUserDetails(prev => {
                const updated = { ...prev };
                if (updated[userId]) {
                    updated[userId] = {
                        ...updated[userId],
                        imageData: updated[userId].imageData.filter(img => img.imageId !== imageId),
                        user: {
                            ...updated[userId].user,
                            uploadedImageIds: updated[userId].user.uploadedImageIds.filter(id => id !== imageId),
                            poolImageIds: updated[userId].user.poolImageIds.filter(id => id !== imageId),
                        }
                    };
                }
                return updated;
            });

            // Update users list
            setUsers(prev => prev.map(user => 
                user.id === userId 
                    ? {
                        ...user,
                        uploadedImageIds: user.uploadedImageIds.filter(id => id !== imageId),
                        poolImageIds: user.poolImageIds.filter(id => id !== imageId),
                    }
                    : user
            ));

            // Close modal if it's open and showing the deleted photo
            if (photoModal?.imageData.imageId === imageId) {
                setPhotoModal(null);
            }

            // Close confirmation modal
            setDeleteConfirmation(null);
        } catch (err) {
            console.error("Error deleting photo:", err);
            alert("Failed to delete photo. Please try again.");
        } finally {
            setDeletingPhoto(null);
        }
    };

    const handleTogglePhotoPool = async (imageId: string, userId: string, currentlyInPool: boolean) => {
        try {
            setTogglingPool(imageId);
            
            const result = await adminService.togglePhotoPool(imageId, userId, !currentlyInPool);
            
            // Update local state - photo modal
            if (photoModal && photoModal.imageData.imageId === imageId) {
                setPhotoModal({
                    ...photoModal,
                    isInPool: result.isInPool
                });
            }
            
            // Update local state - user details
            setUserDetails(prev => {
                const updated = { ...prev };
                if (updated[userId]) {
                    updated[userId] = {
                        ...updated[userId],
                        user: {
                            ...updated[userId].user,
                            poolImageIds: result.isInPool 
                                ? [...updated[userId].user.poolImageIds.filter(id => id !== imageId), imageId]
                                : updated[userId].user.poolImageIds.filter(id => id !== imageId)
                        },
                        imageData: updated[userId].imageData.map(img => 
                            img.imageId === imageId 
                                ? { ...img, inPool: result.isInPool }
                                : img
                        )
                    };
                }
                return updated;
            });
            
            // Update users array
            setUsers(users.map(user => 
                user.id === userId 
                    ? {
                        ...user,
                        poolImageIds: result.isInPool 
                            ? [...user.poolImageIds.filter(id => id !== imageId), imageId]
                            : user.poolImageIds.filter(id => id !== imageId)
                    }
                    : user
            ));
            
        } catch (err) {
            console.error("Failed to toggle photo pool status:", err);
            alert(`Failed to ${currentlyInPool ? 'remove from' : 'add to'} pool: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setTogglingPool(null);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString();
    };

    const getImageUrl = (fileName: string) => {
        // Construct the correct image URL using the /images/serve/ endpoint
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        return `${API_BASE_URL}/images/serve/${fileName}`;
    };

    // Filter users by email search
    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchEmail.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchEmail]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading admin dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">U</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">I</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Images</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.totalImages}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">P</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Pool Images</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.totalPoolImages}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">B</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Battles</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.totalBattles}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">G</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Gender Split</dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                M:{stats.usersByGender.male} F:{stats.usersByGender.female} U:{stats.usersByGender.unknown}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">All Users</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    Click the arrow to expand user details and view photos
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setCreateUserModal(true)}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add User
                                </button>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by email..."
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        className="block w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    {searchEmail && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => setSearchEmail("")}
                                                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                                                title="Clear search"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gender
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date of Birth
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Images
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rate Count
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user) => (
                                        <>
                                            <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleUserExpansion(user.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 transition-transform duration-200 hover:bg-gray-100 rounded-md"
                                                >
                                                    <svg
                                                        className={`w-5 h-5 transition-transform duration-200 ${
                                                            expandedUsers.has(user.id) ? "rotate-90" : ""
                                                        }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {user.photoUrl ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full"
                                                                src={user.photoUrl}
                                                                alt=""
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {user.email.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.displayName || "No name"}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.gender === "male"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : user.gender === "female"
                                                            ? "bg-pink-100 text-pink-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {user.gender}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(user.dateOfBirth)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.uploadedImageIds.length} uploaded, {user.poolImageIds.length} in pool
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.rateCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    disabled={deleteLoading === user.id}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deleteLoading === user.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded Row */}
                                        {expandedUsers.has(user.id) && (
                                            <tr key={`${user.id}-expanded`}>
                                                <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                                    {loadingDetails.has(user.id) ? (
                                                        <div className="flex items-center justify-center py-8">
                                                            <div className="text-sm text-gray-500">Loading user details...</div>
                                                        </div>
                                                    ) : userDetails[user.id] ? (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 mb-2">User Details</h4>
                                                                    <dl className="grid grid-cols-1 gap-1 text-sm">
                                                                        <div>
                                                                            <dt className="font-medium text-gray-500">Firebase UID:</dt>
                                                                            <dd className="text-gray-900 font-mono text-xs">{userDetails[user.id].user.firebaseUid}</dd>
                                                                        </div>
                                                                        <div>
                                                                            <dt className="font-medium text-gray-500">Google ID:</dt>
                                                                            <dd className="text-gray-900">{userDetails[user.id].user.googleId || "Not linked"}</dd>
                                                                        </div>
                                                                    </dl>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
                                                                    <dl className="grid grid-cols-1 gap-1 text-sm">
                                                                        <div>
                                                                            <dt className="font-medium text-gray-500">Total Photos:</dt>
                                                                            <dd className="text-gray-900">{userDetails[user.id].imageData.length}</dd>
                                                                        </div>
                                                                        <div>
                                                                            <dt className="font-medium text-gray-500">Photos in Pool:</dt>
                                                                            <dd className="text-gray-900">{userDetails[user.id].user.poolImageIds.length}</dd>
                                                                        </div>
                                                                    </dl>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Photo Gallery */}
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 mb-3">Photos</h4>
                                                                {userDetails[user.id].imageData.length > 0 ? (
                                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                                                        {userDetails[user.id].imageData.map((imageData) => {
                                                                            const isInPool = userDetails[user.id].user.poolImageIds.includes(imageData.imageId);
                                                                            const isDeleting = deletingPhoto === imageData.imageId;
                                                                            return (
                                                                                <div
                                                                                    key={imageData.id}
                                                                                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 ${
                                                                                        isInPool 
                                                                                            ? "ring-4 ring-green-400 shadow-lg" 
                                                                                            : "ring-1 ring-gray-200 hover:ring-gray-300"
                                                                                    } ${isDeleting ? "opacity-50" : ""}`}
                                                                                    onClick={() => !isDeleting && openPhotoModal(imageData, user.id)}
                                                                                >
                                                                                    <img
                                                                                        src={getImageUrl(imageData.imageUrl)}
                                                                                        alt="User photo"
                                                                                        className="w-full h-20 object-cover"
                                                                                    />
                                                                                    
                                                                                    {/* Delete button */}
                                                                                    <button
                                                                                        onClick={(e) => handleDeletePhoto(imageData.imageId, user.id, e)}
                                                                                        disabled={isDeleting}
                                                                                        className={`absolute top-1 left-1 p-1 rounded-full transition-all duration-200 ${
                                                                                            isDeleting 
                                                                                                ? "bg-gray-400 cursor-not-allowed" 
                                                                                                : "bg-red-500 hover:bg-red-600 active:bg-red-700"
                                                                                        }`}
                                                                                        title={isDeleting ? "Deleting..." : "Delete photo"}
                                                                                    >
                                                                                        {isDeleting ? (
                                                                                            <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                                            </svg>
                                                                                        ) : (
                                                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                            </svg>
                                                                                        )}
                                                                                    </button>

                                                                                    {isInPool && (
                                                                                        <div className="absolute top-1 right-1">
                                                                                            <div className="bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                                                                                                Pool
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1">
                                                                                        <div>ELO: {imageData.eloScore}</div>
                                                                                        <div>{imageData.battles} battles</div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm text-gray-500 italic">No photos uploaded</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-red-500">Failed to load user details</div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center">
                                            <div className="text-gray-500">
                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <p className="text-lg font-medium">No users found</p>
                                                {searchEmail ? (
                                                    <p className="text-sm">No users match the email "{searchEmail}"</p>
                                                ) : (
                                                    <p className="text-sm">No users available</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {filteredUsers.length > usersPerPage && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                                        <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> of{" "}
                                        <span className="font-medium">{filteredUsers.length}</span> users
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    page === currentPage
                                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Photo Detail Modal */}
            {photoModal && (
                <div 
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setPhotoModal(null)}
                >
                    <div 
                        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-medium">Photo Details</h3>
                            <button
                                onClick={() => setPhotoModal(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Photo */}
                                <div className="space-y-4">
                                    <div className={`relative rounded-lg overflow-hidden ${
                                        photoModal.isInPool ? "ring-4 ring-green-400" : "ring-1 ring-gray-300"
                                    }`}>
                                        <img
                                            src={getImageUrl(photoModal.imageData.imageUrl)}
                                            alt="Photo detail"
                                            className="w-full h-96 object-cover"
                                        />
                                        {photoModal.isInPool && (
                                            <div className="absolute top-4 right-4">
                                                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                    In Pool
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Action buttons moved here */}
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => {
                                                const userId = Object.keys(userDetails).find(uid => 
                                                    userDetails[uid].imageData.some(img => img.imageId === photoModal.imageData.imageId)
                                                );
                                                if (userId) {
                                                    handleTogglePhotoPool(photoModal.imageData.imageId, userId, photoModal.isInPool);
                                                }
                                            }}
                                            disabled={togglingPool === photoModal.imageData.imageId}
                                            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                                                togglingPool === photoModal.imageData.imageId
                                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                                    : photoModal.isInPool
                                                        ? "bg-orange-600 text-white hover:bg-orange-700"
                                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                        >
                                            {togglingPool === photoModal.imageData.imageId 
                                                ? "Updating..." 
                                                : photoModal.isInPool 
                                                    ? "Remove from Pool" 
                                                    : "Add to Pool"
                                            }
                                        </button>
                                        <button
                                            onClick={() => {
                                                const userId = Object.keys(userDetails).find(uid => 
                                                    userDetails[uid].imageData.some(img => img.imageId === photoModal.imageData.imageId)
                                                );
                                                if (userId) {
                                                    handleDeletePhoto(photoModal.imageData.imageId, userId);
                                                }
                                            }}
                                            disabled={deletingPhoto === photoModal.imageData.imageId}
                                            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                                                deletingPhoto === photoModal.imageData.imageId
                                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                                    : "bg-red-600 text-white hover:bg-red-700"
                                            }`}
                                        >
                                            {deletingPhoto === photoModal.imageData.imageId ? "Deleting..." : "Delete Photo"}
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-3">Battle Statistics</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">{photoModal.imageData.battles}</div>
                                                <div className="text-sm text-blue-800">Total Battles</div>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">{photoModal.imageData.wins}</div>
                                                <div className="text-sm text-green-800">Wins</div>
                                            </div>
                                            <div className="bg-red-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-red-600">{photoModal.imageData.losses}</div>
                                                <div className="text-sm text-red-800">Losses</div>
                                            </div>
                                            <div className="bg-yellow-50 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-yellow-600">{photoModal.imageData.draws}</div>
                                                <div className="text-sm text-yellow-800">Draws</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-3">ELO Rating</h4>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <div className="text-3xl font-bold text-purple-600">{photoModal.imageData.eloScore}</div>
                                            <div className="text-sm text-purple-800">Current Rating</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-3">Photo Information</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Image ID:</dt>
                                                <dd className="text-sm text-gray-900 font-mono">{photoModal.imageData.imageId}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Gender:</dt>
                                                <dd className="text-sm text-gray-900 capitalize">{photoModal.imageData.gender}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Date of Birth:</dt>
                                                <dd className="text-sm text-gray-900">{formatDate(photoModal.imageData.dateOfBirth)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Win Rate:</dt>
                                                <dd className="text-sm text-gray-900">
                                                    {photoModal.imageData.battles > 0 
                                                        ? `${((photoModal.imageData.wins / photoModal.imageData.battles) * 100).toFixed(1)}%`
                                                        : "No battles yet"
                                                    }
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                    onClick={() => setDeleteConfirmation(null)}
                >
                    <div 
                        className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Confirm Photo Deletion
                        </h3>
                        <p className="mb-4 text-gray-600">
                            {deleteConfirmation.isInPool
                                ? "This image is currently in the rating pool. Deleting it will remove it from the pool and permanently delete:"
                                : "Deleting this image will permanently remove:"}
                        </p>
                        <ul className="mb-6 list-disc list-inside text-sm text-gray-600 space-y-1">
                            <li>The image from cloud storage</li>
                            <li>All battle data for this image</li>
                            <li>All associated metadata</li>
                            {deleteConfirmation.isInPool && (
                                <li className="text-orange-600 font-medium">Its placement in the rating pool</li>
                            )}
                        </ul>
                        <p className="mb-6 font-medium text-gray-700">
                            This action cannot be undone. Are you sure you want to proceed?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                disabled={deletingPhoto === deleteConfirmation.imageId}
                                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeletePhoto}
                                disabled={deletingPhoto === deleteConfirmation.imageId}
                                className={`flex-1 rounded-md px-4 py-2 text-white font-medium transition-colors ${
                                    deletingPhoto === deleteConfirmation.imageId
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {deletingPhoto === deleteConfirmation.imageId ? "Deleting..." : "Delete Photo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Delete Confirmation Modal */}
            {userDeleteConfirmation && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                    onClick={() => setUserDeleteConfirmation(null)}
                >
                    <div 
                        className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {userDeleteConfirmation.step === 'confirm' ? (
                            <>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    Confirm User Deletion
                                </h3>
                                <p className="mb-4 text-gray-600">
                                    Are you sure you want to delete user <span className="font-medium text-gray-900">"{userDeleteConfirmation.userEmail}"</span>?
                                </p>
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                                    <p className="text-sm text-red-800 font-medium mb-2">This will permanently delete:</p>
                                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                        <li>User account and authentication</li>
                                        <li>All user data from Firestore</li>
                                        <li>All uploaded images from storage</li>
                                        <li>All associated image data</li>
                                    </ul>
                                </div>
                                <p className="mb-6 font-medium text-gray-700">
                                    This action cannot be undone.
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setUserDeleteConfirmation(null)}
                                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={proceedToFinalConfirmation}
                                        className="flex-1 rounded-md bg-orange-600 px-4 py-2 text-white font-medium hover:bg-orange-700"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                    Final Confirmation
                                </h3>
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                                    <p className="text-sm text-red-800 font-medium">
                                        This is your final confirmation. You are about to permanently delete:
                                    </p>
                                    <p className="text-lg font-bold text-red-900 mt-2">
                                        {userDeleteConfirmation.userEmail}
                                    </p>
                                </div>
                                <p className="mb-6 text-red-600 font-medium">
                                    This action is irreversible and will completely remove all data associated with this user.
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setUserDeleteConfirmation({
                                            ...userDeleteConfirmation,
                                            step: 'confirm'
                                        })}
                                        disabled={deleteLoading === userDeleteConfirmation.userId}
                                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={confirmDeleteUser}
                                        disabled={deleteLoading === userDeleteConfirmation.userId}
                                        className={`flex-1 rounded-md px-4 py-2 text-white font-medium transition-colors ${
                                            deleteLoading === userDeleteConfirmation.userId
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-red-600 hover:bg-red-700"
                                        }`}
                                    >
                                        {deleteLoading === userDeleteConfirmation.userId ? "Deleting User..." : "Delete User"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {createUserModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                    onClick={() => setCreateUserModal(false)}
                >
                    <div 
                        className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-6 text-xl font-semibold text-gray-900">
                            Create New User
                        </h3>
                        
                        <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-6">
                            {/* Required Fields */}
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                                <h4 className="font-medium text-blue-900 mb-3">Required Information</h4>
                                
                                {/* Email */}
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={createUserForm.email}
                                        onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="user@example.com"
                                    />
                                </div>

                                {/* Gender */}
                                <div className="mb-4">
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        id="gender"
                                        required
                                        value={createUserForm.gender}
                                        onChange={(e) => setCreateUserForm(prev => ({ ...prev, gender: e.target.value }))}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth * <span className="text-sm text-gray-500">(Must be 18+)</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        required
                                        value={createUserForm.dateOfBirth}
                                        onChange={(e) => setCreateUserForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            {/* Optional Fields */}
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                                <h4 className="font-medium text-gray-900 mb-3">Optional Information</h4>
                                
                                {/* Display Name */}
                                <div>
                                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        id="displayName"
                                        value={createUserForm.displayName}
                                        onChange={(e) => setCreateUserForm(prev => ({ ...prev, displayName: e.target.value }))}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                <h4 className="font-medium text-green-900 mb-3">Upload Images</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                                            Add Photos (Optional)
                                        </label>
                                        <input
                                            type="file"
                                            id="images"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={!!imageUploadStatus}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Select multiple images to upload for this user. Images will be automatically compressed to WebP format.
                                        </p>
                                        {imageUploadStatus && (
                                            <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600">
                                                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                                <span>{imageUploadStatus}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Previews */}
                                    {createUserForm.images.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Selected Images ({createUserForm.images.length})
                                                {createUserForm.poolImageIndices.size > 0 && (
                                                    <span className="ml-2 text-blue-600">
                                                        • {createUserForm.poolImageIndices.size} will be added to pool
                                                    </span>
                                                )}
                                            </p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {createUserForm.images.map((image, index) => {
                                                    const isInPool = createUserForm.poolImageIndices.has(index);
                                                    return (
                                                        <div key={index} className="relative group">
                                                            <div className={`relative rounded-md border-2 transition-colors ${
                                                                isInPool ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                                            }`}>
                                                                <img
                                                                    src={URL.createObjectURL(image)}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-24 object-cover rounded-md"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(index)}
                                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                                >
                                                                    ×
                                                                </button>
                                                                {isInPool && (
                                                                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                                                        Pool
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mt-2 space-y-1">
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {image.name}
                                                                </p>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => togglePoolImage(index)}
                                                                    className={`w-full text-xs py-1 px-2 rounded transition-colors ${
                                                                        isInPool
                                                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                    }`}
                                                                >
                                                                    {isInPool ? 'Remove from Pool' : 'Add to Pool'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCreateUserModal(false)}
                                    disabled={createUserLoading}
                                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createUserLoading || !createUserForm.email || !createUserForm.gender || !createUserForm.dateOfBirth}
                                    className={`flex-1 rounded-md px-4 py-2 text-white font-medium transition-colors ${
                                        createUserLoading || !createUserForm.email || !createUserForm.gender || !createUserForm.dateOfBirth
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    {createUserLoading ? "Creating User..." : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;