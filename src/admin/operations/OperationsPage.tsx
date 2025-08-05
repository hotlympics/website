import AdminLayout from "../components/layout/AdminLayout";

const OperationsPage = () => {
    return (
        <AdminLayout title="System Operations">
            <div className="py-16 text-center">
                <h2 className="mb-4 text-2xl font-semibold text-gray-700">
                    System Operations
                </h2>
                <p className="text-gray-500">
                    Coming Soon - Cloud Costs, Performance, and Database
                    Monitoring
                </p>
            </div>
        </AdminLayout>
    );
};

export default OperationsPage;
