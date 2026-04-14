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
import {
  dashboardStats,
  overviewQueueRows,
  recentActivity,
  trafficData,
  getToneForStatus
} from '../services/mockData';

export default function DashboardPage() {
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
        {dashboardStats.map((stat) => (
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
              { label: 'Now serving', value: '#13 Sarah M.', tone: 'brand' },
              { label: 'Approaching turn', value: '#14 Hafiz R.', tone: 'warning' },
              { label: 'Premium slots remaining', value: '5 today', tone: 'success' },
              { label: 'No-show risk', value: '1 booking pending check-in', tone: 'danger' }
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
