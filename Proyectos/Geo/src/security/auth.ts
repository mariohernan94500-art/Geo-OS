import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { SystemRole, SecurityUser } from './rbac.js';

const JWT_SECRET = process.env.JWT_SECRET || 'llave-secreta-temporal-cambiar-en-produccion';
const JWT_EXPIRES_IN = '1d';

// Interfaz para extender Request de Express
export interface GeoRequest extends Request {
    user?: SecurityUser;
}

export function generateToken(user: SecurityUser): string {
    return jwt.sign(
        { uid: user.uid, role: user.role, isActive: user.isActive },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export function verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
}

// Middleware de Express para Seguridad General
export const requireAuth = (req: GeoRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Acceso Denegado: Token no proporcionado' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token) as SecurityUser;

        if (!payload.isActive) {
            res.status(403).json({ error: 'Acceso Denegado: Cuenta suspendida' });
            return;
        }

        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
        return;
    }
};

// Middleware para validar Roles Específicos
export const requireRole = (requiredRoles: SystemRole[]) => {
    return (req: GeoRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        if (!requiredRoles.includes(req.user.role)) {
            res.status(403).json({ 
                error: `Acceso Denegado: Se requiere Módulo de Seguridad Nivel ${requiredRoles.join(' o ')}` 
            });
            return;
        }

        next();
    };
};
