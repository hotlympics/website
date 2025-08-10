import { useState } from "react";
import AdminLayout from "../../../components/admin/admin-layout";
import BattlesTab from "./battles";
import OverviewTab from "./overview";
import UsersTab from "./users";

type AnalyticsTab = "overview" | "users" | "battles";

const AnalyticsPage = () => {
    const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");

    const tabs: { id: AnalyticsTab; label: string }[] = [
        { id: "overview", label: "Overview" },
        { id: "users", label: "Users" },
        { id: "battles", label: "Battles" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewTab />;
            case "users":
                return <UsersTab />;
            case "battles":
                return <BattlesTab />;
            default:
                return null;
        }
    };

    return (
        <AdminLayout title="Analytics">
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

export default AnalyticsPage;
