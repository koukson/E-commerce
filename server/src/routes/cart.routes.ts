import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, rejectAdmin, AuthRequest } from '../middleware/auth.middleware.js';
import prisma from '../config/database.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification et refusent les admins
router.use(authenticateToken);
router.use(rejectAdmin);

// Obtenir le panier de l'utilisateur
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId,
        product: { deletedAt: null },
      },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    type CartItemWithProduct = typeof cartItems[0];

    const items = cartItems.map((item: CartItemWithProduct) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    const total = cartItems.reduce(
      (sum: number, item: CartItemWithProduct) => sum + item.product.price * item.quantity,
      0
    );

    res.json({
      items,
      total,
      itemCount: cartItems.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0),
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du panier:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du panier' });
  }
});

// Ajouter un produit au panier
router.post(
  '/add',
  [
    body('productId').notEmpty().withMessage('L\'ID du produit est requis'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('La quantité doit être un entier positif'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.userId!;
      const { productId, quantity = 1 } = req.body;

      // Vérifier que le produit existe et n'a pas été supprimé
      const product = await prisma.product.findFirst({
        where: { id: productId, deletedAt: null },
      });

      if (!product) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

      // Vérifier le stock disponible
      const existingCartItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      const newQuantity = existingCartItem
        ? existingCartItem.quantity + quantity
        : quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          error: `Stock insuffisant. Disponible: ${product.stock}`,
        });
      }

      // Ajouter ou mettre à jour l'article dans le panier
      const cartItem = await prisma.cartItem.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {
          quantity: newQuantity,
        },
        create: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: true,
        },
      });

      res.json({
        message: 'Produit ajouté au panier',
        item: {
          product: cartItem.product,
          quantity: cartItem.quantity,
        },
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      res.status(500).json({ error: 'Erreur lors de l\'ajout au panier' });
    }
  }
);

// Mettre à jour la quantité d'un article dans le panier
router.put(
  '/update/:productId',
  [
    body('quantity').isInt({ min: 1 }).withMessage('La quantité doit être un entier positif'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.userId!;
      const { productId } = req.params;
      const { quantity } = req.body;

      // Vérifier que le produit existe, n'a pas été supprimé et vérifier le stock disponible
      const product = await prisma.product.findFirst({
        where: { id: productId, deletedAt: null },
      });

      if (!product) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          error: `Stock insuffisant. Disponible: ${product.stock}`,
        });
      }

      const cartItem = await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        data: { quantity },
        include: {
          product: true,
        },
      });

      res.json({
        message: 'Quantité mise à jour',
        item: {
          product: cartItem.product,
          quantity: cartItem.quantity,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Article non trouvé dans le panier' });
      }
      console.error('Erreur lors de la mise à jour du panier:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du panier' });
    }
  }
);

// Supprimer un article du panier
router.delete('/remove/:productId', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { productId } = req.params;

    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    res.json({ message: 'Article supprimé du panier' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Article non trouvé dans le panier' });
    }
    console.error('Erreur lors de la suppression du panier:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du panier' });
  }
});

// Vider le panier
router.delete('/clear', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    res.json({ message: 'Panier vidé avec succès' });
  } catch (error: any) {
    console.error('Erreur lors du vidage du panier:', error);
    res.status(500).json({ error: 'Erreur lors du vidage du panier' });
  }
});

export default router;
