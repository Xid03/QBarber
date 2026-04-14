import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Field,
  Icon,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusBadge
} from '../components/AdminUI';
import { getToneForStatus } from '../services/mockData';
import { useApp } from '../context/AppContext';
import { barbersAPI, queueAPI } from '../services/api';

const emptyBarberForm = {
  id: '',
  name: '',
  specialty: '',
  avgServiceTime: 30,
  status: 'Online',
  isActive: true,
  avatar: 'NB',
  rating: 4.8,
  totalServices: 0,
  utilization: '0%',
  currentCustomer: 'None'
};

export default function BarberManagementPage() {
  const { notify, session } = useApp();
  const shopId = session?.shop?._id;
  const [roster, setRoster] = useState([]);
  const [assignableEntries, setAssignableEntries] = useState([]);
  const [assignment, setAssignment] = useState({
    barberId: '',
    customer: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barberForm, setBarberForm] = useState(emptyBarberForm);

  const assignableCustomers = useMemo(
    () =>
      assignableEntries.map((entry) => ({
        label: `${entry.userId?.name || 'Guest'} (#${entry.queueNumber})`,
        value: String(entry._id)
      })),
    [assignableEntries]
  );

  const loadRoster = async () => {
    if (!shopId) {
      return;
    }

    try {
      const [barbersResponse, queueResponse] = await Promise.all([
        barbersAPI.list({ shopId }),
        queueAPI.status(shopId)
      ]);
      const nextRoster = (barbersResponse.data || []).map((barber) => ({
        id: String(barber._id),
        name: barber.name,
        specialty: barber.specialty,
        avgServiceTime: barber.avgServiceTime,
        status: barber.status.charAt(0).toUpperCase() + barber.status.slice(1),
        rating: barber.rating,
        totalServices: barber.totalServices,
        isActive: barber.isActive !== false,
        utilization: `${Math.min(99, 40 + (barber.totalServices || 0) % 55)}%`,
        currentCustomer:
          queueResponse.data?.entries?.find(
            (entry) => entry.status === 'serving' && String(entry.barberId?._id || entry.barberId) === String(barber._id)
          )?.userId?.name || 'None',
        avatar: barber.name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      }));

      setRoster(nextRoster);
      setAssignment((current) => ({
        barberId: current.barberId || nextRoster[0]?.id || '',
        customer: current.customer || ''
      }));
      setAssignableEntries(queueResponse.data?.waitingEntries || []);
    } catch (error) {
      notify({
        title: 'Roster sync failed',
        message: error.message,
        tone: 'danger'
      });
    }
  };

  useEffect(() => {
    loadRoster();
  }, [shopId]);

  const openNewBarber = () => {
    setBarberForm(emptyBarberForm);
    setIsModalOpen(true);
  };

  const openEditBarber = (barber) => {
    setBarberForm(barber);
    setIsModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!barberForm.name.trim()) {
      notify({
        title: 'Barber name missing',
        message: 'Add a barber name before saving the modal form.',
        tone: 'danger'
      });
      return;
    }

    try {
      const payload = {
        shopId,
        name: barberForm.name,
        specialty: barberForm.specialty,
        avgServiceTime: Number(barberForm.avgServiceTime),
        status: barberForm.status.toLowerCase(),
        isActive: barberForm.isActive
      };

      if (barberForm.id) {
        await barbersAPI.update(barberForm.id, payload);
        notify({
          title: 'Barber updated',
          message: `${barberForm.name} was refreshed in the live roster.`,
          tone: 'success'
        });
      } else {
        await barbersAPI.create(payload);
        notify({
          title: 'Barber added',
          message: `${barberForm.name} is now visible in the live roster.`,
          tone: 'success'
        });
      }

      await loadRoster();
      setIsModalOpen(false);
    } catch (error) {
      notify({
        title: 'Save failed',
        message: error.message,
        tone: 'danger'
      });
    }
  };

  const toggleAvailability = async (id) => {
    const target = roster.find((barber) => barber.id === id);

    if (!target) {
      return;
    }

    await barbersAPI.update(id, {
      isActive: !target.isActive,
      status: target.isActive ? 'offline' : 'online'
    });
    await loadRoster();
  };

  const handleAssign = async () => {
    const selectedBarber = roster.find((barber) => barber.id === assignment.barberId);

    if (!assignment.customer) {
      notify({
        title: 'No queue customer selected',
        message: 'Choose a waiting queue entry before assigning a barber.',
        tone: 'warning'
      });
      return;
    }

    try {
      await queueAPI.startService(assignment.customer, { barberId: assignment.barberId });
      await loadRoster();
      notify({
        title: 'Customer assigned',
        message: `${selectedBarber?.name} is now serving the selected queue customer.`,
        tone: 'brand'
      });
    } catch (error) {
      notify({
        title: 'Assignment failed',
        message: error.message,
        tone: 'danger'
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button onClick={openNewBarber}>
            <Icon name="plus" />
            Add barber
          </Button>
        }
        description="Track each barber's availability, average service time, current assignment, and preview the add or edit flows in modal form."
        eyebrow="Team roster"
        title="Barber Management"
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr,0.95fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {roster.map((barber) => (
            <Card key={barber.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-brand/10 text-sm font-bold text-brand">
                    {barber.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{barber.name}</h3>
                    <p className="text-sm text-slate-600">{barber.specialty}</p>
                  </div>
                </div>
                <StatusBadge tone={getToneForStatus(barber.status)}>{barber.status}</StatusBadge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { label: 'Avg service', value: `${barber.avgServiceTime} min` },
                  { label: 'Utilization', value: barber.utilization },
                  { label: 'Rating', value: `${barber.rating} / 5` },
                  { label: 'Current customer', value: barber.currentCustomer }
                ].map((metric) => (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4" key={metric.label}>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{metric.label}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-950">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={() => openEditBarber(barber)} size="sm" tone="secondary">
                  <Icon name="pencil" />
                  Edit
                </Button>
                <Button onClick={() => toggleAvailability(barber.id)} size="sm" tone={barber.isActive ? 'danger' : 'success'}>
                  {barber.isActive ? 'Set inactive' : 'Set active'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card
          description="Simulate assigning a current queue customer to a specific barber chair."
          title="Assign customer"
        >
          <div className="space-y-4">
            <Field label="Barber">
              <Select
                onChange={(event) => setAssignment((current) => ({ ...current, barberId: event.target.value }))}
                value={assignment.barberId}
              >
                {roster.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Waiting customer">
              <Select
                onChange={(event) => setAssignment((current) => ({ ...current, customer: event.target.value }))}
                value={assignment.customer}
              >
                {assignableCustomers.map((customer) => (
                  <option key={customer.value} value={customer.value}>
                    {customer.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Button className="w-full" onClick={handleAssign}>
              <Icon name="check" />
              Assign to barber
            </Button>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Roster status guide</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Online: visible to queue assignment and booking selection.</p>
                <p>Break: temporarily hidden from new queue calls.</p>
                <p>Offline: disabled from all customer-facing availability.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        description="This modal previews the add and edit barber form without saving to a backend yet."
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        title={barberForm.id ? 'Edit barber' : 'Add barber'}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
          <Field label="Full name">
            <Input
              onChange={(event) => setBarberForm((current) => ({ ...current, name: event.target.value }))}
              value={barberForm.name}
            />
          </Field>

          <Field label="Specialty">
            <Input
              onChange={(event) => setBarberForm((current) => ({ ...current, specialty: event.target.value }))}
              value={barberForm.specialty}
            />
          </Field>

          <Field label="Average service time">
            <Input
              min="10"
              onChange={(event) =>
                setBarberForm((current) => ({
                  ...current,
                  avgServiceTime: Number(event.target.value)
                }))
              }
              type="number"
              value={barberForm.avgServiceTime}
            />
          </Field>

          <Field label="Status">
            <Select
              onChange={(event) => setBarberForm((current) => ({ ...current, status: event.target.value }))}
              value={barberForm.status}
            >
              <option>Online</option>
              <option>Offline</option>
              <option>Break</option>
            </Select>
          </Field>

          <div className="md:col-span-2">
            <Button
              className="w-full justify-center"
              onClick={() =>
                notify({
                  title: 'Photo upload mocked',
                  message: 'Image upload is represented in the UI and will be wired to storage later.',
                  tone: 'warning'
                })
              }
              tone="secondary"
              type="button"
            >
              <Icon name="plus" />
              Upload barber photo
            </Button>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)} tone="ghost" type="button">
              Cancel
            </Button>
            <Button type="submit">
              <Icon name="check" />
              Save barber
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
