import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const email = process.env.INIT_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INIT_ADMIN_PASSWORD;
const name = process.env.INIT_ADMIN_NAME?.trim() || 'Admin';

if (!email || !password) {
  console.log('[bootstrap-admin] skipped (INIT_ADMIN_EMAIL or INIT_ADMIN_PASSWORD not set)');
  process.exit(0);
}

const prisma = new PrismaClient();

try {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`[bootstrap-admin] user already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash
    }
  });

  console.log(`[bootstrap-admin] created initial user: ${email}`);
} finally {
  await prisma.$disconnect();
}
