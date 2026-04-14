import { useState } from 'react';
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
import { assignableCustomers, barbers, getToneForStatus } from '../services/mockData';
import { useApp } from '../context/AppContext';

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
  const { notify } = useApp();
  const [roster, setRoster] = useState(barbers);
  const [assignment, setAssignment] = useState({
    barberId: barbers[0].id,
    customer: assignableCustomers[0]
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barberForm, setBarberForm] = useState(emptyBarberForm);

  const openNewBarber = () => {
    setBarberForm(emptyBarberForm);
    setIsModalOpen(true);
  };

  const openEditBarber = (barber) => {
    setBarberForm(barber);
    setIsModalOpen(true);
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!barberForm.name.trim()) {
      notify({
        title: 'Barber name missing',
        message: 'Add a barber name before saving the modal form.',
        tone: 'danger'
      });
      return;
    }

    if (barberForm.id) {
      setRoster((current) =>
        current.map((barber) => (barber.id === barberForm.id ? { ...barberForm } : barber))
      );

      notify({
        title: 'Barber updated',
        message: `${barberForm.name} was refreshed in the roster preview.`,
        tone: 'success'
      });
    } else {
      const newBarber = {
        ...barberForm,
        id: `B${roster.length + 1}`,
        avatar: barberForm.name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      };

      setRoster((current) => [...current, newBarber]);
      notify({
        title: 'Barber added',
        message: `${newBarber.name} is now visible in the UI roster.`,
        tone: 'success'
      });
    }

    setIsModalOpen(false);
  };

  const toggleAvailability = (id) => {
    setRoster((current) =>
      current.map((barber) =>
        barber.id === id
          ? {
              ...barber,
              isActive: !barber.isActive,
              status: barber.isActive ? 'Offline' : 'Online'
            }
          : barber
      )
    );
  };

  const handleAssign = () => {
    const selectedBarber = roster.find((barber) => barber.id === assignment.barberId);

    setRoster((current) =>
      current.map((barber) =>
        barber.id === assignment.barberId
          ? {
              ...barber,
              currentCustomer: assignment.customer.split(' (#')[0],
              status: 'Online'
            }
          : barber
      )
    );

    notify({
      title: 'Customer assigned',
      message: `${assignment.customer} is now mapped to ${selectedBarber?.name}.`,
      tone: 'brand'
    });
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
                  <option key={customer} value={customer}>
                    {customer}
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
