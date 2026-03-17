# Backend API - E-commerce

API backend pour l'application e-commerce construite avec Node.js, Express, TypeScript et Prisma.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer la base de données :
```bash
# Générer le client Prisma
npm run db:generate

# Créer la base de données et appliquer le schéma
npm run db:push
```

3. (Optionnel) Remplir la base de données avec des données de test :
```bash
npx tsx src/scripts/seed.ts
```

4. Démarrer le serveur en mode développement :
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:5000`

## 📁 Structure du projet

```
server/
├── src/
│   ├── config/          # Configuration (base de données)
│   ├── middleware/       # Middlewares (authentification)
│   ├── routes/           # Routes API
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── cart.routes.ts
│   │   └── order.routes.ts
│   ├── scripts/          # Scripts utilitaires
│   └── index.ts          # Point d'entrée
├── prisma/
│   └── schema.prisma     # Schéma de base de données
└── package.json
```

## 🔌 Endpoints API

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Obtenir le profil utilisateur

### Produits

- `GET /api/products` - Liste des produits (avec filtres: category, search, page, limit)
- `GET /api/products/:id` - Détails d'un produit
- `GET /api/products/categories/list` - Liste des catégories
- `POST /api/products` - Créer un produit (admin)
- `PUT /api/products/:id` - Mettre à jour un produit (admin)
- `DELETE /api/products/:id` - Supprimer un produit (admin)

### Panier

- `GET /api/cart` - Obtenir le panier (authentifié)
- `POST /api/cart/add` - Ajouter un produit au panier (authentifié)
- `PUT /api/cart/update/:productId` - Mettre à jour la quantité (authentifié)
- `DELETE /api/cart/remove/:productId` - Supprimer un article (authentifié)
- `DELETE /api/cart/clear` - Vider le panier (authentifié)

### Commandes

- `POST /api/orders/create` - Créer une commande depuis le panier (authentifié)
- `GET /api/orders` - Liste des commandes de l'utilisateur (authentifié)
- `GET /api/orders/:id` - Détails d'une commande (authentifié)

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. 

Pour accéder aux routes protégées, inclure le header :
```
Authorization: Bearer <token>
```

Le token est retourné lors de l'inscription ou de la connexion.

## 🗄️ Base de données

Le projet utilise SQLite par défaut (facilement migrable vers PostgreSQL/MySQL).

Pour visualiser la base de données :
```bash
npm run db:studio
```

## 🔧 Variables d'environnement

Créer un fichier `.env` à partir de `.env.example` :

```env
PORT=5000
JWT_SECRET=votre_secret_jwt_tres_securise
FRONTEND_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
```

## 📝 Scripts disponibles

- `npm run dev` - Démarrer en mode développement avec hot-reload
- `npm run build` - Compiler TypeScript
- `npm start` - Démarrer le serveur en production
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Appliquer le schéma à la base de données
- `npm run db:studio` - Ouvrir Prisma Studio

## 🛠️ Technologies utilisées

- **Express** - Framework web
- **TypeScript** - Typage statique
- **Prisma** - ORM pour la base de données
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **express-validator** - Validation des données






