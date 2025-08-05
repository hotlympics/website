import type {
    AdminImageData,
    UserDetails as UserDetailsType,
} from "../../types/admin";
import UserPhotoGallery from "./user-photo-gallery";

interface UserDetailsProps {
    userDetails: UserDetailsType;
    userId: string;
    onPhotoClick: (imageData: AdminImageData) => void;
    onDeletePhoto: (
        imageId: string,
        userId: string,
        event?: React.MouseEvent
    ) => void;
    deletingPhoto: string | null;
}

const UserDetails = ({
    userDetails,
    userId,
    onPhotoClick,
    onDeletePhoto,
    deletingPhoto,
}: UserDetailsProps) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <h4 className="mb-2 font-medium text-gray-900">
                        User Details
                    </h4>
                    <dl className="grid grid-cols-1 gap-1 text-sm">
                        <div>
                            <dt className="font-medium text-gray-500">
                                Firebase UID:
                            </dt>
                            <dd className="font-mono text-xs text-gray-900">
                                {userDetails.user.firebaseUid}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">
                                Google ID:
                            </dt>
                            <dd className="text-gray-900">
                                {userDetails.user.googleId || "Not linked"}
                            </dd>
                        </div>
                    </dl>
                </div>
                <div>
                    <h4 className="mb-2 font-medium text-gray-900">
                        Statistics
                    </h4>
                    <dl className="grid grid-cols-1 gap-1 text-sm">
                        <div>
                            <dt className="font-medium text-gray-500">
                                Total Photos:
                            </dt>
                            <dd className="text-gray-900">
                                {userDetails.imageData.length}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">
                                Photos in Pool:
                            </dt>
                            <dd className="text-gray-900">
                                {userDetails.user.poolImageIds.length}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <UserPhotoGallery
                imageData={userDetails.imageData}
                poolImageIds={userDetails.user.poolImageIds}
                onPhotoClick={onPhotoClick}
                onDeletePhoto={onDeletePhoto}
                deletingPhoto={deletingPhoto}
                userId={userId}
            />
        </div>
    );
};

export default UserDetails;
