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


const enums = {
    Role,
    LeadStatus
}

export default enums;

