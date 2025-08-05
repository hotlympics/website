import AdminLayout from "../components/layout/AdminLayout";

const AnalyticsPage = () => {
    return (
        <AdminLayout title="Analytics">
            <div className="py-16 text-center">
                <h2 className="mb-4 text-2xl font-semibold text-gray-700">
                    Analytics Dashboard
                </h2>
                <p className="text-gray-500">
                    Coming Soon - User, Image, and Battle Analytics
                </p>
            </div>
        </AdminLayout>
    );
};

export default AnalyticsPage;
