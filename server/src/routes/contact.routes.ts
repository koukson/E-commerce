import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';

const router = express.Router();

// Envoyer un message de contact
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('subject').trim().notEmpty().withMessage('Le sujet est requis'),
    body('message').trim().notEmpty().withMessage('Le message est requis'),
  ],
  async (req: express.Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, subject, message } = req.body;

      const contactMessage = await prisma.contactMessage.create({
        data: {
          name,
          email,
          subject,
          message,
        },
      });

      res.status(201).json({
        message: 'Message envoyé avec succès',
        contactMessage: {
          id: contactMessage.id,
          name: contactMessage.name,
          email: contactMessage.email,
          subject: contactMessage.subject,
          message: contactMessage.message,
        },
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
    }
  }
);

export default router;
