import { useState } from "react";
import AdminLayout from "../../../components/admin/admin-layout";
import NotificationsTab from "./notifications";
import ReportsTab from "./reports";
import TestingTab from "./testing";

type AdvancedTab = "testing" | "notifications" | "reports";

const AdvancedPage = () => {
    const [activeTab, setActiveTab] = useState<AdvancedTab>("testing");

    const tabs: { id: AdvancedTab; label: string }[] = [
        { id: "testing", label: "A/B Testing" },
        { id: "notifications", label: "Notifications" },
        { id: "reports", label: "Reports" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "testing":
                return <TestingTab />;
            case "notifications":
                return <NotificationsTab />;
            case "reports":
                return <ReportsTab />;
            default:
                return null;
        }
    };

    return (
        <AdminLayout title="Advanced Features">
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
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

export default AdvancedPage;
