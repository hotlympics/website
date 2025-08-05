import AdminLayout from "../components/layout/AdminLayout";

const AdvancedPage = () => {
    return (
        <AdminLayout title="Advanced Features">
            <div className="py-16 text-center">
                <h2 className="mb-4 text-2xl font-semibold text-gray-700">
                    Advanced Features
                </h2>
                <p className="text-gray-500">
                    Coming Soon - A/B Testing, Notifications, and Reports
                </p>
            </div>
        </AdminLayout>
    );
};

export default AdvancedPage;
