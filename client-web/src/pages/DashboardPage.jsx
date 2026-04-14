import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, DataTable, PageHeader, StatCard, StatusBadge, Button, Icon } from '../components/AdminUI';
import { getToneForStatus } from '../services/mockData';
import { useApp } from '../context/AppContext';
import { analyticsAPI, barbersAPI, bookingsAPI, queueAPI } from '../services/api';
import { getAdminSocket } from '../services/socket';

function formatElapsed(value) {
  if (!value) {
    return '0m';
  }

  return `${Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000))}m`;
}

export default function DashboardPage() {
  const { session, notify } = useApp();
  const shopId = session?.shop?._id;
  const [queueData, setQueueData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!shopId) {
      return;
    }

    Promise.all([
      queueAPI.status(shopId),
      analyticsAPI.summary({ shopId }),
      barbersAPI.list({ shopId }),
      bookingsAPI.adminList({ shopId })
    ])
      .then(([queueResponse, analyticsResponse, barbersResponse, bookingsResponse]) => {
        setQueueData(queueResponse.data);
        setAnalytics(analyticsResponse.data);
        setBarbers(barbersResponse.data || []);
        setBookings(bookingsResponse.data || []);
      })
      .catch((error) => {
        notify({
          title: 'Dashboard sync failed',
          message: error.message,
          tone: 'danger'
        });
      });
  }, [shopId]);

  useEffect(() => {
    if (!shopId) {
      return undefined;
    }

    const socket = getAdminSocket();
    const handleQueueUpdated = ({ queueData: nextQueueData }) => {
      setQueueData(nextQueueData);
    };

    socket.emit('join:shop', String(shopId));
    socket.on('queue:updated', handleQueueUpdated);

    return () => {
      socket.emit('leave:shop', String(shopId));
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [shopId]);

  const stats = useMemo(() => {
    const activeBarbers = barbers.filter((barber) => barber.status === 'online' && barber.isActive !== false).length;
    const currentCustomers = (queueData?.entries?.length || 0) + (bookings.length || 0);
    const averageWait = queueData?.waitingEntries?.length
      ? Math.round(
          queueData.waitingEntries.reduce((sum, entry) => sum + (entry.estimatedWaitTime || 0), 0) /
            Math.max(queueData.waitingEntries.length, 1)
        )
      : 0;
    const bookingRevenue = bookings
      .filter((booking) => booking.paymentStatus === 'paid')
      .reduce((sum, booking) => sum + (booking.amount || 0), 0);

    return [
      {
        id: 'customers',
        label: "Today's Customers",
        value: String(currentCustomers),
        delta: `${queueData?.waitingCount || 0} still waiting`,
        tone: 'brand'
      },
      {
        id: 'wait',
        label: 'Avg Wait Time',
        value: `${averageWait} min`,
        delta: `${queueData?.servingCount || 0} in service`,
        tone: 'warning'
      },
      {
        id: 'revenue',
        label: 'Booking Revenue',
        value: `RM${bookingRevenue}`,
        delta: `${bookings.filter((booking) => booking.status === 'confirmed').length} confirmed bookings`,
        tone: 'success'
      },
      {
        id: 'barbers',
        label: 'Active Barbers',
        value: String(activeBarbers),
        delta: `${barbers.length - activeBarbers} unavailable`,
        tone: 'slate'
      }
    ];
  }, [queueData, barbers, bookings]);

  const trafficData = useMemo(() => {
    const events = analytics?.recentEvents || [];
    if (events.length === 0) {
      return [
        { hour: '09:00', customers: queueData?.waitingCount || 0, wait: 8 },
        { hour: '12:00', customers: bookings.length, wait: 12 },
        { hour: '15:00', customers: queueData?.entries?.length || 0, wait: 16 },
        { hour: '18:00', customers: analytics?.totalQueueEntries || 0, wait: 10 }
      ];
    }

    return events
      .slice(0, 8)
      .reverse()
      .map((event, index) => ({
        hour: new Date(event.timestamp).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
        customers: index + 1,
        wait: event.metadata?.serviceTime || event.metadata?.amount || queueData?.waitingCount || 0
      }));
  }, [analytics, bookings.length, queueData]);

  const overviewQueueRows = useMemo(
    () =>
      (queueData?.entries || []).map((entry) => ({
        id: String(entry._id),
        number: entry.queueNumber,
        customer: entry.userId?.name || 'Walk-in guest',
        type: entry.type === 'booking' ? 'Booked' : 'Walk-in',
        barber: entry.barberId?.name || '-',
        status:
          entry.status === 'serving'
            ? 'In Progress'
            : entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
        time: formatElapsed(entry.joinedAt),
        service: entry.serviceType || 'Haircut'
      })),
    [queueData]
  );

  const recentActivity = useMemo(
    () =>
      (analytics?.recentEvents || []).slice(0, 4).map((event) => ({
        id: String(event._id),
        title: event.eventType.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase()),
        description: JSON.stringify(event.metadata || {}),
        time: new Date(event.timestamp).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
        tone: event.eventType === 'booking' ? 'success' : event.eventType === 'no_show' ? 'danger' : 'brand'
      })),
    [analytics]
  );

  const queueColumns = [
    {
      key: 'number',
      label: '#',
      sortValue: (row) => row.number,
      render: (row) => <span className="font-semibold text-slate-950">#{row.number}</span>
    },
    { key: 'customer', label: 'Customer' },
    { key: 'type', label: 'Type' },
    { key: 'barber', label: 'Barber' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge tone={getToneForStatus(row.status)}>{row.status}</StatusBadge>
    },
    { key: 'time', label: 'Time' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button tone="secondary">
              <Icon name="bell" />
              Quiet notifications
            </Button>
            <Button>
              <Icon name="spark" />
              Broadcast queue update
            </Button>
          </>
        }
        description="A visual control room for today's barbershop flow, with a live queue snapshot, traffic patterns, and the latest activity trail."
        eyebrow="Operations overview"
        title="Dashboard Overview"
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            delta={stat.delta}
            icon={
              {
                customers: 'users',
                wait: 'clock',
                revenue: 'wallet',
                barbers: 'barbers'
              }[stat.id]
            }
            key={stat.id}
            label={stat.label}
            tone={stat.tone}
            value={stat.value}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr,0.95fr]">
        <Card
          description="Customer traffic and wait time intensity through the day."
          title="Hourly customer traffic"
        >
          <div className="h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={trafficData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="trafficGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis axisLine={false} dataKey="hour" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} />
                <YAxis axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(148,163,184,0.16)',
                    borderRadius: '16px'
                  }}
                  formatter={(value, name) => [value, name === 'customers' ? 'Customers' : 'Avg wait']}
                />
                <Area
                  activeDot={{ r: 5 }}
                  dataKey="customers"
                  fill="url(#trafficGradient)"
                  stroke="#60A5FA"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          description="The latest operational updates from queue, bookings, and barber shifts."
          title="Recent activity feed"
        >
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4" key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <StatusBadge tone={item.tone}>{item.time}</StatusBadge>
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-slate-950">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-500">
                    <Icon name="spark" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr,0.95fr]">
        <DataTable
          columns={queueColumns}
          description="A quick look at who is waiting, who is in service, and where the next premium slot is headed."
          pageSize={5}
          rows={overviewQueueRows}
          searchPlaceholder="Search current queue"
          title="Current queue"
        />

        <Card
          description="A compact pulse board for the team on the floor."
          title="Service lane pulse"
        >
          <div className="grid gap-4">
            {[
              { label: 'Now serving', value: queueData?.nowServing ? `#${queueData.nowServing.queueNumber}` : 'No active chair', tone: 'brand' },
              { label: 'Approaching turn', value: queueData?.waitingEntries?.[0] ? `#${queueData.waitingEntries[0].queueNumber}` : 'Queue clear', tone: 'warning' },
              { label: 'Premium slots remaining', value: `${bookings.filter((booking) => booking.status === 'pending').length} pending bookings`, tone: 'success' },
              { label: 'No-show risk', value: `${bookings.filter((booking) => booking.status === 'checked-in').length} checked-in bookings`, tone: 'danger' }
            ].map((item) => (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5" key={item.label}>
                <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
                <p className="mt-4 text-xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
