import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const building = await prisma.building.upsert({
    where: { id: 'building-main' },
    update: { name: 'IT Park Osijek', address: 'Osijek, Croatia' },
    create: {
      id: 'building-main',
      name: 'IT Park Osijek',
      address: 'Osijek, Croatia',
    },
  });

  const floors = await Promise.all(
    [1, 2, 3].map((number) =>
      prisma.floor.upsert({
        where: { buildingId_number: { buildingId: building.id, number } },
        update: { label: `Kat ${number}` },
        create: {
          buildingId: building.id,
          number,
          label: `Kat ${number}`,
        },
      }),
    ),
  );

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const floor1 = floors[0];

  await prisma.user.upsert({
    where: { email: 'admin@building.local' },
    update: {
      profile: {
        upsert: {
          create: { name: 'Building Admin', officeNumber: '001' },
          update: { name: 'Building Admin', officeNumber: '001' },
        },
      },
    },
    create: {
      email: 'admin@building.local',
      passwordHash: adminPassword,
      role: 'BUILDING_ADMIN',
      floorId: floor1.id,
      profile: {
        create: {
          name: 'Building Admin',
          officeNumber: '001',
        },
      },
    },
  });

  const demoPassword = await bcrypt.hash('Demo1234!', 12);
  await prisma.user.upsert({
    where: { email: 'demo@building.local' },
    update: {
      profile: {
        upsert: {
          create: { name: 'Demo User', officeNumber: '101' },
          update: { name: 'Demo User', officeNumber: '101' },
        },
      },
    },
    create: {
      email: 'demo@building.local',
      passwordHash: demoPassword,
      role: 'BUSINESS_USER',
      floorId: floor1.id,
      profile: {
        create: {
          name: 'Demo User',
          officeNumber: '101',
        },
      },
    },
  });

  console.log('Seed completed:');
  console.log('  Building:', building.name);
  console.log('  Floors:', floors.map((f) => f.label).join(', '));
  console.log('  Admin: admin@building.local / Admin123!');
  console.log('  Demo:  demo@building.local / Demo1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
