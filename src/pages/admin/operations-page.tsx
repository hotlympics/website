import { useState } from "react";
import AdminLayout from "../../components/admin/admin-layout";

type OperationsTab = "monitoring" | "costs" | "performance";

const OperationsPage = () => {
    const [activeTab, setActiveTab] = useState<OperationsTab>("monitoring");

    const tabs: { id: OperationsTab; label: string }[] = [
        { id: "monitoring", label: "Monitoring" },
        { id: "costs", label: "Costs" },
        { id: "performance", label: "Performance" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "monitoring":
                return (
                    <div className="bg-white p-6 shadow sm:rounded-md">
                        <div className="py-12 text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                System Monitoring
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Coming soon...
                            </p>
                        </div>
                    </div>
                );
            case "costs":
                return (
                    <div className="bg-white p-6 shadow sm:rounded-md">
                        <div className="py-12 text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Cloud Costs
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Coming soon...
                            </p>
                        </div>
                    </div>
                );
            case "performance":
                return (
                    <div className="bg-white p-6 shadow sm:rounded-md">
                        <div className="py-12 text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Performance Metrics
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Coming soon...
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AdminLayout title="System Operations">
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

export default OperationsPage;
