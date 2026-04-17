import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Eye, EyeOff, Pencil, Save, ShieldPlus, Trash2, UserX, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { formatCurrency, formatOperatingHour } from '../../features/public/formatters';
import type { AdminSettingsData } from '../../features/admin/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';

const createAdminFormSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name is required.'),
  username: z.string().trim().min(3, 'Username is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

type CreateAdminFormValues = z.infer<typeof createAdminFormSchema>;
type OperatingHourFormValue = AdminSettingsData['operatingHours'][number];

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function OperatingHoursEditor({
  settings,
  onToggleStatus,
  onSaveOperatingHours,
  isUpdating,
  isSaving,
  errorMessage
}: {
  settings: AdminSettingsData;
  onToggleStatus: () => void;
  onSaveOperatingHours: (values: { operatingHours: OperatingHourFormValue[] }) => Promise<void> | void;
  isUpdating?: boolean;
  isSaving?: boolean;
  errorMessage?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftHours, setDraftHours] = useState<OperatingHourFormValue[]>(settings.operatingHours);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setDraftHours(settings.operatingHours);
  }, [settings.operatingHours]);

  const hasChanges = useMemo(
    () => JSON.stringify(draftHours) !== JSON.stringify(settings.operatingHours),
    [draftHours, settings.operatingHours]
  );

  return (
    <Card className="admin-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-label">Operating hours</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Current storefront schedule.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <StatusBadge label={settings.status === 'OPEN' ? 'Open' : 'Closed'} tone={settings.status === 'OPEN' ? 'success' : 'danger'} />
          <Button
            variant="secondary"
            className="inline-flex items-center gap-2 border-slate-300 bg-white px-4 py-2.5 text-slate-800 shadow-sm hover:border-brand-400 hover:bg-white"
            onClick={onToggleStatus}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : settings.status === 'OPEN' ? 'Mark shop closed' : 'Mark shop open'}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-800">Weekly schedule</p>
          <p className="mt-1 text-sm text-muted">
            {isEditing ? 'Adjust opening times and close any off days, then save.' : 'Review the hours customers see across the week.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-2"
                onClick={() => {
                  setDraftHours(settings.operatingHours);
                  setLocalError(null);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2"
                disabled={isSaving || !hasChanges}
                onClick={() => {
                  const invalidEntry = draftHours.find((entry) => entry.isEnabled && entry.opensAt >= entry.closesAt);

                  if (invalidEntry) {
                    setLocalError(`Closing time must be after opening time for ${dayLabels[invalidEntry.dayOfWeek]}.`);
                    return;
                  }

                  setLocalError(null);
                  void (async () => {
                    try {
                      await onSaveOperatingHours({ operatingHours: draftHours });
                      setIsEditing(false);
                    } catch {
                      return;
                    }
                  })();
                }}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save hours'}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="inline-flex items-center gap-2 border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm hover:border-brand-400 hover:bg-white"
              onClick={() => {
                setDraftHours(settings.operatingHours);
                setLocalError(null);
                setIsEditing(true);
              }}
            >
              <Pencil size={16} />
              Edit hours
            </Button>
          )}
        </div>
      </div>

      {(localError || errorMessage) ? (
        <div className="rounded-2xl border border-danger-100 bg-danger-100/60 px-4 py-3 text-sm text-danger-600">
          {localError ?? errorMessage}
        </div>
      ) : null}

      <div className="grid gap-3">
        {(isEditing ? draftHours : settings.operatingHours).map((item) => (
          <div key={item.id} className="admin-soft-surface rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4">
            {isEditing ? (
              <div className="grid gap-3 md:grid-cols-[88px,120px,1fr,1fr] md:items-center">
                <p className="font-semibold text-slate-900">{dayLabels[item.dayOfWeek]}</p>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={item.isEnabled}
                    onChange={(event) => {
                      const isEnabled = event.target.checked;
                      setDraftHours((current) =>
                        current.map((entry) => (entry.id === item.id ? { ...entry, isEnabled } : entry))
                      );
                    }}
                  />
                  Open
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Opens</span>
                  <Input
                    type="time"
                    value={item.opensAt}
                    disabled={!item.isEnabled || isSaving}
                    onChange={(event) => {
                      const opensAt = event.target.value;
                      setDraftHours((current) =>
                        current.map((entry) => (entry.id === item.id ? { ...entry, opensAt } : entry))
                      );
                    }}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Closes</span>
                  <Input
                    type="time"
                    value={item.closesAt}
                    disabled={!item.isEnabled || isSaving}
                    onChange={(event) => {
                      const closesAt = event.target.value;
                      setDraftHours((current) =>
                        current.map((entry) => (entry.id === item.id ? { ...entry, closesAt } : entry))
                      );
                    }}
                  />
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">{formatOperatingHour(item.dayOfWeek, item.opensAt, item.closesAt, item.isEnabled)}</p>
                <StatusBadge label={item.isEnabled ? 'Open day' : 'Closed day'} tone={item.isEnabled ? 'success' : 'warning'} />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ServiceTypeManager({
  settings,
  onUpdateServiceType,
  isUpdating,
  errorMessage
}: {
  settings: AdminSettingsData;
  onUpdateServiceType: (
    serviceTypeId: string,
    payload: { name: string; durationMinutes: number; priceCents: number; isActive: boolean }
  ) => Promise<void> | void;
  isUpdating?: boolean;
  errorMessage?: string;
}) {
  const [editingServiceTypeId, setEditingServiceTypeId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [serviceDraft, setServiceDraft] = useState({
    name: '',
    durationMinutes: '',
    priceRinggit: '',
    isActive: true
  });

  return (
    <Card className="admin-panel space-y-4">
      <div>
        <p className="section-label">Service menu</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">Available queue services right now.</p>
      </div>

      {(localError || errorMessage) ? (
        <div className="rounded-2xl border border-danger-100 bg-danger-100/60 px-4 py-3 text-sm text-danger-600">
          {localError ?? errorMessage}
        </div>
      ) : null}

      <div className="grid gap-3">
        {settings.serviceTypes.map((serviceType) => {
          const isEditing = editingServiceTypeId === serviceType.id;

          return (
            <div key={serviceType.id} className="admin-soft-surface rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">Edit service</p>
                    <StatusBadge label={serviceDraft.isActive ? 'Active' : 'Paused'} tone={serviceDraft.isActive ? 'success' : 'warning'} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm">
                      <span className="font-medium text-slate-700">Service name</span>
                      <Input
                        value={serviceDraft.name}
                        onChange={(event) => {
                          setServiceDraft((current) => ({ ...current, name: event.target.value }));
                        }}
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="font-medium text-slate-700">Duration (minutes)</span>
                      <Input
                        type="number"
                        min={5}
                        max={240}
                        value={serviceDraft.durationMinutes}
                        onChange={(event) => {
                          setServiceDraft((current) => ({ ...current, durationMinutes: event.target.value }));
                        }}
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="font-medium text-slate-700">Price (RM)</span>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        value={serviceDraft.priceRinggit}
                        onChange={(event) => {
                          setServiceDraft((current) => ({ ...current, priceRinggit: event.target.value }));
                        }}
                      />
                    </label>
                    <label className="inline-flex items-center gap-2 self-end text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        checked={serviceDraft.isActive}
                        onChange={(event) => {
                          setServiceDraft((current) => ({ ...current, isActive: event.target.checked }));
                        }}
                      />
                      Listed as active
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="sm:w-auto"
                      onClick={() => {
                        setEditingServiceTypeId(null);
                        setLocalError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="inline-flex items-center gap-2 sm:w-auto"
                      disabled={isUpdating}
                      onClick={() => {
                        const durationMinutes = Number(serviceDraft.durationMinutes);
                        const priceRinggit = Number(serviceDraft.priceRinggit);

                        if (!serviceDraft.name.trim()) {
                          setLocalError('Service name is required.');
                          return;
                        }

                        if (!Number.isInteger(durationMinutes) || durationMinutes < 5) {
                          setLocalError('Duration must be at least 5 minutes.');
                          return;
                        }

                        if (!Number.isFinite(priceRinggit) || priceRinggit < 0) {
                          setLocalError('Price must be zero or more.');
                          return;
                        }

                        setLocalError(null);
                        void (async () => {
                          try {
                            await onUpdateServiceType(serviceType.id, {
                              name: serviceDraft.name.trim(),
                              durationMinutes,
                              priceCents: Math.round(priceRinggit * 100),
                              isActive: serviceDraft.isActive
                            });
                            setEditingServiceTypeId(null);
                          } catch {
                            return;
                          }
                        })();
                      }}
                    >
                      <Save size={16} />
                      {isUpdating ? 'Saving...' : 'Save service'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{serviceType.name}</p>
                    <p className="mt-2 text-sm text-muted">
                      {serviceType.durationMinutes} min - {formatCurrency(serviceType.priceCents)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={serviceType.isActive ? 'Active' : 'Paused'} tone={serviceType.isActive ? 'success' : 'warning'} />
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                      aria-label="Edit service"
                      title="Edit service"
                      disabled={isUpdating}
                      onClick={() => {
                        setServiceDraft({
                          name: serviceType.name,
                          durationMinutes: String(serviceType.durationMinutes),
                          priceRinggit: String(serviceType.priceCents / 100),
                          isActive: serviceType.isActive
                        });
                        setLocalError(null);
                        setEditingServiceTypeId(serviceType.id);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function AdminAccessManager({
  settings,
  onCreateAdmin,
  onUpdateAdmin,
  onToggleAdminStatus,
  onDeleteAdmin,
  currentAdminId,
  isCreating,
  isEditingAdmin,
  isUpdatingAdmin,
  isDeletingAdmin,
  errorMessage,
  editErrorMessage
}: {
  settings: AdminSettingsData;
  onCreateAdmin: (values: CreateAdminFormValues) => Promise<void> | void;
  onUpdateAdmin: (
    adminUserId: string,
    values: { displayName: string; username: string; password?: string }
  ) => Promise<void> | void;
  onToggleAdminStatus: (adminUserId: string, isActive: boolean) => Promise<void> | void;
  onDeleteAdmin: (adminUserId: string) => Promise<void> | void;
  currentAdminId?: string;
  isCreating?: boolean;
  isEditingAdmin?: boolean;
  isUpdatingAdmin?: boolean;
  isDeletingAdmin?: boolean;
  errorMessage?: string;
  editErrorMessage?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [pendingDeleteAdminId, setPendingDeleteAdminId] = useState<string | null>(null);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [localEditError, setLocalEditError] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({
    displayName: '',
    username: '',
    password: ''
  });
  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminFormSchema),
    defaultValues: {
      displayName: '',
      username: '',
      password: ''
    }
  });

  return (
    <Card className="admin-panel space-y-5">
      <div>
        <p className="section-label">Admin access</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">Register a new admin for this barbershop.</p>
      </div>

      <div className="grid gap-3">
        {settings.admins.map((admin) => {
          const isPendingDelete = pendingDeleteAdminId === admin.id;
          const isEditing = editingAdminId === admin.id;

          return (
            <div key={admin.id} className="admin-soft-surface rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{admin.displayName}</p>
                    {admin.id === currentAdminId ? (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-brand-700">
                        You
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">@{admin.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge label={admin.role === 'INACTIVE' ? 'Inactive' : admin.role} tone={admin.role === 'INACTIVE' ? 'warning' : 'info'} />
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                    aria-label="Edit admin"
                    title="Edit admin"
                    disabled={isEditingAdmin || isUpdatingAdmin || isDeletingAdmin}
                    onClick={() => {
                      setEditingAdminId((current) => (current === admin.id ? null : admin.id));
                      setEditDraft({
                        displayName: admin.displayName,
                        username: admin.username,
                        password: ''
                      });
                      setShowEditPassword(false);
                      setLocalEditError(null);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-warning-300 hover:bg-warning-50 hover:text-warning-600"
                    aria-label={admin.role === 'INACTIVE' ? 'Reactivate admin' : 'Deactivate admin'}
                    title={admin.role === 'INACTIVE' ? 'Reactivate admin' : 'Deactivate admin'}
                    disabled={isUpdatingAdmin || isDeletingAdmin}
                    onClick={() => {
                      void onToggleAdminStatus(admin.id, admin.role === 'INACTIVE');
                    }}
                  >
                    <UserX size={16} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-danger-500 hover:bg-danger-50 hover:text-danger-600"
                    aria-label="Delete admin"
                    title="Delete admin"
                    disabled={isUpdatingAdmin || isDeletingAdmin}
                    onClick={() => {
                      setPendingDeleteAdminId((current) => (current === admin.id ? null : admin.id));
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-4 space-y-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm">
                      <span className="font-medium text-slate-700">Display name</span>
                      <Input
                        value={editDraft.displayName}
                        onChange={(event) => {
                          setEditDraft((current) => ({ ...current, displayName: event.target.value }));
                        }}
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="font-medium text-slate-700">Username</span>
                      <Input
                        value={editDraft.username}
                        onChange={(event) => {
                          setEditDraft((current) => ({ ...current, username: event.target.value }));
                        }}
                      />
                    </label>
                    <label className="grid gap-2 text-sm sm:col-span-2">
                      <span className="font-medium text-slate-700">New password (optional)</span>
                      <div className="relative">
                        <Input
                          type={showEditPassword ? 'text' : 'password'}
                          placeholder="Leave blank to keep the current password"
                          className="pr-12"
                          value={editDraft.password}
                          onChange={(event) => {
                            setEditDraft((current) => ({ ...current, password: event.target.value }));
                          }}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 inline-flex items-center text-slate-500 transition hover:text-slate-700"
                          aria-label={showEditPassword ? 'Hide password' : 'Show password'}
                          onClick={() => {
                            setShowEditPassword((current) => !current);
                          }}
                        >
                          {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>
                  </div>

                  {(localEditError || editErrorMessage) ? (
                    <div className="rounded-2xl border border-danger-100 bg-danger-100/60 px-4 py-3 text-sm text-danger-600">
                      {localEditError ?? editErrorMessage}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="sm:w-auto"
                      onClick={() => {
                        setEditingAdminId(null);
                        setLocalEditError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="inline-flex items-center gap-2 sm:w-auto"
                      disabled={isEditingAdmin}
                      onClick={() => {
                        if (!editDraft.displayName.trim()) {
                          setLocalEditError('Display name is required.');
                          return;
                        }

                        if (!editDraft.username.trim()) {
                          setLocalEditError('Username is required.');
                          return;
                        }

                        if (editDraft.password && editDraft.password.length < 6) {
                          setLocalEditError('Password must be at least 6 characters.');
                          return;
                        }

                        setLocalEditError(null);
                        void (async () => {
                          try {
                            await onUpdateAdmin(admin.id, {
                              displayName: editDraft.displayName.trim(),
                              username: editDraft.username.trim(),
                              ...(editDraft.password ? { password: editDraft.password } : {})
                            });
                            setEditingAdminId(null);
                          } catch {
                            return;
                          }
                        })();
                      }}
                    >
                      <Save size={16} />
                      {isEditingAdmin ? 'Saving...' : 'Save admin'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {isPendingDelete ? (
                <div className="admin-danger-panel mt-4 space-y-4 p-4">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-danger-100 text-danger-600">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-900">Delete this admin account?</p>
                          <p className="mt-1 text-sm text-slate-700">
                            <span className="font-medium text-slate-900">{admin.displayName}</span> will lose access to the admin dashboard immediately, and this action cannot be undone.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-danger-100 bg-white/80 text-danger-500 transition hover:border-danger-500 hover:bg-danger-100 hover:text-danger-600"
                          aria-label="Close delete confirmation"
                          onClick={() => {
                            setPendingDeleteAdminId(null);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                          @{admin.username}
                        </span>
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                          Role: {admin.role === 'INACTIVE' ? 'Inactive' : admin.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-danger-100 bg-white/70 px-4 py-3 text-sm text-slate-700">
                    This is best for removing old staff accounts permanently. If you may need this person later, use deactivate instead.
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="sm:w-auto"
                      onClick={() => {
                        setPendingDeleteAdminId(null);
                      }}
                    >
                      Keep admin
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="sm:w-auto"
                      disabled={isDeletingAdmin}
                      onClick={() => {
                        void (async () => {
                          try {
                            await onDeleteAdmin(admin.id);
                            setPendingDeleteAdminId(null);
                          } catch {
                            return;
                          }
                        })();
                      }}
                    >
                      {isDeletingAdmin ? 'Deleting admin...' : 'Delete admin'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <form
        className="grid gap-4 rounded-2xl border border-dashed border-slate-300 px-4 py-4"
        onSubmit={(event) => {
          void form.handleSubmit(async (values) => {
            try {
              await onCreateAdmin(values);
              form.reset({
                displayName: '',
                username: '',
                password: ''
              });
            } catch {
              return;
            }
          })(event);
        }}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <ShieldPlus size={16} />
          <span>Create admin account</span>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Display name</span>
          <Input placeholder="New admin name" {...form.register('displayName')} />
          <FieldError message={form.formState.errors.displayName?.message} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Username</span>
          <Input placeholder="newadmin" {...form.register('username')} />
          <FieldError message={form.formState.errors.username?.message} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              className="pr-12"
              {...form.register('password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 inline-flex items-center text-slate-500 transition hover:text-slate-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => {
                setShowPassword((current) => !current);
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <FieldError message={form.formState.errors.password?.message} />
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-danger-100 bg-danger-100/60 px-4 py-3 text-sm text-danger-600">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" className="w-full sm:w-auto" disabled={isCreating}>
          {isCreating ? 'Creating admin...' : 'Register new admin'}
        </Button>
      </form>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-danger-600">{message}</p>;
}
