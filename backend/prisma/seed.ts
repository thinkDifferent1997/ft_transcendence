import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding questions...');
  
  // On s'assure qu'il n'y a pas déjà des questions pour éviter les doublons
  await prisma.question.deleteMany();

  await prisma.question.createMany({
    data: [
      {
        question: "Quelle est la capitale de la France ?",
        correctAnswer: "Paris",
        difficulty: 1,
        theme: "Geographie",
      },
      {
        question: "Combien font 2 + 2 ?",
        correctAnswer: "4",
        difficulty: 1,
        theme: "Mathematiques",
      },
      {
        question: "Qui a ecrit Les Miserables ?",
        correctAnswer: "Victor Hugo",
        difficulty: 2,
        theme: "Litterature",
      },
    ],
  });

  console.log('Questions seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
