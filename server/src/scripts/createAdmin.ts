import 'dotenv/config';
import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Administrateur';

  console.log('🔐 Création / mise à jour de l’admin...');
  console.log(`Email: ${email}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin prêt :');
  console.log(`- id: ${user.id}`);
  console.log(`- email: ${user.email}`);
  console.log(`- role: ${user.role}`);
  console.log('\nConnectez-vous avec cet email et le mot de passe configuré.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

