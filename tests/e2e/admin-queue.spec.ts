import { expect, test } from '@playwright/test';

test('admin can start and complete a queue item with visible feedback', async ({ page }) => {
  let queue = [
    {
      entryId: 'entry-1',
      customerName: 'Jordan',
      customerPhone: '+60 12-111 2201',
      serviceTypeId: 'svc-haircut',
      serviceName: 'Haircut',
      position: 1,
      status: 'WAITING',
      estimatedWaitMinutes: 12,
      joinedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      barberName: null
    }
  ];

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'qflow-admin-session',
      JSON.stringify({
        token: 'test-token',
        admin: {
          id: 'admin-1',
          username: 'admin',
          displayName: 'Owner',
          role: 'ADMIN'
        },
        shop: {
          id: 'shop-1',
          name: 'YZH Barber'
        }
      })
    );
  });

  await page.route('**/socket.io/**', async (route) => {
    await route.abort();
  });

  await page.route('**/api/shops/shop-1/queue', async (route) => {
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
          currentQueue: queue.filter((entry) => entry.status === 'WAITING').length,
          estimatedWait: queue[0]?.estimatedWaitMinutes ?? 0,
          nowServing:
            queue.find((entry) => entry.status === 'IN_PROGRESS') != null
              ? {
                  entryId: 'entry-1',
                  customerName: 'Jordan',
                  service: 'Haircut',
                  barberName: 'Tony'
                }
              : null,
          busyLevel: 'LOW',
          queue
        }
      }
    });
  });

  await page.route('**/api/admin/shops/shop-1/settings', async (route) => {
    await route.fulfill({
      json: {
        success: true,
        data: {
          id: 'shop-1',
          name: 'YZH Barber',
          status: 'OPEN',
          serviceTypes: [
            {
              id: 'svc-haircut',
              name: 'Haircut',
              durationMinutes: 30,
              priceCents: 3500,
              isActive: true
            }
          ],
          operatingHours: [],
          admins: []
        }
      }
    });
  });

  await page.route('**/api/admin/shops/shop-1/queue/entry-1/start', async (route) => {
    queue = [
      {
        ...queue[0],
        status: 'IN_PROGRESS',
        estimatedWaitMinutes: 0,
        startedAt: new Date().toISOString(),
        barberName: 'Tony'
      }
    ];

    await route.fulfill({
      json: {
        success: true,
        data: {}
      }
    });
  });

  await page.route('**/api/admin/shops/shop-1/queue/entry-1/complete', async (route) => {
    queue = [];

    await route.fulfill({
      json: {
        success: true,
        data: {}
      }
    });
  });

  await page.goto('/admin/queue');

  await expect(page.getByText('Jordan')).toBeVisible();

  await page.getByRole('button', { name: 'Start service' }).click();
  await expect(page.getByText('Service started')).toBeVisible();
  await expect(page.getByText('Jordan is now in the chair.')).toBeVisible();

  await page.getByRole('button', { name: 'Complete service' }).click();
  await expect(page.getByText('Service completed')).toBeVisible();
  await expect(page.getByText('Jordan has been checked out of the queue.')).toBeVisible();
});
