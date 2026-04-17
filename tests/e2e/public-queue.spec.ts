import { expect, test } from '@playwright/test';

const shop = {
  id: 'shop-1',
  name: 'YZH Barber',
  slug: 'yzh-barber',
  status: 'OPEN',
  timezone: 'Asia/Kuala_Lumpur',
  phone: '+60 12-123 4567',
  address: '123 Main Street',
  isOpen: true,
  serviceTypes: [
    { id: 'svc-haircut', name: 'Haircut', durationMinutes: 30, priceCents: 3500, isActive: true },
    { id: 'svc-beard', name: 'Beard Trim', durationMinutes: 15, priceCents: 1500, isActive: true }
  ],
  barbers: [],
  operatingHours: [
    {
      id: 'hours-1',
      dayOfWeek: 1,
      opensAt: '09:00',
      closesAt: '19:00',
      isEnabled: true
    }
  ]
};

test('customer can join the queue and land on the tracker page', async ({ page }) => {
  await page.route('**/socket.io/**', async (route) => {
    await route.abort();
  });

  await page.route('**/api/shops/by-slug/*', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: shop
      }
    });
  });

  await page.route('**/api/shops/shop-1/queue', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        json: {
          success: true,
          data: {
            shop: {
              id: 'shop-1',
              name: 'YZH Barber',
              status: 'OPEN',
              timezone: 'Asia/Kuala_Lumpur',
              phone: null,
              address: null
            },
            isOpen: true,
            currentQueue: 1,
            estimatedWait: 10,
            nowServing: null,
            busyLevel: 'LOW',
            queue: []
          }
        }
      });
    }
  });

  await page.route('**/api/shops/shop-1/analytics/public', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          averageWaitMinutes: 12,
          peakHours: [{ hour: '11', count: 4 }],
          bestTimesToVisit: [{ hour: '14', count: 1 }]
        }
      }
    });
  });

  await page.route('**/api/shops/shop-1/queue/join', async (route) => {
    await route.fulfill({
      status: 201,
      json: {
        success: true,
        message: 'Joined queue successfully.',
        data: {
          entry: {
            entryId: 'entry-1',
            customerName: 'Aina',
            customerPhone: null,
            serviceTypeId: 'svc-haircut',
            serviceName: 'Haircut',
            position: 2,
            status: 'WAITING',
            estimatedWaitMinutes: 15,
            joinedAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null,
            barberName: null
          },
          peopleAhead: []
        }
      }
    });
  });

  await page.route('**/api/shops/shop-1/queue/entry-1', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          entry: {
            entryId: 'entry-1',
            customerName: 'Aina',
            customerPhone: null,
            serviceTypeId: 'svc-haircut',
            serviceName: 'Haircut',
            position: 2,
            status: 'WAITING',
            estimatedWaitMinutes: 15,
            joinedAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null,
            barberName: null
          },
          peopleAhead: [
            {
              entryId: 'entry-0',
              customerName: 'Farid',
              customerPhone: null,
              serviceTypeId: 'svc-beard',
              serviceName: 'Beard Trim',
              position: 1,
              status: 'WAITING',
              estimatedWaitMinutes: 5,
              joinedAt: new Date().toISOString(),
              startedAt: null,
              completedAt: null,
              barberName: null
            }
          ]
        }
      }
    });
  });

  await page.goto('/queue/join');

  await page.getByPlaceholder('A name the barber can call out').fill('Aina');
  await page.getByRole('button', { name: 'Join queue now' }).click();

  await expect(page).toHaveURL(/\/my-position\/entry-1$/);
  await expect(page.getByText('Added to queue')).toBeVisible();
  await expect(page.getByText("You're in line at position #2.")).toBeVisible();
});
