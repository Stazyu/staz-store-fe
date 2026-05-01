export const ROLES = {
    ADMIN: 'admin',
    SUPER_ADMIN: 'superAdmin',
} as const;

export const isAdmin = (role?: string | null) =>
    role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
