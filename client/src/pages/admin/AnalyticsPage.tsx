import { DateRangePicker, PeakHoursHeatmap, ServicePopularity, TrafficChart, WaitTimeDistribution } from '../../components/admin/AnalyticsWidgets';
import { AdminLayout } from '../../components/layout/AdminLayout';

export function AnalyticsPage() {
  return (
    <AdminLayout>
      <DateRangePicker />
      <TrafficChart />
      <WaitTimeDistribution />
      <PeakHoursHeatmap />
      <ServicePopularity />
    </AdminLayout>
  );
}
