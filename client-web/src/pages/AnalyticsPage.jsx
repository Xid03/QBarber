import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useState } from 'react';
import { Button, Card, PageHeader, StatCard, StatusBadge, Icon } from '../components/AdminUI';
import {
  analyticsSummary,
  barberPerformance,
  customerVolumeData,
  heatmapHours,
  peakHours,
  revenueBreakdown,
  serviceTimeDistribution
} from '../services/mockData';
import { useApp } from '../context/AppContext';

const pieColors = ['#2563EB', '#10B981', '#F59E0B', '#38BDF8'];

function HeatmapCard() {
  return (
    <Card
      description="A lightweight heatmap view for spotting rush hours across the week."
      title="Peak hours heatmap"
    >
      <div className="grid gap-3">
        <div className="grid grid-cols-[80px_repeat(6,minmax(0,1fr))] gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
          <div />
          {heatmapHours.map((hour) => (
            <div className="text-center" key={hour}>
              {hour}
            </div>
          ))}
        </div>

        {peakHours.map((row) => (
          <div className="grid grid-cols-[80px_repeat(6,minmax(0,1fr))] gap-2" key={row.day}>
            <div className="flex items-center text-sm font-semibold text-slate-700">{row.day}</div>
            {row.hours.map((value, index) => (
              <div
                className="flex h-14 items-center justify-center rounded-2xl text-sm font-semibold text-slate-950"
                key={`${row.day}-${heatmapHours[index]}`}
                style={{
                  background:
                    value >= 9
                      ? 'rgba(239,68,68,0.55)'
                      : value >= 7
                        ? 'rgba(245,158,11,0.45)'
                        : value >= 5
                          ? 'rgba(37,99,235,0.4)'
                          : 'rgba(15,23,42,0.95)'
                }}
              >
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { notify } = useApp();
  const [range, setRange] = useState({
    start: '2026-04-08',
    end: '2026-04-14'
  });

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3">
              <label className="text-sm text-slate-600">
                Start
                <input
                  className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  onChange={(event) => setRange((current) => ({ ...current, start: event.target.value }))}
                  type="date"
                  value={range.start}
                />
              </label>
              <label className="text-sm text-slate-600">
                End
                <input
                  className="ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  onChange={(event) => setRange((current) => ({ ...current, end: event.target.value }))}
                  type="date"
                  value={range.end}
                />
              </label>
            </div>
            <Button
              onClick={() =>
                notify({
                  title: 'Report exported',
                  message: `A mock report for ${range.start} to ${range.end} was queued for export.`,
                  tone: 'success'
                })
              }
              tone="secondary"
            >
              <Icon name="export" />
              Export report
            </Button>
          </>
        }
        description="Preview the analytics layer with customer volume, rush-hour heatmaps, service distribution, revenue mix, and barber performance comparison."
        eyebrow="Insights"
        title="Analytics"
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {analyticsSummary.map((item) => (
          <StatCard
            delta={item.delta}
            icon="analytics"
            key={item.id}
            label={item.label}
            tone={item.tone}
            value={item.value}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Card
          description="Compare walk-in traffic with premium booking volume across the selected range."
          title="Customer volume over time"
        >
          <div className="h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={customerVolumeData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis axisLine={false} dataKey="label" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} />
                <YAxis axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#020617',
                    border: '1px solid rgba(148,163,184,0.16)',
                    borderRadius: '16px'
                  }}
                />
                <Bar dataKey="customers" fill="#2563EB" radius={[10, 10, 0, 0]} />
                <Bar dataKey="bookings" fill="#10B981" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <HeatmapCard />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card
          description="Average service durations by haircut type, useful for queue planning and slot sizing."
          title="Service time distribution"
        >
          <div className="h-[300px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={serviceTimeDistribution} layout="vertical" margin={{ left: 20, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" horizontal={false} />
                <XAxis axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} type="number" />
                <YAxis axisLine={false} dataKey="name" tick={{ fill: '#CBD5E1', fontSize: 12 }} tickLine={false} type="category" width={90} />
                <Tooltip
                  contentStyle={{
                    background: '#020617',
                    border: '1px solid rgba(148,163,184,0.16)',
                    borderRadius: '16px'
                  }}
                />
                <Bar dataKey="avgMinutes" fill="#F59E0B" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          description="Current revenue mix between walk-ins and premium bookings."
          title="Revenue breakdown"
        >
          <div className="h-[300px]">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: '#020617',
                    border: '1px solid rgba(148,163,184,0.16)',
                    borderRadius: '16px'
                  }}
                />
                <Pie data={revenueBreakdown} dataKey="value" innerRadius={70} outerRadius={105} paddingAngle={4}>
                  {revenueBreakdown.map((entry, index) => (
                    <Cell fill={pieColors[index % pieColors.length]} key={entry.name} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {revenueBreakdown.map((entry, index) => (
              <StatusBadge key={entry.name} tone={index === 0 ? 'brand' : 'success'}>
                {entry.name}: RM{entry.value}
              </StatusBadge>
            ))}
          </div>
        </Card>
      </div>

      <Card
        description="Services handled, ratings, and revenue generated by each barber."
        title="Barber performance comparison"
      >
        <div className="h-[340px]">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={barberPerformance} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis axisLine={false} dataKey="name" tick={{ fill: '#CBD5E1', fontSize: 12 }} tickLine={false} />
              <YAxis axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#020617',
                  border: '1px solid rgba(148,163,184,0.16)',
                  borderRadius: '16px'
                }}
              />
              <Bar dataKey="services" fill="#38BDF8" radius={[10, 10, 0, 0]} />
              <Bar dataKey="revenue" fill="#10B981" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {barberPerformance.map((barber) => (
            <StatusBadge key={barber.name} tone="slate">
              {barber.name}: {barber.rating}/5 rating
            </StatusBadge>
          ))}
        </div>
      </Card>
    </div>
  );
}
