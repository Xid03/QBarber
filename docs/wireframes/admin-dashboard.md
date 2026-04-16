# QFlow Admin Dashboard Wireframes

## Admin Goals
Admins and barbers need to:
1. See live queue pressure
2. Start and complete services quickly
3. Understand wait-time trends and busy periods
4. Control shop settings without leaving the dashboard

## Main Navigation
Desktop primary nav:
- Dashboard
- Queue
- Analytics
- Settings

Tablet/mobile admin:
- Top bar + collapsible nav drawer

## 1. Dashboard Overview
Purpose:
- Daily operational summary

Layout:
1. Top header
   - Shop name
   - Open/Closed toggle
   - Date summary
2. KPI row
   - Total served today
   - Average wait time
   - People currently waiting
   - Revenue estimate
3. Queue snapshot panel
   - Now serving
   - Next three customers
4. Traffic chart panel
   - Today's arrival trend
5. Quick actions panel
   - Add walk-in
   - Start next customer
   - Toggle closed/open

## 2. Queue Management Panel
Purpose:
- Operational control center

Desktop layout:
1. Filter bar
   - Waiting
   - In progress
   - Completed today
2. Queue table
   - Position
   - Customer name
   - Service type
   - Estimated wait
   - Status
   - Assigned barber
   - Actions
3. Side panel or modal
   - Customer detail
   - Notes
   - Queue history later if available

Mobile/tablet behavior:
- Replace wide table with stacked queue cards
- Action buttons become grouped row buttons

Primary actions:
- Start Service
- Complete
- Cancel
- Manual Add Customer

## 3. Customer Detail View
Purpose:
- Quick operational context

Content:
1. Customer name
2. Service selected
3. Join time
4. Estimated wait
5. Current status
6. Admin notes

Possible placements:
- Slide-over panel on desktop
- Full-screen modal on mobile/tablet

## 4. Analytics Page
Purpose:
- Give the business owner useful operational insight

Sections:
1. Date range picker
2. Key metrics summary
   - Avg wait
   - Peak hour
   - Served count
   - Service split
3. Traffic over time chart
4. Wait-time distribution chart
5. Peak hours heatmap
6. Service popularity visualization

Fallback if data is sparse:
- Show trend summary text
- Show `Not enough historical data yet`

## 5. Settings / Configuration Page
Purpose:
- Keep configuration simple and understandable

Sections:
1. Shop status
   - Open / Closed
2. Operating hours
   - Day-by-day edit controls
3. Service types
   - Name
   - Duration
   - Price
4. Barber manager
   - Add/Edit/Remove barber
5. Queue behavior settings
   - Max queue length later
   - Walk-in acceptance toggle later

## Admin Workflow Summaries

### Open shop and begin day
```text
Admin Login
-> Dashboard
-> Confirm shop is open
-> Review current queue snapshot
```

### Serve next customer
```text
Queue Management
-> Select next waiting customer
-> Start Service
-> Customer moves to In Progress
-> Complete Service
-> Queue positions recalculate
```

### Review performance
```text
Dashboard
-> Analytics
-> Choose date range
-> Review traffic and wait trends
```

## Table/List Requirements
Queue table columns:
1. Position
2. Customer
3. Service
4. Joined at
5. Estimated wait
6. Status
7. Assigned barber
8. Actions

Sorting priorities:
- Default sort by active queue order
- Completed list sorted by latest completed first

## Responsive Behavior

### Mobile
- KPI cards stack vertically
- Queue controls become card-based
- Chart cards become single-column

### Tablet
- 2-column dashboard grid
- Queue list stays readable with compact columns

### Desktop
- 12-column dashboard grid
- Persistent nav or sidebar
- Table-heavy queue management view

## Accessibility and Admin Usability
1. Keyboard support for action buttons and filters.
2. Status changes should be visually distinct and text-labeled.
3. Dense data should retain clear spacing and hierarchy.
4. Important destructive actions must ask for confirmation.
