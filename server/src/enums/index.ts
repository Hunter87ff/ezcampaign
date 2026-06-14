export enum Role {
    ADMIN = "admin",
    MANAGER = "manager"
}

export enum LeadStatus {
    NEW = "new",
    CONTACTED = "contacted",
    RESPONDED = "responded",
    CONVERTED = "converted",
    CLOSED = "closed"
}

export enum BusinessType {
    REAL_ESTATE = "real_estate",
    HEALTHCARE = "healthcare",
    EDUCATION = "education",
    ECOMMERCE = "ecommerce",
    FINANCE = "finance",
    RESTAURANT = "restaurant",
    TRAVEL = "travel",
    OTHER = "other"
}

const enums = {
    Role,
    LeadStatus,
    BusinessType
}

export default enums;

