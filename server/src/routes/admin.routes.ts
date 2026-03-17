import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware.js';
import prisma from '../config/database.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification admin
router.use(authenticateToken);
router.use(requireAdmin);

// ========== GESTION DES STOCKS ==========

// Obtenir tous les produits avec leurs stocks
router.get('/products', async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({ products });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
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

// Supprimer un produit
router.delete('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Produit non trouvé' });
    if (error.code === 'P2003') return res.status(400).json({ error: 'Impossible de supprimer : ce produit est lié à des commandes' });
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

// Mettre à jour le stock d'un produit
router.put(
  '/products/:id/stock',
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

// ========== GESTION DES COMMANDES ==========

// Obtenir toutes les commandes
router.get('/orders', async (req: AuthRequest, res: Response) => {
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
router.get('/orders/:id', async (req: AuthRequest, res: Response) => {
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
      const { status } = req.body;

      const order = await prisma.order.update({
        where: { id },
        data: { status },
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

// ========== GESTION DES MESSAGES ==========

// Obtenir tous les messages de contact
router.get('/messages', async (req: AuthRequest, res: Response) => {
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
router.get('/messages/:id', async (req: AuthRequest, res: Response) => {
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

router.get('/settings/about', async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { key: 'about' } });
    const content = settings?.content ? JSON.parse(settings.content) : DEFAULT_ABOUT;
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/settings/about', async (req: AuthRequest, res: Response) => {
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

router.get('/settings/contact', async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { key: 'contact' } });
    const content = settings?.content ? JSON.parse(settings.content) : DEFAULT_CONTACT;
    res.json(content);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/settings/contact', async (req: AuthRequest, res: Response) => {
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
