import { useState } from "react";
import AdminLayout from "../../../components/admin/admin-layout";
import { type PhotoDeleteConfirmation } from "../../../utils/admin/photo-utils";
import { type UserDeleteConfirmation } from "../../../utils/admin/user-utils";
import type { PhotoModalData } from "../../../utils/types/admin/admin";
import BattlesTab from "./battles";
import ModerationTab from "./moderation";
import UsersTab from "./users";

type ManagementTab = "users" | "moderation" | "battles";

const ManagementPage = () => {
    const [activeTab, setActiveTab] = useState<ManagementTab>("users");
    const [battleSearchTerm, setBattleSearchTerm] = useState("");
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [userToExpand, setUserToExpand] = useState<string | null>(null);

    // Local state for modals and confirmations shared across tabs
    const [photoModal, setPhotoModal] = useState<PhotoModalData | null>(null);
    const [createUserModal, setCreateUserModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] =
        useState<PhotoDeleteConfirmation | null>(null);
    const [userDeleteConfirmation, setUserDeleteConfirmation] =
        useState<UserDeleteConfirmation | null>(null);

    const navigateToBattles = (imageId: string) => {
        setBattleSearchTerm(imageId);
        setActiveTab("battles");
        setPhotoModal(null); // Close the modal
    };

    const navigateToUsers = (email: string, userId?: string) => {
        setUserSearchTerm(email);
        setUserToExpand(userId || null);
        setActiveTab("users");
    };

    // Clear userToExpand after it's been used to prevent loops
    const clearUserToExpand = () => {
        setUserToExpand(null);
    };

    const tabs: { id: ManagementTab; label: string }[] = [
        { id: "users", label: "Users" },
        { id: "moderation", label: "Moderation" },
        { id: "battles", label: "Battles" },
    ];

    const handleTabClick = (tabId: ManagementTab) => {
        setActiveTab(tabId);
        // Clear search terms when manually switching tabs
        if (tabId === "users") {
            setUserSearchTerm("");
            setUserToExpand(null);
        } else if (tabId === "battles") {
            setBattleSearchTerm("");
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "users":
                return (
                    <UsersTab
                        photoModal={photoModal}
                        setPhotoModal={setPhotoModal}
                        createUserModal={createUserModal}
                        setCreateUserModal={setCreateUserModal}
                        deleteConfirmation={deleteConfirmation}
                        setDeleteConfirmation={setDeleteConfirmation}
                        userDeleteConfirmation={userDeleteConfirmation}
                        setUserDeleteConfirmation={setUserDeleteConfirmation}
                        onNavigateToBattles={navigateToBattles}
                        initialSearchTerm={userSearchTerm}
                        userToExpand={userToExpand}
                        onClearUserToExpand={clearUserToExpand}
                    />
                );
            case "moderation":
                return <ModerationTab />;
            case "battles":
                return <BattlesTab initialSearchTerm={battleSearchTerm} onNavigateToUsers={navigateToUsers} />;
            default:
                return null;
        }
    };

    return (
        <AdminLayout title="Management">
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeTab === tab.id
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {renderTabContent()}
        </AdminLayout>
    );
};

export default ManagementPage;
