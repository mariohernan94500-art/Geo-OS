// Modulo de Seguridad: Role-Based Access Control (RBAC)

export enum SystemRole {
    OWNER = 'OWNER',         // Nivel Supremo (Tú)
    ADMIN = 'ADMIN',         // Tareas elevadas, agregar permisos
    WARROOM = 'WARROOM',     // Puede ver estadísticas pero no acciones peligrosas
    BASIC = 'BASIC'          // Solo interactuar con asistente estándar
}

export interface SecurityUser {
    uid: string;            // Firebase Auth UID o Internal ID
    telegramId?: number;    // Enlace con el Bot de Telegram si aplica
    role: SystemRole;
    email?: string;
    isActive: boolean;
}

// Permisos en crudo (granularidad futura)
export const PERMISSIONS = {
    CAN_EXECUTE_PAYMENTS: [SystemRole.OWNER],
    CAN_READ_WARROOM: [SystemRole.OWNER, SystemRole.ADMIN, SystemRole.WARROOM],
    CAN_CHANGE_SETTINGS: [SystemRole.OWNER, SystemRole.ADMIN],
    CAN_CHAT: [SystemRole.OWNER, SystemRole.ADMIN, SystemRole.WARROOM, SystemRole.BASIC],
};

export function hasPermission(userRole: SystemRole, requiredRoles: SystemRole[]): boolean {
    return requiredRoles.includes(userRole);
}

export function authorizeAction(user: SecurityUser, permissionGroup: SystemRole[]) {
    if (!user.isActive) throw new Error("Acceso Denegado: Usuario Desactivado.");
    if (!hasPermission(user.role, permissionGroup)) {
        throw new Error(`Acceso Denegado: Rol ${user.role} no tiene permisos para esta acción.`);
    }
}
