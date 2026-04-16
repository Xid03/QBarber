# QFlow Design System

## Product Positioning
QFlow is a clean, mobile-first queue management interface for barbershops. The visual tone should feel modern, reliable, and fast to scan in stressful real-world situations where customers want quick answers and admins need operational clarity.

## Design Principles
1. Surface wait-time information first.
2. Make queue status readable in under 3 seconds.
3. Prioritize thumb-friendly interactions on mobile.
4. Use strong semantic color cues for queue states.
5. Keep admin dense but not visually overwhelming.

## Color Palette

### Brand Colors
| Token | Hex | Usage |
|---|---|---|
| `brand-700` | `#1D4ED8` | Primary buttons, links, selected states |
| `brand-600` | `#2563EB` | Main accent, badges, active nav |
| `brand-500` | `#3B82F6` | Hover states, chart highlights |
| `brand-100` | `#DBEAFE` | Soft backgrounds, selected cards |

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| `slate-950` | `#020617` | Primary text |
| `slate-900` | `#0F172A` | Headings, dark panels |
| `slate-700` | `#334155` | Secondary text |
| `slate-500` | `#64748B` | Supporting labels |
| `slate-200` | `#E2E8F0` | Borders |
| `slate-100` | `#F1F5F9` | Soft surfaces |
| `white` | `#FFFFFF` | Cards, panels |

### Semantic Colors
| Token | Hex | Usage |
|---|---|---|
| `success-600` | `#059669` | Completed, open, ready |
| `success-100` | `#D1FAE5` | Success backgrounds |
| `warning-500` | `#F59E0B` | Waiting, queue building, caution |
| `warning-100` | `#FEF3C7` | Warning backgrounds |
| `danger-600` | `#DC2626` | Cancelled, closed, destructive actions |
| `danger-100` | `#FEE2E2` | Error backgrounds |
| `info-600` | `#0891B2` | Informational highlights, charts |
| `info-100` | `#CFFAFE` | Informational backgrounds |

## Status Indicator Mapping
| Status | Label | Color |
|---|---|---|
| Shop Open | `OPEN` | `success-600` |
| Shop Closed | `CLOSED` | `danger-600` |
| Queue Light | `LOW WAIT` | `success-600` |
| Queue Moderate | `MODERATE` | `warning-500` |
| Queue Busy | `BUSY` | `danger-600` |
| Queue Entry Waiting | `WAITING` | `warning-500` |
| Queue Entry In Progress | `IN PROGRESS` | `brand-600` |
| Queue Entry Completed | `COMPLETED` | `success-600` |
| Queue Entry Cancelled | `CANCELLED` | `danger-600` |

## Typography

### Type Stack
- Heading and UI font: `Inter, ui-sans-serif, system-ui, sans-serif`
- Numeric emphasis: inherit from Inter, use semibold or bold for wait times and positions

### Type Scale
| Token | Size | Weight | Usage |
|---|---|---|---|
| `display-lg` | `3rem` | `700` | Hero wait time, admin KPI headline |
| `display-md` | `2.25rem` | `700` | Queue position, dashboard key stats |
| `heading-xl` | `1.875rem` | `700` | Page titles |
| `heading-lg` | `1.5rem` | `600` | Section titles |
| `heading-md` | `1.25rem` | `600` | Card titles |
| `body-lg` | `1rem` | `400` | Main paragraphs |
| `body-md` | `0.875rem` | `400` | General UI text |
| `label-sm` | `0.75rem` | `600` | Labels, metadata, badges |

## Spacing System
Use a 4px base grid.

| Token | Value |
|---|---|
| `space-1` | `0.25rem` |
| `space-2` | `0.5rem` |
| `space-3` | `0.75rem` |
| `space-4` | `1rem` |
| `space-5` | `1.25rem` |
| `space-6` | `1.5rem` |
| `space-8` | `2rem` |
| `space-10` | `2.5rem` |
| `space-12` | `3rem` |

Guideline:
- Mobile cards: internal padding `space-4`
- Desktop dashboard panels: internal padding `space-6`
- Vertical section rhythm: `space-6` mobile, `space-8` desktop

## Radius and Elevation
| Token | Value | Usage |
|---|---|---|
| `radius-sm` | `0.75rem` | Inputs, pills |
| `radius-md` | `1rem` | Cards, modals |
| `radius-lg` | `1.5rem` | Hero cards, dashboard panels |

| Shadow Token | Value | Usage |
|---|---|---|
| `shadow-soft` | `0 12px 30px -18px rgba(15, 23, 42, 0.22)` | Main cards |
| `shadow-focus` | `0 0 0 4px rgba(37, 99, 235, 0.18)` | Keyboard focus state |

## Core Component Catalog

### Buttons
1. Primary
   - Filled `brand-600`
   - Used for `Join Queue`, `Start Service`, `Save`
2. Secondary
   - White background, slate border
   - Used for neutral actions
3. Ghost
   - Text-only with soft hover background
   - Used for filters and subtle controls
4. Danger
   - Filled `danger-600`
   - Used for cancel/remove actions

### Cards
1. KPI Card
   - Large number + short label + delta
2. Status Card
   - Prominent wait time or now-serving display
3. Queue Row Card
   - Compact mobile list item
4. Analytics Card
   - Chart or metric block with title

### Inputs
1. Text Input
2. Optional Phone Input
3. Select / Combo Box
4. Filter Select
5. Time Picker for settings

### Status Badges
- Rounded pill
- Small uppercase text
- Strong semantic background and text contrast

## Responsive Breakpoints
| Breakpoint | Range | Behavior |
|---|---|---|
| Mobile | `< 640px` | Single-column, sticky bottom actions, card-first layouts |
| Tablet | `640px - 1024px` | Two-column summaries, compact sidebar or top tabs |
| Desktop | `> 1024px` | Full dashboard grid, persistent sidebar, richer tables and charts |

## Accessibility
1. Minimum contrast ratio 4.5:1 for body text.
2. Interactive targets minimum 44px height.
3. All status colors must be paired with text labels, not color alone.
4. Focus states must be visible on all controls.
5. Live queue changes should later support screen-reader announcements.
6. Charts should include text summaries for non-visual users.

## Empty, Error, and Special States
1. Empty queue
   - Message: `No wait right now. Great time to walk in.`
2. Shop closed
   - Show next opening time and disabled join action
3. Full queue / high wait
   - Show warning state and best times to visit later
4. Network error
   - Show retry action and last successful update timestamp

## Motion Guidance
Phase 1 only defines the direction:
- Quick fade/slide for page transitions
- Soft highlight on queue position changes
- Reduced-motion mode must disable non-essential animation
