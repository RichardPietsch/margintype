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
  let existing = null;
  try {
    existing = await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    if (error?.code === 'P2021' || error?.code === 'P1001') {
      console.log('[bootstrap-admin] skipped (database not migrated or not reachable yet)');
      process.exit(0);
    }
    throw error;
  }

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
