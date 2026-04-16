# QFlow Public Customer View Wireframes

## User Goal
Customers need to answer three questions quickly:
1. Is the shop open?
2. How long is the wait right now?
3. Should I join now or visit later?

## Core Pages

### 1. Landing / Queue Status Page
Purpose:
- Default public entry point
- Show live queue condition at a glance

Mobile-first layout:
1. Header
   - QFlow logo
   - Shop name
   - Open/Closed status badge
2. Hero status card
   - Current estimated wait
   - Now serving number
   - People currently waiting
   - Busy level badge
3. Primary CTA
   - `Join Queue`
4. Queue preview section
   - Current queue list
   - Position number
   - Service type
   - Estimated individual wait
5. Historical insight card
   - Best times to visit
   - Average wait today / this week
6. Footer metadata
   - Last updated timestamp

Empty state:
- Hero card says there is no current wait
- Queue list replaced by friendly empty illustration/message

Closed state:
- Header and hero switch to closed styling
- Join CTA disabled
- Opening hours card moves higher in layout

## 2. Join Queue Form Page / Modal
Purpose:
- Collect minimal data quickly

Fields:
1. Customer name
2. Optional phone number
3. Service type picker
4. Optional preferred barber, only if the business enables it later

Interaction notes:
- Service types appear as tap-friendly cards
- Submit button stays pinned near bottom on mobile if content grows
- Form errors appear inline and clearly

Success state:
- Immediate confirmation card
- Shows assigned position
- Estimated wait time
- Button: `Track My Position`

## 3. My Position Tracker Page
Purpose:
- Give the customer a personalized live queue status view

Layout:
1. Top summary card
   - `Your position`
   - Estimated wait
   - Queue number
2. Progress section
   - Number of people ahead
   - Who is being served now
3. People ahead list
   - Compact rows for entries ahead
4. Leave queue action
   - Secondary or danger-styled button
5. Auto-refresh / live status note

States:
- When customer becomes next in line:
  - highlight state
  - message: `You're almost up`
- When service begins:
  - page changes to `In Progress`
- When entry is removed or completed:
  - show final state with return-to-home CTA

## 4. Historical Wait Times View
Purpose:
- Help customers decide when to visit

Content:
1. Mini chart or simple bars
   - Popular hours today
   - Weekly average waits
2. Best time recommendations
   - `Fastest today: 2:00 PM - 4:00 PM`
3. Service-specific insight
   - Haircut vs beard trim average waits

Mobile behavior:
- Keep charts simple and readable
- Provide short text summaries under each chart

## Public User Flow
```text
Landing / Queue Status
-> Join Queue
-> Success Confirmation
-> My Position Tracker
-> Leave Queue or Wait for Service

Landing / Queue Status
-> Historical Wait Times
-> Back to Landing
```

## Interaction Patterns
1. Polling first, real-time later
   - Initial UX should still show `Last updated just now`
2. High-priority info above the fold
   - Wait time and queue length must be visible without scrolling
3. Mobile-first CTA placement
   - The `Join Queue` action must always be prominent

## Responsive Notes

### Mobile
- Single-column stack
- Cards instead of tables
- Sticky action area where useful

### Tablet
- Queue summary and historical insights can sit in 2 columns

### Desktop
- Queue list and insights can appear side-by-side
- Wider layout can include fuller charts and service details

## Accessibility Considerations
1. Status badges need text labels.
2. Wait times should be readable by screen readers as natural language.
3. Form validation must not rely on color alone.
4. List updates should later announce position changes.
