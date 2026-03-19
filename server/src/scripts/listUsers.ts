import 'dotenv/config';
import prisma from '../config/database.js';

async function main() {
  console.log('👥 Liste de tous les utilisateurs :\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  users.forEach(user => {
    console.log(`- ${user.name} (${user.role})`);
    console.log(`  Email: ${user.email}`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}\n`);
  });

  console.log(`Total: ${users.length} utilisateurs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });