import { useState } from 'react';
import {
  Button,
  Card,
  Field,
  Icon,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  TextArea,
  Toggle
} from '../components/AdminUI';
import { settingsData, getToneForStatus } from '../services/mockData';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { notify } = useApp();
  const [settings, setSettings] = useState(() => JSON.parse(JSON.stringify(settingsData)));

  const updateShop = (key, value) => {
    setSettings((current) => ({
      ...current,
      shopInfo: {
        ...current.shopInfo,
        [key]: value
      }
    }));
  };

  const updateBookingSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      bookingSettings: {
        ...current.bookingSettings,
        [key]: value
      }
    }));
  };

  const updateHour = (index, key, value) => {
    setSettings((current) => ({
      ...current,
      operatingHours: current.operatingHours.map((hour, hourIndex) =>
        hourIndex === index ? { ...hour, [key]: value } : hour
      )
    }));
  };

  const updateService = (id, key, value) => {
    setSettings((current) => ({
      ...current,
      services: current.services.map((service) =>
        service.id === id ? { ...service, [key]: value } : service
      )
    }));
  };

  const updateTemplate = (id, message) => {
    setSettings((current) => ({
      ...current,
      notificationTemplates: current.notificationTemplates.map((template) =>
        template.id === id ? { ...template, message } : template
      )
    }));
  };

  const addService = () => {
    const nextId = `S${settings.services.length + 1}`;

    setSettings((current) => ({
      ...current,
      services: [
        ...current.services,
        {
          id: nextId,
          name: 'New Service',
          price: 'RM0',
          duration: '30 min'
        }
      ]
    }));

    notify({
      title: 'Service row added',
      message: 'A new service row was inserted for UI testing.',
      tone: 'success'
    });
  };

  const savePreview = (label) =>
    notify({
      title: `${label} saved`,
      message: `${label} changes are stored in local UI state for this preview.`,
      tone: 'success'
    });

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button onClick={() => savePreview('All settings')}>
            <Icon name="check" />
            Save all settings
          </Button>
        }
        description="This settings screen covers shop identity, operating hours, service pricing, booking rules, message templates, and multi-branch controls."
        eyebrow="Configuration"
        title="Settings"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card
          description="Core shop profile details shown across the dashboard and future customer-facing surfaces."
          title="Shop information"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Shop name">
              <Input onChange={(event) => updateShop('name', event.target.value)} value={settings.shopInfo.name} />
            </Field>
            <Field label="Phone">
              <Input onChange={(event) => updateShop('phone', event.target.value)} value={settings.shopInfo.phone} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <Input onChange={(event) => updateShop('address', event.target.value)} value={settings.shopInfo.address} />
              </Field>
            </div>
            <Field label="Email">
              <Input onChange={(event) => updateShop('email', event.target.value)} value={settings.shopInfo.email} />
            </Field>
            <Field label="Logo badge">
              <Input onChange={(event) => updateShop('logo', event.target.value)} value={settings.shopInfo.logo} />
            </Field>
          </div>
        </Card>

        <Card
          description="Booking economics and queue preference rules for premium customers."
          title="Booking fee settings"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Booking fee">
              <Input
                onChange={(event) => updateBookingSetting('fee', event.target.value)}
                value={settings.bookingSettings.fee}
              />
            </Field>
            <Field label="Currency">
              <Select
                onChange={(event) => updateBookingSetting('currency', event.target.value)}
                value={settings.bookingSettings.currency}
              >
                <option>MYR</option>
                <option>USD</option>
              </Select>
            </Field>
            <Field label="Slot buffer">
              <Input
                onChange={(event) => updateBookingSetting('slotBuffer', event.target.value)}
                value={settings.bookingSettings.slotBuffer}
              />
            </Field>
            <Field label="Queue priority">
              <Select
                onChange={(event) => updateBookingSetting('queuePriority', event.target.value)}
                value={settings.bookingSettings.queuePriority}
              >
                <option>Bookings first</option>
                <option>Walk-ins first</option>
                <option>Balanced rotation</option>
              </Select>
            </Field>
          </div>
        </Card>
      </div>

      <Card
        description="Editable open and close windows for each day, with a live toggle for closures."
        title="Operating hours"
      >
        <div className="space-y-4">
          {settings.operatingHours.map((hour, index) => (
            <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr,1fr,1fr,auto] md:items-center" key={hour.day}>
              <div>
                <p className="text-sm font-semibold text-slate-950">{hour.day}</p>
              </div>
              <Input
                onChange={(event) => updateHour(index, 'open', event.target.value)}
                type="time"
                value={hour.open}
              />
              <Input
                onChange={(event) => updateHour(index, 'close', event.target.value)}
                type="time"
                value={hour.close}
              />
              <Toggle
                checked={hour.enabled}
                label={hour.enabled ? 'Open' : 'Closed'}
                onChange={(value) => updateHour(index, 'enabled', value)}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card
          action={
            <Button onClick={addService} size="sm" tone="secondary">
              <Icon name="plus" />
              Add service
            </Button>
          }
          description="Service catalog with price and duration controls for queue and bookings."
          title="Service types"
        >
          <div className="space-y-4">
            {settings.services.map((service) => (
              <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.4fr,0.8fr,0.8fr]" key={service.id}>
                <Input
                  onChange={(event) => updateService(service.id, 'name', event.target.value)}
                  value={service.name}
                />
                <Input
                  onChange={(event) => updateService(service.id, 'price', event.target.value)}
                  value={service.price}
                />
                <Input
                  onChange={(event) => updateService(service.id, 'duration', event.target.value)}
                  value={service.duration}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card
          description="Preview branch management for multi-location rollout."
          title="Branches"
        >
          <div className="space-y-4">
            {settings.branches.map((branch) => (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4" key={branch.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{branch.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{branch.address}</p>
                  </div>
                  <StatusBadge tone={getToneForStatus(branch.status)}>{branch.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        description="Notification copy can be tuned here before connecting to push delivery in a later phase."
        title="Notification templates"
      >
        <div className="grid gap-4">
          {settings.notificationTemplates.map((template) => (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4" key={template.id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-950">{template.name}</h3>
                <StatusBadge tone="slate">{template.id}</StatusBadge>
              </div>
              <TextArea
                onChange={(event) => updateTemplate(template.id, event.target.value)}
                value={template.message}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
