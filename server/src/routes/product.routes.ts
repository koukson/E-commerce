import express from 'express';
import { body, query, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Obtenir tous les produits avec filtres optionnels
router.get('/', async (req, res) => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category && category !== 'Tous') {
      where.category = category as string;
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      where.OR = [
        { name: { contains: searchLower } },
        { description: { contains: searchLower } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
});

// Obtenir un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json(product);
  } catch (error: any) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
});

// Créer un produit (admin uniquement)
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('description').trim().notEmpty().withMessage('La description est requise'),
    body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('image').trim().notEmpty().withMessage('L\'image est requise'),
    body('category').trim().notEmpty().withMessage('La catégorie est requise'),
    body('stock').isInt({ min: 0 }).withMessage('Le stock doit être un entier positif'),
  ],
  async (req: import('express').Request, res: import('express').Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await prisma.product.create({
        data: req.body,
      });

      res.status(201).json(product);
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      res.status(500).json({ error: 'Erreur lors de la création du produit' });
    }
  }
);

// Mettre à jour un produit (admin uniquement)
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('image').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('stock').optional().isInt({ min: 0 }),
  ],
  async (req: import('express').Request, res: import('express').Response) => {
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

      res.json(product);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }
      console.error('Erreur lors de la mise à jour du produit:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
    }
  }
);

// Supprimer un produit (admin uniquement)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

// Obtenir toutes les catégories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    res.json({ categories: categories.map((c: { category: string }) => c.category) });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
});

export default router;
