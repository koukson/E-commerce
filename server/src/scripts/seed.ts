import 'dotenv/config';
import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

const products = [
  {
    name: 'Ordinateur Portable',
    description: 'Ordinateur portable haute performance avec processeur rapide et écran Full HD. Parfait pour le travail et les loisirs.',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    category: 'Électronique',
    stock: 15,
  },
  {
    name: 'Smartphone Premium',
    description: 'Smartphone dernier cri avec caméra haute résolution et batterie longue durée. Design élégant et performances exceptionnelles.',
    price: 699.99,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    category: 'Électronique',
    stock: 25,
  },
  {
    name: 'Casque Audio',
    description: 'Casque audio sans fil avec réduction de bruit active. Qualité sonore exceptionnelle et confort optimal.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Audio',
    stock: 30,
  },
  {
    name: 'Montre Connectée',
    description: 'Montre intelligente avec suivi de la santé et notifications. Compatible iOS et Android.',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Accessoires',
    stock: 20,
  },
  {
    name: 'Tablette Graphique',
    description: 'Tablette graphique professionnelle pour créateurs numériques. Précision et sensibilité élevées.',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500',
    category: 'Électronique',
    stock: 12,
  },
  {
    name: 'Enceinte Bluetooth',
    description: 'Enceinte portable avec son stéréo puissant et batterie longue durée. Résistante à l\'eau.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    category: 'Audio',
    stock: 18,
  },
  {
    name: 'Clavier Mécanique',
    description: 'Clavier gaming mécanique avec rétroéclairage RGB. Switches mécaniques pour une frappe précise.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    category: 'Accessoires',
    stock: 22,
  },
  {
    name: 'Souris Gaming',
    description: 'Souris gaming précise avec capteur haute résolution. Design ergonomique et personnalisable.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    category: 'Accessoires',
    stock: 35,
  },
  {
    name: 'Écran 4K',
    description: 'Écran 4K Ultra HD 27 pouces avec technologie HDR. Parfait pour le gaming et le montage vidéo.',
    price: 449.99,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
    category: 'Électronique',
    stock: 10,
  },
  {
    name: 'Webcam HD',
    description: 'Webcam Full HD avec micro intégré. Idéale pour les visioconférences et le streaming.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500',
    category: 'Accessoires',
    stock: 28,
  },
  {
    name: 'Disque Dur Externe',
    description: 'Disque dur externe 2 To USB-C. Stockage rapide et fiable pour vos fichiers importants.',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    category: 'Électronique',
    stock: 40,
  },
  {
    name: 'Chargeur Sans Fil',
    description: 'Chargeur sans fil rapide compatible avec tous les smartphones. Design élégant et compact.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    category: 'Accessoires',
    stock: 50,
  },
];

const users = [
  {
    name: 'Administrateur',
    email: 'admin@ecommerce.fr',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Marie Martin',
    email: 'marie.martin@example.com',
    password: 'password123',
    role: 'user',
  },
];

const contactMessages = [
  {
    name: 'Pierre Durand',
    email: 'pierre.durand@example.com',
    subject: 'question',
    message: 'Bonjour, j\'aimerais savoir si vous proposez la livraison express pour les commandes urgentes ?',
  },
  {
    name: 'Sophie Bernard',
    email: 'sophie.bernard@example.com',
    subject: 'order',
    message: 'Je n\'ai pas reçu ma commande #12345678. Pouvez-vous vérifier le statut de livraison ?',
  },
  {
    name: 'Lucas Petit',
    email: 'lucas.petit@example.com',
    subject: 'partnership',
    message: 'Nous sommes une entreprise intéressée par un partenariat. Serait-il possible d\'organiser une réunion ?',
  },
];

async function main() {
  console.log('🌱 Début du seeding...\n');

  // Nettoyer toutes les données existantes
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Données nettoyées\n');

  // Créer les utilisateurs
  console.log('👥 Création des utilisateurs...');
  const createdUsers = [];
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    });
    createdUsers.push(user);
    console.log(`  ✅ ${user.name} (${user.email}) - Rôle: ${user.role}`);
  }
  console.log(`✅ ${users.length} utilisateurs créés\n`);

  // Créer les produits
  console.log('📦 Création des produits...');
  const createdProducts = [];
  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: product,
    });
    createdProducts.push(createdProduct);
    console.log(`  ✅ ${createdProduct.name} - ${createdProduct.price}€ - Stock: ${createdProduct.stock}`);
  }
  console.log(`✅ ${products.length} produits créés\n`);

  // Créer quelques commandes de test
  console.log('🛒 Création des commandes de test...');
  if (createdUsers.length >= 2 && createdProducts.length >= 3) {
    const user1 = createdUsers.find(u => u.role === 'user');
    const user2 = createdUsers.find(u => u.email === 'marie.martin@example.com');

    if (user1) {
      // Commande 1 : En attente
      const order1 = await prisma.order.create({
        data: {
          userId: user1.id,
          total: createdProducts[0].price + createdProducts[1].price,
          status: 'pending',
          items: {
            create: [
              {
                productId: createdProducts[0].id,
                quantity: 1,
                price: createdProducts[0].price,
              },
              {
                productId: createdProducts[1].id,
                quantity: 1,
                price: createdProducts[1].price,
              },
            ],
          },
        },
      });
      console.log(`  ✅ Commande #${order1.id.slice(0, 8)} créée (En attente)`);
    }

    if (user2) {
      // Commande 2 : En traitement
      const order2 = await prisma.order.create({
        data: {
          userId: user2.id,
          total: createdProducts[2].price * 2,
          status: 'processing',
          items: {
            create: [
              {
                productId: createdProducts[2].id,
                quantity: 2,
                price: createdProducts[2].price,
              },
            ],
          },
        },
      });
      console.log(`  ✅ Commande #${order2.id.slice(0, 8)} créée (En traitement)`);
    }
  }
  console.log('✅ Commandes créées\n');

  // Créer des messages de contact
  console.log('📧 Création des messages de contact...');
  for (const message of contactMessages) {
    const contactMessage = await prisma.contactMessage.create({
      data: message,
    });
    console.log(`  ✅ Message de ${contactMessage.name} créé`);
  }
  console.log(`✅ ${contactMessages.length} messages créés\n`);

  console.log('🎉 Seeding terminé avec succès !\n');
  console.log('📋 Informations de connexion :');
  console.log('   Admin:');
  console.log('     Email: admin@ecommerce.fr');
  console.log('     Mot de passe: admin123');
  console.log('   Utilisateurs de test:');
  console.log('     Email: jean.dupont@example.com');
  console.log('     Mot de passe: password123');
  console.log('     Email: marie.martin@example.com');
  console.log('     Mot de passe: password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
