import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  DataTable,
  Field,
  Icon,
  Input,
  PageHeader,
  SegmentedControl,
  Select,
  StatusBadge
} from '../components/AdminUI';
import { getToneForStatus } from '../services/mockData';
import { useApp } from '../context/AppContext';
import { queueAPI } from '../services/api';
import { getAdminSocket } from '../services/socket';

const statusFilters = ['All', 'Waiting', 'Called', 'In Progress'];

function formatElapsedTime(value) {
  if (!value) {
    return '0m';
  }

  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  return `${diffMinutes}m`;
}

function mapQueueRows(queueData = {}) {
  return (queueData.entries || []).map((entry) => ({
    id: String(entry._id),
    number: entry.queueNumber,
    customer: entry.userId?.name || 'Walk-in guest',
    type: entry.type === 'booking' ? 'Booked' : 'Walk-in',
    barber: entry.barberId?.name || '-',
    status:
      entry.status === 'serving'
        ? 'In Progress'
        : entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
    time: formatElapsedTime(entry.joinedAt),
    eta: `${entry.estimatedWaitTime || 0} min`,
    service: entry.serviceType || 'Haircut',
    phone: entry.userId?.phone || '-',
    raw: entry
  }));
}

export default function QueueManagementPage() {
  const { notify, session } = useApp();
  const shopId = session?.shop?._id;
  const [filter, setFilter] = useState('All');
  const [queuePaused, setQueuePaused] = useState(false);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    customer: '',
    service: 'Classic Cut',
    type: 'Walk-in'
  });

  const loadQueue = async () => {
    if (!shopId) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await queueAPI.status(shopId);
      setRows(mapQueueRows(response.data));
      setQueuePaused(Boolean(response.data?.queuePaused));
    } catch (error) {
      notify({
        title: 'Queue sync failed',
        message: error.message,
        tone: 'danger'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) {
      return undefined;
    }

    const socket = getAdminSocket();
    const handleQueueUpdated = ({ queueData }) => {
      setRows(mapQueueRows(queueData));
      setQueuePaused(Boolean(queueData?.queuePaused));
    };

    socket.emit('join:shop', String(shopId));
    socket.on('queue:updated', handleQueueUpdated);

    return () => {
      socket.emit('leave:shop', String(shopId));
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [shopId]);

  const filteredRows = useMemo(
    () => (filter === 'All' ? rows : rows.filter((row) => row.status.toLowerCase() === filter.toLowerCase())),
    [rows, filter]
  );

  const handleCallNext = async () => {
    if (queuePaused) {
      notify({
        title: 'Queue paused',
        message: 'Resume the queue before calling the next customer.',
        tone: 'warning'
      });
      return;
    }

    try {
      const response = await queueAPI.callNext({ shopId });
      setRows(mapQueueRows(response.data?.queueData));
      notify({
        title: 'Next customer called',
        message: `Queue #${response.data?.queueEntry?.queueNumber || ''} was called to the chair.`,
        tone: 'success'
      });
    } catch (error) {
      notify({
        title: 'Queue action failed',
        message: error.message,
        tone: 'danger'
      });
    }
  };

  const handleAddCustomer = async (event) => {
    event.preventDefault();

    if (!form.customer.trim()) {
      notify({
        title: 'Customer name missing',
        message: 'Add a customer name before inserting a manual queue entry.',
        tone: 'danger'
      });
      return;
    }

    try {
      const response = await queueAPI.join(
        {
          shopId,
          serviceType: form.service,
          type: form.type.toLowerCase()
        },
        { skipAuth: true }
      );

      setRows(mapQueueRows(response.data?.queueData));
      setForm({
        customer: '',
        service: 'Classic Cut',
        type: 'Walk-in'
      });

      notify({
        title: 'Customer added',
        message: `Queue #${response.data?.queueEntry?.queueNumber || ''} was added to the live queue.`,
        tone: 'success'
      });
    } catch (error) {
      notify({
        title: 'Add customer failed',
        message: error.message,
        tone: 'danger'
      });
    }
  };

  const updateRow = async (row, action) => {
    try {
      let response;

      if (action === 'call') {
        response = await queueAPI.callNext({ shopId });
      } else if (action === 'start') {
        response = await queueAPI.startService(row.id, { barberId: row.raw?.barberId?._id || row.raw?.barberId || undefined });
      } else if (action === 'complete') {
        response = await queueAPI.completeService(row.id);
      } else if (action === 'no-show') {
        response = await queueAPI.markNoShow(row.id);
      }

      if (response?.data?.queueData) {
        setRows(mapQueueRows(response.data.queueData));
      } else {
        loadQueue();
      }

      notify({
        title: 'Queue updated',
        message: `${row.customer} was updated successfully.`,
        tone: 'success'
      });
    } catch (error) {
      notify({
        title: 'Queue action failed',
        message: error.message,
        tone: 'danger'
      });
    }
  };

  const toggleQueuePause = async () => {
    try {
      const response = queuePaused
        ? await queueAPI.resume({ shopId })
        : await queueAPI.pause({ shopId, reason: 'Paused from admin dashboard.' });
      setRows(mapQueueRows(response.data?.queueData));
      setQueuePaused(!queuePaused);
      notify({
        title: queuePaused ? 'Queue resumed' : 'Queue paused',
        message: queuePaused ? 'Customers can join again.' : 'New joins are temporarily blocked.',
        tone: queuePaused ? 'success' : 'warning'
      });
    } catch (error) {
      notify({
        title: 'Queue status update failed',
        message: error.message,
        tone: 'danger'
      });
    }
  };

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
    { key: 'time', label: 'Waited' },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.status === 'Waiting' ? (
            <Button onClick={() => updateRow(row, 'call')} size="sm" tone="secondary">
              Call
            </Button>
          ) : null}
          {row.status === 'Called' ? (
            <Button onClick={() => updateRow(row, 'start')} size="sm" tone="secondary">
              Start
            </Button>
          ) : null}
          {row.status === 'In Progress' ? (
            <Button onClick={() => updateRow(row, 'complete')} size="sm" tone="success">
              Complete
            </Button>
          ) : null}
          <Button onClick={() => updateRow(row, 'no-show')} size="sm" tone="danger">
            No-show
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button onClick={handleCallNext} tone="secondary">
              <Icon name="spark" />
              Call next
            </Button>
            <Button onClick={toggleQueuePause} tone={queuePaused ? 'danger' : 'primary'}>
              <Icon name={queuePaused ? 'close' : 'clock'} />
              {queuePaused ? 'Resume queue' : 'Pause queue'}
            </Button>
          </>
        }
        description="The live queue board is built for quick floor decisions: call, complete, mark no-show, or add walk-ins manually during busy periods."
        eyebrow="Queue control"
        title="Queue Management"
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {[
          { label: 'Customers waiting', value: rows.filter((row) => row.status === 'Waiting').length, tone: 'brand' },
          { label: 'Called to chair', value: rows.filter((row) => row.status === 'Called').length, tone: 'warning' },
          { label: 'In progress', value: rows.filter((row) => row.status === 'In Progress').length, tone: 'success' },
          { label: 'Queue status', value: queuePaused ? 'Paused' : 'Live', tone: queuePaused ? 'danger' : 'success' }
        ].map((item) => (
          <Card key={item.label}>
            <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
            <p className="mt-4 text-4xl font-bold text-slate-950">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl onChange={setFilter} options={statusFilters} value={filter} />
        <StatusBadge tone={queuePaused ? 'danger' : 'success'}>
          {queuePaused ? 'Queue paused for floor reset' : 'Queue live and auto-refresh ready'}
        </StatusBadge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr,0.95fr]">
        <DataTable
          actions={<StatusBadge tone="slate">{filteredRows.length} visible rows</StatusBadge>}
          columns={queueColumns}
          description="Includes sorting, search, and pagination for busy shop windows."
          pageSize={6}
          rows={filteredRows}
          searchPlaceholder="Search customer, queue number, or status"
          title="Live queue display"
          emptyMessage={isLoading ? 'Loading queue...' : 'No queue entries yet.'}
        />

        <Card
          description="Front desk fallback for phone-ins or walk-ins when staff need to add customers manually."
          title="Manual add customer"
        >
          <form className="space-y-4" onSubmit={handleAddCustomer}>
            <Field label="Customer name">
              <Input
                onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))}
                placeholder="Walk-in customer"
                value={form.customer}
              />
            </Field>

            <Field label="Service type">
              <Select
                onChange={(event) => setForm((current) => ({ ...current, service: event.target.value }))}
                value={form.service}
              >
                <option>Classic Cut</option>
                <option>Skin Fade</option>
                <option>Beard Trim</option>
                <option>Wash + Style</option>
              </Select>
            </Field>

            <Field label="Entry type">
              <Select
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                value={form.type}
              >
                <option>Walk-in</option>
                <option>Booked</option>
              </Select>
            </Field>

            <Button className="w-full" type="submit">
              <Icon name="plus" />
              Add to queue
            </Button>
          </form>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">Suggested action stack</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>1. Call the next premium booking before opening a new walk-in slot.</p>
              <p>2. Use `No-show` if the customer misses the chair after two call attempts.</p>
              <p>3. Pause the queue during barber handoffs or short break windows.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
