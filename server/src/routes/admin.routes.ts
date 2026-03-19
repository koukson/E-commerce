import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin, requireAdminManager, AuthRequest } from '../middleware/auth.middleware.js';
import prisma from '../config/database.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification admin
router.use(authenticateToken);
router.use(requireAdmin);

// ========== GESTION DES STOCKS ==========

// Obtenir tous les produits avec leurs stocks (exclut les produits supprimés)
router.get('/products', async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });

    res.json({ products });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
});

// Obtenir tous les produits supprimés
router.get('/products/deleted', async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });

    res.json({ products });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des produits supprimés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits supprimés' });
  }
});

// Créer un nouveau produit
router.post(
  '/products',
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('description').trim().notEmpty().withMessage('La description est requise'),
    body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('image').trim().notEmpty().withMessage("L'image est requise"),
    body('category').trim().notEmpty().withMessage('La catégorie est requise'),
    body('stock').isInt({ min: 0 }).withMessage('Le stock doit être un entier positif'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const product = await prisma.product.create({ data: req.body });
      res.status(201).json({ message: 'Produit créé', product });
    } catch (error: any) {
      console.error('Erreur création produit:', error);
      res.status(500).json({ error: 'Erreur lors de la création du produit' });
    }
  }
);

// Modifier un produit existant
router.put(
  '/products/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('image').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('stock').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const product = await prisma.product.update({
        where: { id },
        data: req.body,
      });
      res.json({ message: 'Produit mis à jour', product });
    } catch (error: any) {
      if (error.code === 'P2025') return res.status(404).json({ error: 'Produit non trouvé' });
      res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
    }
  }
);

// Supprimer un produit (soft delete)
router.delete('/products/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Produit supprimé avec succès', product });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Produit non trouvé' });
    console.error('Erreur lors de la suppression du produit :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

// Mettre à jour le stock d'un produit
router.put(
  '/products/:id/stock',
  requireAdmin,
  [
    body('stock').isInt({ min: 0 }).withMessage('Le stock doit être un entier positif'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { stock } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: { stock: parseInt(stock) },
      });

      res.json({ message: 'Stock mis à jour avec succès', product });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }
      console.error('Erreur lors de la mise à jour du stock:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du stock' });
    }
  }
);

// Restaurer un produit supprimé
router.put('/products/:id/restore', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });

    res.json({ message: 'Produit restauré avec succès', product });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Produit non trouvé' });
    console.error('Erreur lors de la restauration du produit :', error);
    res.status(500).json({ error: 'Erreur lors de la restauration du produit' });
  }
});

// ========== GESTION DES COMMANDES ==========

// Obtenir toutes les commandes
router.get('/orders', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

// Obtenir une commande spécifique
router.get('/orders/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({ order });
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
});

// Mettre à jour le statut d'une commande
router.put(
  '/orders/:id/status',
  requireAdmin,
  [
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Statut invalide'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status: newStatus } = req.body;

      // Récupérer la commande actuelle pour vérifier le statut et les articles
      const existingOrder = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      });

      if (!existingOrder) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      const shouldRestock = newStatus === 'cancelled' && existingOrder.status !== 'cancelled';

      const order = await prisma.$transaction(async (tx) => {
        if (shouldRestock) {
          // Restock the products when an order is cancelled
          for (const item of existingOrder.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        return tx.order.update({
          where: { id },
          data: { status: newStatus },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      });

      res.json({ message: 'Statut de la commande mis à jour', order });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
    }
  }
);

// ========== GESTION DES UTILISATEURS ==========

// Obtenir tous les utilisateurs (sauf superadmin pour les non-superadmin)
router.get('/users', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const currentUserRole = req.userRole;
    const where: any = {};

    // Les admins ne peuvent pas voir les superadmin
    if (currentUserRole !== 'superadmin') {
      where.role = { not: 'superadmin' };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Créer un nouvel utilisateur/admin
router.post(
  '/users',
  requireAdmin,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('role').isIn(['user', 'moderator', 'admin']).withMessage('Rôle invalide'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role } = req.body;
      const currentUserRole = req.userRole;

      // Vérifier que l'utilisateur actuel peut créer ce rôle
      if (role === 'admin' && currentUserRole !== 'superadmin') {
        return res.status(403).json({ error: 'Seul un super administrateur peut créer des administrateurs' });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(201).json({ message: 'Utilisateur créé avec succès', user });
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
  }
);

// Modifier un utilisateur
router.put(
  '/users/:id',
  requireAdmin,
  [
    body('name').optional().trim().isLength({ min: 2 }),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['user', 'moderator', 'admin']),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, email, role } = req.body;
      const currentUserRole = req.userRole;

      // Vérifier que l'utilisateur à modifier existe
      const userToUpdate = await prisma.user.findUnique({
        where: { id },
        select: { role: true, email: true },
      });

      if (!userToUpdate) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Empêcher la modification des superadmin par les non-superadmin
      if (userToUpdate.role === 'superadmin' && currentUserRole !== 'superadmin') {
        return res.status(403).json({ error: 'Vous ne pouvez pas modifier un super administrateur' });
      }

      // Vérifier que l'utilisateur actuel peut attribuer ce rôle
      if (role === 'admin' && currentUserRole !== 'superadmin') {
        return res.status(403).json({ error: 'Seul un super administrateur peut attribuer le rôle administrateur' });
      }

      // Vérifier l'unicité de l'email si modifié
      if (email && email !== userToUpdate.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });
        if (existingUser) {
          return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
      }

      // Préparer les données de mise à jour
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      });

      res.json({ message: 'Utilisateur modifié avec succès', user });
    } catch (error: any) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error);
      res.status(500).json({ error: 'Erreur lors de la modification de l\'utilisateur' });
    }
  }
);

