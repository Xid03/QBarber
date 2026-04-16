import { PublicLayout } from '../../components/layout/PublicLayout';
import { LeaveQueueButton, PeopleAheadList, PositionTracker } from '../../components/public/QueueComponents';

export function MyPositionPage() {
  return (
    <PublicLayout>
      <PositionTracker />
      <PeopleAheadList />
      <LeaveQueueButton />
    </PublicLayout>
  );
}
