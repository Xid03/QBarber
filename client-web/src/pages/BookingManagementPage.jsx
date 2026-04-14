import { useState } from 'react';
import {
  Button,
  Card,
  DataTable,
  Modal,
  PageHeader,
  SegmentedControl,
  StatusBadge,
  Icon
} from '../components/AdminUI';
import {
  bookingCalendarDays,
  bookingRows,
  getToneForStatus
} from '../services/mockData';
import { useApp } from '../context/AppContext';

const filters = ['All', 'Today', 'Upcoming', 'Past', 'Cancelled'];

export default function BookingManagementPage() {
  const { notify } = useApp();
  const [bookings, setBookings] = useState(bookingRows);
  const [filter, setFilter] = useState('All');
  const [selectedDay, setSelectedDay] = useState('2026-04-14');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const visibleBookings = bookings.filter((booking) => {
    if (filter === 'Today') {
      return booking.dateId === selectedDay;
    }

    if (filter !== 'All' && booking.status !== filter) {
      return false;
    }

    return filter === 'All' ? booking.dateId === selectedDay : true;
  });

  const updateBooking = (bookingId, updates, message) => {
    setBookings((current) =>
      current.map((booking) => (booking.id === bookingId ? { ...booking, ...updates } : booking))
    );

    setSelectedBooking((current) => (current ? { ...current, ...updates } : current));

    notify({
      title: 'Booking updated',
      message,
      tone: 'success'
    });
  };

  const bookingColumns = [
    { key: 'id', label: 'Booking ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'slot', label: 'Time slot' },
    { key: 'barber', label: 'Barber' },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (row) => <StatusBadge tone={getToneForStatus(row.paymentStatus)}>{row.paymentStatus}</StatusBadge>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge tone={getToneForStatus(row.status)}>{row.status}</StatusBadge>
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <Button onClick={() => setSelectedBooking(row)} size="sm" tone="secondary">
          View details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button tone="secondary">
            <Icon name="plus" />
            Create premium slot
          </Button>
        }
        description="The booking UI previews a weekly slot calendar, filterable booking list, and a detail modal for confirm, cancel, or reschedule flows."
        eyebrow="Premium scheduling"
        title="Booking Management"
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.45fr]">
        <Card
          description="Slots are highlighted with daily booking counts so staff can spot dense windows quickly."
          title="Calendar view"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {bookingCalendarDays.map((day) => (
              <button
                className={`rounded-[24px] border p-4 text-left transition ${
                  day.id === selectedDay
                    ? 'border-brand/20 bg-brand/[0.08] text-slate-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{day.label}</p>
                    <p className="mt-2 text-3xl font-bold">{day.day}</p>
                  </div>
                  <StatusBadge tone={day.bookings >= 7 ? 'warning' : 'brand'}>
                    {day.bookings} booked
                  </StatusBadge>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SegmentedControl onChange={setFilter} options={filters} value={filter} />
            <StatusBadge tone="slate">{visibleBookings.length} visible bookings</StatusBadge>
          </div>

          <DataTable
            columns={bookingColumns}
            description="Table includes search, sorting, and pagination so the admin can handle a full day's premium reservations."
            pageSize={5}
            rows={visibleBookings}
            searchPlaceholder="Search booking, customer, or barber"
            title="Booking list"
          />
        </div>
      </div>

      <Modal
        description="This modal mirrors the booking detail workflow and is fully interactive with mock state changes."
        onClose={() => setSelectedBooking(null)}
        open={Boolean(selectedBooking)}
        title={selectedBooking ? `Booking ${selectedBooking.id}` : 'Booking details'}
      >
        {selectedBooking && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: 'Customer', value: selectedBooking.customer },
                { label: 'Phone', value: selectedBooking.phone },
                { label: 'Slot', value: `${selectedBooking.dateId} at ${selectedBooking.slot}` },
                { label: 'Barber', value: selectedBooking.barber },
                { label: 'Payment status', value: selectedBooking.paymentStatus },
                { label: 'Check-in status', value: selectedBooking.checkInStatus }
              ].map((item) => (
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4" key={item.label}>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  updateBooking(
                    selectedBooking.id,
                    { status: 'Confirmed', paymentStatus: 'Paid' },
                    `${selectedBooking.id} was marked confirmed for the UI preview.`
                  )
                }
              >
                Confirm
              </Button>
              <Button
                onClick={() =>
                  updateBooking(
                    selectedBooking.id,
                    { status: 'Cancelled', paymentStatus: 'Refunded' },
                    `${selectedBooking.id} was cancelled and marked refunded in the preview.`
                  )
                }
                tone="danger"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  notify({
                    title: 'Reschedule flow',
                    message: 'Rescheduling is mocked here and will be wired to booking logic later.',
                    tone: 'warning'
                  })
                }
                tone="secondary"
              >
                Reschedule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