// Supprimer un utilisateur
router.delete('/users/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserRole = req.userRole;

    // Vérifier que l'utilisateur à supprimer existe
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Empêcher la suppression des superadmin par les non-superadmin
    if (userToDelete.role === 'superadmin' && currentUserRole !== 'superadmin') {
      return res.status(403).json({ error: 'Vous ne pouvez pas supprimer un super administrateur' });
    }

    // Empêcher la suppression de soi-même
    if (id === req.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous supprimer vous-même' });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// ========== GESTION DES ADMINISTRATEURS (SUPERADMIN UNIQUEMENT) ==========

// Obtenir tous les administrateurs
router.get('/admins', requireAdminManager, async (req: AuthRequest, res: Response) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['moderator', 'admin', 'superadmin'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { role: 'desc' }, // superadmin en premier
    });

    res.json({ admins });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des administrateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des administrateurs' });
  }
});

// Modifier le rôle d'un administrateur
router.put(
  '/admins/:id/role',
  requireAdminManager,
  [
    body('role').isIn(['moderator', 'admin', 'superadmin']).withMessage('Rôle invalide'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { role } = req.body;

      // Vérifier que l'utilisateur existe et est un admin
      const adminToUpdate = await prisma.user.findUnique({
        where: { id },
        select: { role: true, name: true },
      });

      if (!adminToUpdate) {
        return res.status(404).json({ error: 'Administrateur non trouvé' });
      }

      if (!['moderator', 'admin', 'superadmin'].includes(adminToUpdate.role)) {
        return res.status(400).json({ error: 'Cet utilisateur n\'est pas un administrateur' });
      }

      // Empêcher la modification de son propre rôle
      if (id === req.userId) {
        return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre rôle' });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      });

      res.json({ message: 'Rôle modifié avec succès', user });
    } catch (error: any) {
      console.error('Erreur lors de la modification du rôle:', error);
      res.status(500).json({ error: 'Erreur lors de la modification du rôle' });
    }
  }
);

// Obtenir tous les messages de contact
router.get('/messages', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { responded } = req.query;

    const where: any = {};
    if (responded !== undefined) {
      where.responded = responded === 'true';
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ messages });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// Obtenir un message spécifique
router.get('/messages/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json({ message });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du message:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du message' });
  }
});

// ========== GESTION DU CONTENU DU SITE (About / Contact) ==========

const DEFAULT_ABOUT = {
  title: 'À propos de nous',
  subtitle: 'Votre boutique en ligne de confiance depuis le premier clic.',
  history: "Nous avons créé cette boutique avec une idée simple : proposer des produits de qualité à des prix justes, avec un service client à l'écoute.",
  values: 'Qualité, transparence et respect de nos clients.',
  security: 'Paiement sécurisé et données protégées.',
  delivery: 'Livraison gratuite à partir de 50 € d\'achat.',
  service: "Une équipe disponible pour répondre à vos questions.",
  ctaTitle: 'Une question ?',
  ctaText: 'Notre équipe est à votre disposition pour toute demande.',
};

const DEFAULT_CONTACT = {
  pageTitle: 'Nous contacter',
  pageSubtitle: 'Une question, une suggestion ? Envoyez-nous un message.',
  email: 'contact@ecommerce.fr',
  emailLabel: 'Réponse sous 24–48 h',
  phone: '+33 1 23 45 67 89',
  phoneLabel: 'Lun–Ven 9h–18h',
  address: '123 rue du Commerce, 75001 Paris, France',
};

router.get('/settings/about', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { key: 'about' } });
    const content = settings?.content ? JSON.parse(settings.content) : DEFAULT_ABOUT;
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/settings/about', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const content = req.body;
    await prisma.siteSettings.upsert({
      where: { key: 'about' },
      update: { content: JSON.stringify(content) },
      create: { key: 'about', content: JSON.stringify(content) },
    });
    res.json({ message: 'Contenu À propos mis à jour' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/settings/contact', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { key: 'contact' } });
    const content = settings?.content ? JSON.parse(settings.content) : DEFAULT_CONTACT;
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/settings/contact', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const content = req.body;
    await prisma.siteSettings.upsert({
      where: { key: 'contact' },
      update: { content: JSON.stringify(content) },
      create: { key: 'contact', content: JSON.stringify(content) },
    });
    res.json({ message: 'Coordonnées Contact mises à jour' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Répondre à un message
router.post(
  '/messages/:id/respond',
  requireAdmin,
  [
    body('response').trim().notEmpty().withMessage('La réponse est requise'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { response } = req.body;

      const message = await prisma.contactMessage.update({
        where: { id },
        data: {
          response,
          responded: true,
        },
      });

      res.json({ message: 'Réponse enregistrée avec succès', contactMessage: message });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Message non trouvé' });
      }
      console.error('Erreur lors de l\'enregistrement de la réponse:', error);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la réponse' });
    }
  }
);

export default router;
