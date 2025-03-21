import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  try {
    await prisma.comment.deleteMany();
  } catch (error) {
    console.log('Comment table not found, skipping cleanup');
  }
  
  try {
    await prisma.message.deleteMany();
  } catch (error) {
    console.log('Message table not found, skipping cleanup');
  }
  
  await prisma.note.deleteMany();
  await prisma.fileUpload.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.module.deleteMany();

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@visualharmonics.com',
      passwordHash: 'password123', // In production, use bcrypt.hash()
      role: 'admin',
    },
  });

  // Create regular user
  const regularUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@visualharmonics.com',
      passwordHash: 'password123', // In production, use bcrypt.hash()
      role: 'user',
    },
  });

  // Create sample project
  const project = await prisma.project.create({
    data: {
      name: 'Fantasy RPG Soundtrack',
      description: 'Original soundtrack for upcoming RPG game with 10 tracks',
      type: 'soundtrack',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      ownerId: adminUser.id,
    },
  });

  // Add project member
  await prisma.projectMember.create({
    data: {
      userId: regularUser.id,
      projectId: project.id,
      role: 'member',
    },
  });

  // Add tasks to project
  const tasks = [
    {
      title: 'Create main theme',
      description: 'Compose the main theme for the game',
      status: 'inProgress',
      priority: 'high',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      projectId: project.id,
      assigneeId: adminUser.id,
    },
    {
      title: 'Battle music',
      description: 'Create dynamic battle music',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      projectId: project.id,
      assigneeId: regularUser.id,
    },
    {
      title: 'Ambient town music',
      description: 'Peaceful music for town environments',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 45)),
      projectId: project.id,
      assigneeId: regularUser.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  // Add expenses
  const expenses = [
    {
      title: 'Software license',
      description: 'Annual subscription for audio software',
      amount: 299.99,
      date: new Date(),
      category: 'software',
      paid: true,
      userId: adminUser.id,
      projectId: project.id,
    },
    {
      title: 'Studio time',
      description: 'Recording session for live instruments',
      amount: 450.00,
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      category: 'studio',
      paid: false,
      userId: adminUser.id,
      projectId: project.id,
    },
  ];

  for (const expense of expenses) {
    await prisma.expense.create({ data: expense });
  }

  // Add notes
  const notes = [
    {
      title: 'Character themes',
      content: 'Ideas for character-specific leitmotifs:\n- Hero: Heroic, brass-heavy\n- Villain: Dark, dissonant strings\n- Companion: Light woodwinds',
      isPublic: true,
      authorId: adminUser.id,
      projectId: project.id,
    },
    {
      title: 'Production timeline',
      content: 'Week 1-2: Main theme\nWeek 3-4: Character themes\nWeek 5-6: Environmental music\nWeek 7-8: Battle music\nWeek 9-10: Final mixing and mastering',
      isPublic: true,
      authorId: adminUser.id,
      projectId: project.id,
    },
  ];

  for (const note of notes) {
    await prisma.note.create({ data: note });
  }

  // Register modules
  const modules = [
    {
      name: 'Projects',
      slug: 'projects',
      description: 'Manage audio production projects',
      enabled: true,
      icon: 'FolderKanban',
    },
    {
      name: 'Expenses',
      slug: 'expenses',
      description: 'Track expenses and manage budgets',
      enabled: true,
      icon: 'DollarSign',
    },
    {
      name: 'Brainstorm',
      slug: 'brainstorm',
      description: 'Organize ideas and notes',
      enabled: true,
      icon: 'Lightbulb',
    },
    {
      name: 'Files',
      slug: 'files',
      description: 'Share and manage files',
      enabled: true,
      icon: 'FileText',
    },
    {
      name: 'Messages',
      slug: 'messages',
      description: 'Communicate with team members',
      enabled: true,
      icon: 'MessageSquare',
    },
  ];

  for (const moduleItem of modules) {
    await prisma.module.create({ data: moduleItem });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });