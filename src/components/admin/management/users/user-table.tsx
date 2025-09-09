import type {
    AdminImageData,
    AdminUser,
    UserDetails,
} from "../../../../utils/types/admin/admin";
import EmptyState from "../../shared/empty-state";
import SearchButton from "../../shared/search-button";
import SearchInput from "../../shared/search-input";
import UserRow from "./user-row";

interface UserTableProps {
    users: AdminUser[];
    expandedUsers: Set<string>;
    loadingDetails: Set<string>;
    userDetails: Record<string, UserDetails>;
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
    onCreateUser: () => void;
    searchEmail: string;
    activeSearchTerm: string;
    onSearchEmailChange: (value: string) => void;
    onSearch: (event: React.FormEvent) => void;
    isSearchMode: boolean;
    loading: boolean;
}

const UserTable = ({
    users,
    expandedUsers,
    loadingDetails,
    userDetails,
    deleteLoading,
    onToggleExpansion,
    onDeleteUser,
    onPhotoClick,
    onDeletePhoto,
    deletingPhoto,
    onCreateUser,
    searchEmail,
    activeSearchTerm,
    onSearchEmailChange,
    onSearch,
    isSearchMode,
    loading,
}: UserTableProps) => {
    return (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            All Users
                        </h3>
                        {isSearchMode && (
                            <p className="mt-1 text-sm text-blue-600">
                                Showing search results for "{activeSearchTerm}"
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onCreateUser}
                            className="flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                        >
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Add User
                        </button>
                        <form
                            onSubmit={onSearch}
                            className="flex items-center space-x-2"
                        >
                            <SearchInput
                                value={searchEmail}
                                onChange={onSearchEmailChange}
                                placeholder="Search by email..."
                            />
                            <SearchButton
                                onClick={() => {}}
                                loading={loading}
                                disabled={loading}
                            />
                        </form>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Gender
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Date of Birth
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Images
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Rate Count
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    isExpanded={expandedUsers.has(user.id)}
                                    isLoadingDetails={loadingDetails.has(
                                        user.id
                                    )}
                                    userDetails={userDetails[user.id] || null}
                                    deleteLoading={deleteLoading}
                                    onToggleExpansion={onToggleExpansion}
                                    onDeleteUser={onDeleteUser}
                                    onPhotoClick={onPhotoClick}
                                    onDeletePhoto={onDeletePhoto}
                                    deletingPhoto={deletingPhoto}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7}>
                                    <EmptyState
                                        title="No users found"
                                        description="No users available"
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;
