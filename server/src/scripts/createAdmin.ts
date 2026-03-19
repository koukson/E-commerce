import 'dotenv/config';
import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🔐 Création de comptes administrateurs...\n');

  // Liste des administrateurs à créer
  const admins = [
    {
      email: process.env.ADMIN_EMAIL || 'admin@ecommerce.fr',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: process.env.ADMIN_NAME || 'Super Administrateur',
      role: 'superadmin',
    },
    {
      email: 'moderator@ecommerce.fr',
      password: 'mod123',
      name: 'Modérateur',
      role: 'moderator',
    },
    {
      email: 'support@ecommerce.fr',
      password: 'sup123',
      name: 'Support Admin',
      role: 'admin',
    },
  ];

  for (const adminData of admins) {
    const { email, password, name, role } = adminData;

    console.log(`Création / mise à jour de ${name} (${role})...`);
    console.log(`Email: ${email}`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        role,
      },
      create: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    console.log('✅ Admin créé :');
    console.log(`- id: ${user.id}`);
    console.log(`- email: ${user.email}`);
    console.log(`- role: ${user.role}\n`);
  }

  console.log('🎉 Tous les comptes administrateurs ont été créés !');
  console.log('\nInformations de connexion :');
  admins.forEach(admin => {
    console.log(`- ${admin.name} (${admin.role}): ${admin.email} / ${admin.password}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

