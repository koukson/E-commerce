import express, { Response } from 'express';
import prisma from '../config/database.js';

const router = express.Router();

const DEFAULT_ABOUT = {
  title: 'À propos de nous',
  subtitle: 'Votre boutique en ligne de confiance depuis le premier clic.',
  history: "Nous avons créé cette boutique avec une idée simple : proposer des produits de qualité à des prix justes, avec un service client à l'écoute. Que vous soyez à la recherche d'un cadeau ou d'un achat pour vous-même, notre équipe met tout en œuvre pour que votre expérience soit fluide et agréable.",
  values: 'Qualité, transparence et respect de nos clients. Chaque produit est sélectionné avec soin pour répondre à vos attentes.',
  security: "Paiement sécurisé et données protégées. Votre confiance est notre priorité absolue.",
  delivery: 'Livraison rapide et soignée. Livraison gratuite à partir de 50 € d\'achat pour vous faire profiter au mieux de nos produits.',
  service: "Une équipe disponible pour répondre à vos questions. N'hésitez pas à nous contacter via la page Contact.",
  ctaTitle: 'Une question ?',
  ctaText: 'Notre équipe est à votre disposition pour toute demande.',
};

const DEFAULT_CONTACT = {
  pageTitle: 'Nous contacter',
  pageSubtitle: 'Une question, une suggestion ? Envoyez-nous un message, nous vous répondrons au plus vite.',
  email: 'contact@ecommerce.fr',
  emailLabel: 'Réponse sous 24–48 h',
  phone: '+33 1 23 45 67 89',
  phoneLabel: 'Lun–Ven 9h–18h',
  address: '123 rue du Commerce\n75001 Paris, France',
};

// Obtenir les paramètres du site (public)
router.get('/about', async (req, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { key: 'about' },
    });
    const content = settings?.content ? JSON.parse(settings.content) : DEFAULT_ABOUT;
    res.json(content);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des paramètres About:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/contact', async (req, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { key: 'contact' },
    });
    const content = settings?.content ? JSON.parse(settings.content) : DEFAULT_CONTACT;
    res.json(content);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des paramètres Contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
