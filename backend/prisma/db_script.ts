import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing tables to prevent duplicate ID crashes
  await prisma.user.deleteMany({});
  console.log('🧹 Cleaned existing tables.');

  // 2. Hash a default password
  const defaultPassword = await argon2.hash('password123');

  // 3. Insert Dummy Users
  const user1 = await prisma.user.create({
    data: {
      username: 'marvin',
      email: 'marvin@student.42.fr',
      passwordHash: defaultPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'arthur',
      email: 'arthur@student.42.fr',
      passwordHash: defaultPassword,
    },
  });

  console.log(`👤 Seeded users: ${user1.username}, ${user2.username}`);

    console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
