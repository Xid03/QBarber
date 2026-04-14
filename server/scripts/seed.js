require('../config/env');

const { connectDatabase } = require('../config/db');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Barber = require('../models/Barber');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const QueueEntry = require('../models/QueueEntry');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { hashPassword } = require('../services/authService');

async function seed() {
  await connectDatabase();

  await Promise.all([
    AnalyticsEvent.deleteMany({}),
    Notification.deleteMany({}),
    Booking.deleteMany({}),
    QueueEntry.deleteMany({}),
    Barber.deleteMany({}),
    Shop.deleteMany({}),
    User.deleteMany({})
  ]);

  const ownerPasswordHash = await hashPassword('owner12345');
  const customerPasswordHash = await hashPassword('customer12345');

  const owner = await User.create({
    name: 'Aina Razak',
    email: 'owner@qbarber.demo',
    phone: '+60123456789',
    passwordHash: ownerPasswordHash,
    role: 'owner',
    loyaltyPoints: 90,
    totalVisits: 12
  });

  const customers = await User.insertMany([
    {
      name: 'Adam Iskandar',
      email: 'adam@qbarber.demo',
      phone: '+60112223344',
      passwordHash: customerPasswordHash,
      loyaltyPoints: 140,
      totalVisits: 18
    },
    {
      name: 'Sarah Imani',
      email: 'sarah@qbarber.demo',
      phone: '+60113334455',
      passwordHash: customerPasswordHash,
      loyaltyPoints: 65,
      totalVisits: 7
    },
    {
      name: 'John Daniel',
      email: 'john@qbarber.demo',
      phone: '+60114445566',
      passwordHash: customerPasswordHash,
      loyaltyPoints: 40,
      totalVisits: 4
    }
  ]);

  const shop = await Shop.create({
    name: 'QBarber Central',
    ownerId: owner._id,
    address: '22 Jalan Sultan Ismail, Kuala Lumpur',
    phone: '+60320201234',
    email: 'hello@qbarber.demo',
    operatingHours: {
      open: '09:00',
      close: '21:00'
    },
    bookingFee: 8,
    avgServiceTime: 30,
    branches: [
      { name: 'QBarber TTDI', address: '8 Jalan Tun Mohd Fuad, Kuala Lumpur' },
      { name: 'QBarber Mont Kiara', address: '1 Jalan Kiara, Kuala Lumpur' }
    ]
  });

  const barbers = await Barber.insertMany([
    {
      shopId: shop._id,
      name: 'Ali Fadez',
      specialty: 'Skin fades and beard sculpting',
      avgServiceTime: 28,
      status: 'online',
      rating: 4.9,
      totalServices: 420
    },
    {
      shopId: shop._id,
      name: 'Hafiz Crop',
      specialty: 'Textured crops and styling',
      avgServiceTime: 32,
      status: 'online',
      rating: 4.8,
      totalServices: 386
    },
    {
      shopId: shop._id,
      name: 'Ray Classic',
      specialty: 'Classic cuts and hot towel finishes',
      avgServiceTime: 35,
      status: 'break',
      rating: 4.7,
      totalServices: 301
    },
    {
      shopId: shop._id,
      name: 'Ming Precision',
      specialty: 'Kids cuts and lineup detailing',
      avgServiceTime: 25,
      status: 'online',
      rating: 4.9,
      totalServices: 278
    }
  ]);

  const now = new Date();
  const inThirtyMinutes = new Date(now.getTime() + 30 * 60 * 1000);
  const inNinetyMinutes = new Date(now.getTime() + 90 * 60 * 1000);

  const queueEntries = await QueueEntry.insertMany([
    {
      shopId: shop._id,
      userId: customers[0]._id,
      queueNumber: 12,
      type: 'walk-in',
      status: 'waiting',
      estimatedWaitTime: 18,
      serviceType: 'haircut',
      checkInStatus: 'checked-in'
    },
    {
      shopId: shop._id,
      userId: customers[1]._id,
      queueNumber: 13,
      type: 'booking',
      status: 'serving',
      barberId: barbers[0]._id,
      joinedAt: new Date(now.getTime() - 20 * 60 * 1000),
      startedAt: new Date(now.getTime() - 8 * 60 * 1000),
      estimatedWaitTime: 0,
      actualWaitTime: 12,
      serviceType: 'premium grooming',
      checkInStatus: 'checked-in'
    },
    {
      shopId: shop._id,
      userId: customers[2]._id,
      queueNumber: 14,
      type: 'walk-in',
      status: 'waiting',
      estimatedWaitTime: 34,
      serviceType: 'haircut and wash',
      checkInStatus: 'pending'
    }
  ]);

  const bookings = await Booking.insertMany([
    {
      shopId: shop._id,
      userId: customers[1]._id,
      barberId: barbers[1]._id,
      scheduledDate: inThirtyMinutes,
      startTime: '15:30',
      endTime: '16:00',
      status: 'confirmed',
      paymentStatus: 'paid',
      amount: 38,
      paymentId: 'mock_pi_001'
    },
    {
      shopId: shop._id,
      userId: customers[0]._id,
      barberId: barbers[3]._id,
      scheduledDate: inNinetyMinutes,
      startTime: '16:30',
      endTime: '17:00',
      status: 'pending',
      paymentStatus: 'pending',
      amount: 28
    }
  ]);

  await Notification.insertMany([
    {
      userId: customers[0]._id,
      shopId: shop._id,
      type: 'turn_soon',
      title: 'Almost your turn',
      message: 'You are up in around 18 minutes at QBarber Central.',
      relatedQueueId: queueEntries[0]._id
    },
    {
      userId: customers[1]._id,
      shopId: shop._id,
      type: 'booking_reminder',
      title: 'Booking reminder',
      message: 'Your premium slot starts at 3:30 PM. Please check in 10 minutes early.',
      relatedBookingId: bookings[0]._id
    }
  ]);

  await AnalyticsEvent.insertMany([
    {
      shopId: shop._id,
      eventType: 'queue_join',
      metadata: {
        queueNumber: 12,
        source: 'mobile'
      }
    },
    {
      shopId: shop._id,
      eventType: 'booking',
      metadata: {
        bookingId: bookings[0]._id.toString(),
        amount: 38
      }
    },
    {
      shopId: shop._id,
      eventType: 'complete',
      metadata: {
        barberId: barbers[0]._id.toString(),
        serviceTime: 27
      }
    }
  ]);

  console.log('Seed complete.');
  console.log(`Owner login: owner@qbarber.demo / owner12345`);
  console.log(`Customer login: adam@qbarber.demo / customer12345`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');

    await mongoose.connection.close();
  });
