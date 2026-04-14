import { useState } from 'react';
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
import { queueManagementEntries, getToneForStatus } from '../services/mockData';
import { useApp } from '../context/AppContext';

const statusFilters = ['All', 'Waiting', 'Called', 'In Progress'];

export default function QueueManagementPage() {
  const { notify } = useApp();
  const [queuePaused, setQueuePaused] = useState(false);
  const [filter, setFilter] = useState('All');
  const [rows, setRows] = useState(queueManagementEntries);
  const [form, setForm] = useState({
    customer: '',
    service: 'Classic Cut',
    type: 'Walk-in'
  });

  const filteredRows =
    filter === 'All' ? rows : rows.filter((row) => row.status.toLowerCase() === filter.toLowerCase());

  const updateRow = (id, nextStatus) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              status: nextStatus,
              barber: nextStatus === 'Called' && row.barber === '-' ? 'Auto assign' : row.barber
            }
          : row
      )
    );

    notify({
      title: `Queue ${nextStatus}`,
      message: `${id} was updated to ${nextStatus.toLowerCase()} in the UI preview.`,
      tone: getToneForStatus(nextStatus)
    });
  };

  const handleCallNext = () => {
    if (queuePaused) {
      notify({
        title: 'Queue paused',
        message: 'Resume the queue before calling the next customer.',
        tone: 'warning'
      });
      return;
    }

    const nextWaiting = rows.find((row) => row.status === 'Waiting');

    if (!nextWaiting) {
      notify({
        title: 'Queue empty',
        message: 'There are no waiting customers left in the mock queue.',
        tone: 'slate'
      });
      return;
    }

    updateRow(nextWaiting.id, 'Called');
  };

  const handleAddCustomer = (event) => {
    event.preventDefault();

    if (!form.customer.trim()) {
      notify({
        title: 'Customer name missing',
        message: 'Add a customer name before inserting a manual queue entry.',
        tone: 'danger'
      });
      return;
    }

    const nextNumber = Math.max(...rows.map((row) => row.number)) + 1;

    setRows((current) => [
      ...current,
      {
        id: `Q${nextNumber}`,
        number: nextNumber,
        customer: form.customer.trim(),
        type: form.type,
        barber: '-',
        status: 'Waiting',
        time: '0m',
        eta: '22 min',
        service: form.service,
        phone: '+60 1X-XXX XXXX'
      }
    ]);

    setForm({
      customer: '',
      service: 'Classic Cut',
      type: 'Walk-in'
    });

    notify({
      title: 'Customer added',
      message: `Queue #${nextNumber} was inserted into the demo queue.`,
      tone: 'success'
    });
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
          <Button onClick={() => updateRow(row.id, 'Called')} size="sm" tone="secondary">
            Call
          </Button>
          <Button onClick={() => updateRow(row.id, 'Completed')} size="sm" tone="success">
            Complete
          </Button>
          <Button onClick={() => updateRow(row.id, 'No-show')} size="sm" tone="danger">
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
            <Button onClick={() => setQueuePaused((current) => !current)} tone={queuePaused ? 'danger' : 'primary'}>
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
