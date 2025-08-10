import { useState } from "react";
import AdminLayout from "../../../components/admin/admin-layout";
import CostsTab from "./costs";
import MonitoringTab from "./monitoring";
import PerformanceTab from "./performance";

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
                return <MonitoringTab />;
            case "costs":
                return <CostsTab />;
            case "performance":
                return <PerformanceTab />;
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
