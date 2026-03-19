import express, { Response } from 'express';
import { authenticateToken, rejectAdmin, AuthRequest } from '../middleware/auth.middleware.js';
import prisma from '../config/database.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Créer une commande depuis le panier (interdit aux admins)
router.post('/create', rejectAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Récupérer les articles du panier (exclut les produits supprimés)
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId,
        product: {
          deletedAt: null,
        },
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide' });
    }

    // Vérifier le stock et calculer le total
    let total = 0;
    for (const cartItem of cartItems) {
      if (cartItem.quantity > cartItem.product.stock) {
        return res.status(400).json({
          error: `Stock insuffisant pour ${cartItem.product.name}. Disponible: ${cartItem.product.stock}`,
        });
      }
      total += cartItem.product.price * cartItem.quantity;
    }

    // Créer la commande avec ses articles
    type CartItemWithProduct = typeof cartItems[0];

    const order = await prisma.$transaction(async (tx) => {
      // Workaround: certains typings Prisma omettent les delegates sur TransactionClient.
      // Au runtime, ils existent bien. On recaste donc vers le type du client.
      const t = tx as unknown as typeof prisma;

      // Créer la commande
      const newOrder = await t.order.create({
        data: {
          userId,
          total,
          status: 'pending',
        },
      });

      // Créer les articles de commande et mettre à jour le stock
      const orderItems = await Promise.all(
        cartItems.map(async (cartItem: CartItemWithProduct) => {
          // Mettre à jour le stock
          await t.product.update({
            where: { id: cartItem.productId },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          });

          // Créer l'article de commande
          return t.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              price: cartItem.product.price,
            },
          });
        })
      );

      // Vider le panier
      await t.cartItem.deleteMany({
        where: { userId },
      });

      return { order: newOrder, items: orderItems };
    });

    // Récupérer la commande complète avec les produits
    const orderWithDetails = await prisma.order.findUnique({
      where: { id: order.order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Commande créée avec succès',
      order: orderWithDetails,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
});

// Obtenir toutes les commandes de l'utilisateur
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
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
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId, // S'assurer que la commande appartient à l'utilisateur
      },
      include: {
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

export default router;
