import { useState } from "react";
import AdminLayout from "../../features/admin/components/AdminLayout";

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
                return (
                    <div className="bg-white shadow sm:rounded-md p-6">
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900">Analytics Overview</h3>
                            <p className="mt-2 text-sm text-gray-500">Coming soon...</p>
                        </div>
                    </div>
                );
            case "users":
                return (
                    <div className="bg-white shadow sm:rounded-md p-6">
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900">User Analytics</h3>
                            <p className="mt-2 text-sm text-gray-500">Coming soon...</p>
                        </div>
                    </div>
                );
            case "battles":
                return (
                    <div className="bg-white shadow sm:rounded-md p-6">
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900">Battle Analytics</h3>
                            <p className="mt-2 text-sm text-gray-500">Coming soon...</p>
                        </div>
                    </div>
                );
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
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
