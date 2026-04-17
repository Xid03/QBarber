import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
      name: 'YZH Barber',
      slug: 'yzh-barber',
      status: 'OPEN',
      phone: '+60 12-555 0199',
      address: '88 Jalan Bukit Bintang, Kuala Lumpur',
      adminUsers: {
        create: {
          username: 'admin',
          displayName: 'Tony',
          passwordHash: await bcrypt.hash('password', 10)
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
    [
      { name: 'Jordan', phone: '+60 12-111 2201' },
      { name: 'Nadia', phone: '+60 12-111 2202' },
      { name: 'Hakim', phone: '+60 12-111 2203' },
      { name: 'Aisha', phone: '+60 12-111 2204' },
      { name: 'Farid', phone: '+60 12-111 2205' }
    ].map(({ name, phone }) =>
      prisma.customer.create({
        data: {
          name,
          phone
        }
      })
    )
  );

  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
  const ninetyMinutesAgo = new Date(now.getTime() - 90 * 60 * 1000);
  const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);

  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      customerId: customers[0].id,
      serviceTypeId: shop.serviceTypes[0].id,
      barberId: shop.barbers[0].id,
      status: 'IN_PROGRESS',
      position: 1,
      estimatedWaitMinutes: 0,
      startedAt: twentyMinutesAgo
    }
  });

  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      customerId: customers[1].id,
      serviceTypeId: shop.serviceTypes[1].id,
      status: 'WAITING',
      position: 2,
      estimatedWaitMinutes: 12
    }
  });

  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      customerId: customers[2].id,
      serviceTypeId: shop.serviceTypes[0].id,
      status: 'WAITING',
      position: 3,
      estimatedWaitMinutes: 28
    }
  });

  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      customerId: customers[3].id,
      serviceTypeId: shop.serviceTypes[0].id,
      barberId: shop.barbers[1].id,
      status: 'COMPLETED',
      position: 1,
      estimatedWaitMinutes: 18,
      joinedAt: ninetyMinutesAgo,
      startedAt: sixtyMinutesAgo,
      completedAt: thirtyMinutesAgo
    }
  });

  await prisma.queueEntry.create({
    data: {
      shopId: shop.id,
      customerId: customers[4].id,
      serviceTypeId: shop.serviceTypes[2].id,
      status: 'CANCELLED',
      position: 4,
      estimatedWaitMinutes: 36,
      removedReason: 'Customer had to leave early.'
    }
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
