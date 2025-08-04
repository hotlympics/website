// Re-export main components for easier imports
export { default as AdminHeader } from "./components/layout/AdminHeader";
export { default as AdminLayout } from "./components/layout/AdminLayout";
export { default as AdminNavigation } from "./components/layout/AdminNavigation";

// UI Components
export { default as ConfirmationModal } from "./components/ui/ConfirmationModal";
export { default as EmptyState } from "./components/ui/EmptyState";
export { default as LoadingState } from "./components/ui/LoadingState";
export { default as Pagination } from "./components/ui/Pagination";
export { default as SearchInput } from "./components/ui/SearchInput";
export { default as StatCard } from "./components/ui/StatCard";

// User Management
export { default as UsersPage } from "./users/UsersPage";

// Types
export * from "./types/admin";
export * from "./types/common";
