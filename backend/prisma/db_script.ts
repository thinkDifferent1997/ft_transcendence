import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing tables to prevent duplicate ID crashes
  // (Order matters: delete rooms before users if rooms rely on user foreign keys)
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('🧹 Cleaned existing tables.');

  // 2. Hash a default password
  const defaultPassword = await argon2.hash('password123');

  // 3. Insert Dummy Users
  const user1 = await prisma.user.create({
    data: {
      username: 'marvin',
      email: 'marvin@student.42.fr',
      password: defaultPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'arthur',
      email: 'arthur@student.42.fr',
      password: defaultPassword,
    },
  });

  console.log(`👤 Seeded users: ${user1.username}, ${user2.username}`);

  // 4. Insert a Dummy Room
  const room = await prisma.room.create({
    data: {
      // Ensure this matches Nicolas's schema (e.g., 'name', 'title', etc.)
      name: 'General Chat', 
    },
  });

  console.log(`🏠 Seeded room: "${room.name}"`);
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
