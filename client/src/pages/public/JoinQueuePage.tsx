import { PublicLayout } from '../../components/layout/PublicLayout';
import { ConfirmationModal, JoinQueueForm } from '../../components/public/Forms';

export function JoinQueuePage() {
  return (
    <PublicLayout>
      <JoinQueueForm />
      <ConfirmationModal />
    </PublicLayout>
  );
}
