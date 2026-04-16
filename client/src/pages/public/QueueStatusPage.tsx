import { PublicLayout } from '../../components/layout/PublicLayout';
import { QueueList, QueueItem } from '../../components/public/QueueComponents';
import { BusyLevelBar, NowServingCard, QueuePositionIndicator, WaitTimeCard } from '../../components/public/StatusWidgets';

export function QueueStatusPage() {
  return (
    <PublicLayout>
      <div className="grid gap-4 sm:grid-cols-2">
        <WaitTimeCard />
        <QueuePositionIndicator />
      </div>
      <BusyLevelBar />
      <NowServingCard />
      <QueueList />
      <QueueItem />
    </PublicLayout>
  );
}
