import type {
    AdminImageData,
    AdminUser,
    UserDetails as UserDetailsType,
} from "../../../types/admin";
import { formatDate } from "../../../utils/formatters";
import UserDetails from "./UserDetails";

interface UserRowProps {
    user: AdminUser;
    isExpanded: boolean;
    isLoadingDetails: boolean;
    userDetails: UserDetailsType | null;
    deleteLoading: string | null;
    onToggleExpansion: (userId: string) => void;
    onDeleteUser: (userId: string, userEmail: string) => void;
    onPhotoClick: (imageData: AdminImageData) => void;
    onDeletePhoto: (
        imageId: string,
        userId: string,
        event?: React.MouseEvent
    ) => void;
    deletingPhoto: string | null;
}

const UserRow = ({
    user,
    isExpanded,
    isLoadingDetails,
    userDetails,
    deleteLoading,
    onToggleExpansion,
    onDeleteUser,
    onPhotoClick,
    onDeletePhoto,
    deletingPhoto,
}: UserRowProps) => {
    return (
        <>
            <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                    <button
                        onClick={() => onToggleExpansion(user.id)}
                        className="rounded-md p-2 text-gray-400 transition-transform duration-200 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <svg
                            className={`h-5 w-5 transition-transform duration-200 ${
                                isExpanded ? "rotate-90" : ""
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
                        <div className="h-10 w-10 flex-shrink-0">
                            {user.photoUrl ? (
                                <img
                                    className="h-10 w-10 rounded-full"
                                    src={user.photoUrl}
                                    alt=""
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
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
                            <div className="text-sm text-gray-500">
                                {user.email}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
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
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {formatDate(user.dateOfBirth)}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {user.uploadedImageIds.length} uploaded,{" "}
                    {user.poolImageIds.length} in pool
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {user.rateCount}
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <button
                        onClick={() => onDeleteUser(user.id, user.email)}
                        disabled={deleteLoading === user.id}
                        className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {deleteLoading === user.id ? "Deleting..." : "Delete"}
                    </button>
                </td>
            </tr>
            {/* Expanded Row */}
            {isExpanded && (
                <tr key={`${user.id}-expanded`}>
                    <td colSpan={7} className="bg-gray-50 px-6 py-4">
                        {isLoadingDetails ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-sm text-gray-500">
                                    Loading user details...
                                </div>
                            </div>
                        ) : userDetails ? (
                            <UserDetails
                                userDetails={userDetails}
                                userId={user.id}
                                onPhotoClick={onPhotoClick}
                                onDeletePhoto={onDeletePhoto}
                                deletingPhoto={deletingPhoto}
                            />
                        ) : (
                            <div className="text-sm text-red-500">
                                Failed to load user details
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
};

export default UserRow;
