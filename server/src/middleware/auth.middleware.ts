import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'Configuration serveur invalide' });
  }

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }

    req.userId = decoded.userId;
    next();
  });
};

// Middleware pour vérifier si l'utilisateur est admin
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // D'abord vérifier le token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Configuration serveur invalide' });
    }

    const decoded: any = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;

    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    const adminRoles = ['admin', 'moderator', 'superadmin'];
    if (!user || !adminRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
    }

    req.userRole = user.role;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    return res.status(500).json({ error: 'Erreur lors de la vérification des droits' });
  }
};

// Middleware pour vérifier si l'utilisateur est superadmin (gestion des admins)
export const requireAdminManager = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Réutiliser requireAdmin pour vérifier l'authentification et le rôle de base
    await requireAdmin(req, res, async (err?: any) => {
      if (err) {
        return;
      }

      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Accès refusé. Droits super administrateur requis.' });
      }

      req.userRole = user.role;
      next();
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur lors de la vérification des droits superadmin' });
  }
};

// Middleware pour vérifier si l'utilisateur peut gérer le contenu du site
// (admin et superadmin autorisés, moderator refusé)
export const requireAdminOrSuperadmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await requireAdmin(req, res, async () => {
      const role = req.userRole;
      if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
      }
      return next();
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur lors de la vérification des droits' });
  }
};

// Middleware pour refuser l'accès aux administrateurs (panier, commandes)
export const rejectAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const adminRoles = ['admin', 'moderator', 'superadmin'];
    if (user && adminRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Les administrateurs ne peuvent pas utiliser le panier ni passer de commande.' });
    }

    next();
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
