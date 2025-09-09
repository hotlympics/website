// Re-export types from admin service to maintain clean imports
export type {
    AdminImageData,
    AdminReport,
    AdminUser,
    CreateUserData,
    ReportCategory,
    ReportStatus,
    UserDetails,
} from "../../../services/admin/admin-service";

// Re-export types from photo utils
export type {
    PhotoDeleteConfirmation,
    PhotoModalData,
} from "../../admin/photo-utils";
