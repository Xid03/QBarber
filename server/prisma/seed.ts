import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.serviceType.deleteMany();
  await prisma.operatingHour.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.shop.deleteMany();

  const shop = await prisma.shop.create({
    data: {
      name: "Tony's Barbershop",
      slug: 'tonys-barbershop',
      status: 'OPEN',
      adminUsers: {
        create: {
          username: 'admin',
          passwordHash: 'password'
        }
      },
      serviceTypes: {
        create: [
          { name: 'Haircut', durationMinutes: 30, priceCents: 3500 },
          { name: 'Beard Trim', durationMinutes: 15, priceCents: 1500 },
          { name: 'Kids Cut', durationMinutes: 25, priceCents: 2500 },
          { name: 'Hair Coloring', durationMinutes: 90, priceCents: 12000 }
        ]
      },
      barbers: {
        create: [{ name: 'Tony' }, { name: 'Maria' }, { name: 'Alex' }]
      },
      operatingHours: {
        create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
          dayOfWeek,
          opensAt: '09:00',
          closesAt: dayOfWeek === 5 || dayOfWeek === 6 ? '20:00' : '19:00'
        }))
      }
    },
    include: {
      barbers: true,
      serviceTypes: true
    }
  });

  const customers = await Promise.all(
    ['Jordan', 'Nadia', 'Hakim'].map((name) =>
      prisma.customer.create({
        data: {
          name
        }
      })
    )
  );

  await prisma.queueEntry.createMany({
    data: [
      {
        shopId: shop.id,
        customerId: customers[0].id,
        serviceTypeId: shop.serviceTypes[0].id,
        barberId: shop.barbers[0].id,
        status: 'IN_PROGRESS',
        position: 1,
        estimatedWaitMinutes: 0
      },
      {
        shopId: shop.id,
        customerId: customers[1].id,
        serviceTypeId: shop.serviceTypes[1].id,
        status: 'WAITING',
        position: 2,
        estimatedWaitMinutes: 12
      },
      {
        shopId: shop.id,
        customerId: customers[2].id,
        serviceTypeId: shop.serviceTypes[0].id,
        status: 'WAITING',
        position: 3,
        estimatedWaitMinutes: 28
      }
    ]
  });

  await prisma.analyticsSnapshot.create({
    data: {
      shopId: shop.id,
      snapshotDate: new Date(),
      servedCount: 18,
      averageWaitMin: 16,
      revenueCents: 28500
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
