# QFlow Component Hierarchy

## Architecture Direction
Phase 1 defines one React application with two major experiences:
- Public customer-facing queue interface
- Protected admin dashboard

## Route-Level Structure
```text
App
+-- PublicLayout
|   +-- QueueStatusPage
|   +-- JoinQueuePage
|   +-- MyPositionPage
|   `-- HistoricalWaitTimesPage
`-- AdminLayout
    +-- AdminLoginPage
    +-- DashboardPage
    +-- QueueManagementPage
    +-- AnalyticsPage
    `-- SettingsPage
```

## Page-Level Component Tree

### Public Queue Status
```text
QueueStatusPage
+-- Header
+-- ShopStatusCard
|   +-- StatusBadge
|   +-- WaitTimeCard
|   +-- QueuePositionIndicator
|   `-- BusyLevelBar
+-- QueueList
|   `-- QueueItem[]
+-- HistoricalWaitSummaryCard
`-- Footer
```

### Join Queue
```text
JoinQueuePage
+-- Header
+-- JoinQueueForm
|   +-- TextInput
|   +-- PhoneInput
|   +-- ServiceTypeSelector
|   |   `-- ServiceTypeCard[]
|   `-- SubmitButton
`-- ConfirmationModal
```

### My Position
```text
MyPositionPage
+-- Header
+-- PositionTracker
+-- PeopleAheadList
|   `-- QueueItem[]
+-- StatusBadge
`-- LeaveQueueButton
```

### Admin Dashboard
```text
DashboardPage
+-- AdminHeader
+-- KPISection
|   `-- StatCard[]
+-- QueueSnapshotPanel
+-- TrafficChartCard
`-- QuickActionPanel
```

### Admin Queue Management
```text
QueueManagementPage
+-- AdminHeader
+-- QueueFilterBar
+-- AdminQueueTable
|   `-- QueueRow[]
|       `-- ActionButtons
+-- AddCustomerForm
`-- CustomerDetailModal
```

### Admin Analytics
```text
AnalyticsPage
+-- AdminHeader
+-- DateRangePicker
+-- MetricsSummary
+-- TrafficChart
+-- WaitTimeDistribution
+-- PeakHoursHeatmap
`-- ServicePopularity
```

### Admin Settings
```text
SettingsPage
+-- AdminHeader
+-- ShopStatusPanel
+-- OperatingHoursEditor
+-- ServiceTypeManager
`-- BarberManager
```

## Shared Reusable Components
1. `Button`
2. `Card`
3. `StatusBadge`
4. `Input`
5. `Select`
6. `Modal`
7. `EmptyState`
8. `ErrorState`
9. `LoadingSkeleton`
10. `SectionHeader`

## Shared State Requirements

### Public State
- Shop status
- Current queue snapshot
- Historical wait summary
- Joined queue entry data

### Admin State
- Auth token / session
- Current queue entries
- Dashboard metrics
- Analytics datasets
- Shop settings

### Cross-Cutting State
- Active shop context
- Connection status later for real-time
- Toast / notification system

## Suggested State Ownership
1. React Query
   - Server data fetching and caching
   - Queue status
   - Admin dashboard metrics
   - Settings reads/writes
2. Local component state
   - Modal visibility
   - Form drafts
   - Filter UI state
3. Auth state
   - Stored in context or lightweight auth provider

## Data Flow
```text
API Layer
-> React Query Hooks
-> Route/Page Containers
-> Presentational Components
-> User Actions
-> Mutations
-> Query Invalidations / Optimistic Updates
```

## TypeScript-Like Props Interfaces

```ts
interface StatusBadgeProps {
  status: 'open' | 'closed' | 'waiting' | 'inProgress' | 'completed' | 'busy';
  label?: string;
}

interface WaitTimeCardProps {
  estimatedMinutes: number;
  busyLevel: 'low' | 'moderate' | 'high';
  lastUpdated: string;
}

interface QueueItemProps {
  position: number;
  customerName?: string;
  serviceName: string;
  estimatedWaitMinutes: number;
  status: 'waiting' | 'inProgress' | 'completed' | 'cancelled';
}

interface JoinQueueFormValues {
  customerName: string;
  customerPhone?: string;
  serviceTypeId: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  tone?: 'neutral' | 'positive' | 'warning';
}
```

## Reuse Opportunities
1. `StatusBadge` should be shared by public and admin views.
2. `QueueItem` can power both public list rows and simplified admin mobile cards.
3. `EmptyState` and `ErrorState` should be standardized early.
4. `Card` and `SectionHeader` should define most layout rhythm.

## Accessibility Considerations
1. Shared components should receive semantic labels and ARIA support once implemented.
2. Lists and tables should expose proper structure for assistive tech.
3. Loading and queue updates should later support live-region announcements.
