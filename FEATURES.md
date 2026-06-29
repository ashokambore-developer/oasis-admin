# Oasis Admin — Feature Documentation

This document covers every feature built into the Oasis Admin panel on top of the CoreUI React template. All data is fetched from the Oasis backend via REST endpoints at `/api/admin/*`, which internally call tRPC procedures through `adminProcedure` (requires `role === 'ADMIN'`).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Authentication](#authentication)
- [Shared Components](#shared-components)
- [Users](#users)
- [Destinations](#destinations)
- [Trips](#trips)
- [Finance](#finance)
- [Media Library](#media-library)
- [Operations](#operations)
- [Jungle Mode](#jungle-mode)
- [Settings](#settings)
- [Monitoring](#monitoring)
- [Admin Profile](#admin-profile)
- [Navigation](#navigation)
- [Routing](#routing)

---

## Tech Stack

| Concern | Library |
|---|---|
| UI framework | CoreUI 5 + Bootstrap 5 |
| React | React 19 |
| Routing | React Router 7 |
| Data fetching | TanStack Query v4 (`useQuery`, `useMutation`) |
| HTTP client | Axios (`src/lib/api.js`) — injects `Authorization: Bearer <admin_token>` |
| Build | Vite |

---

## Authentication

**File:** `src/views/pages/login/Login.jsx`

- JWT stored in `localStorage` under `admin_token`
- **Multi-tab persistence** — `localStorage` is shared across tabs; all tabs stay authenticated without re-login
- Logout clears `admin_token` and redirects to `/login`
- Unauthenticated requests return 401; the Axios interceptor redirects to `/login`

---

## Shared Components

**Directory:** `src/components/`

| Component | Purpose |
|---|---|
| `SortableHeader` | `<th>` with up/down arrow buttons; calls `onSort(field, order)` |
| `AdminTableFooter` | Pagination controls + page-size selector (10 / 20 / 50); shared across all list pages |

---

## Users

### UserList — `src/views/users/UserList.jsx`

- Paginated table of all users
- **Filters:** search (name/email), role (`PHOTOGRAPHER` / `SERVICE_PROVIDER` / `TRIP_MANAGER`), account status
- **Sorting** on name, email, role, createdAt via `SortableHeader`
- Clicking a row navigates to `UserDetail`

### UserDetail — `src/views/users/UserDetail.jsx`

Full user profile page with **per-tab inline editing**:

| Tab | Contents | Editable |
|---|---|---|
| Profile | Name, email, phone, bio, location, profile photo | ✅ |
| Account | Role, account status, verification status, suspension reason | ✅ |
| SP Destinations | Service provider destination assignments; add/remove | ✅ |
| Activity | Login history, account timestamps | — |

- **Change password** action with confirmation
- **Suspend / unsuspend** account action with reason field
- Each tab has independent Save/Cancel with success/error feedback

### SP Verification — `src/views/users/SpVerification.jsx`

- List of pending service provider verification requests
- Approve / Reject with notes
- *(Navigation entry commented out — enable when ready)*

---

## Destinations

### DestinationList — `src/views/destinations/DestinationList.jsx`

- Paginated, sortable list of all destinations
- Clicking a row navigates to `DestinationDetail`

### DestinationDetail — `src/views/destinations/DestinationDetail.jsx`

Tabbed detail page:

| Tab | Contents |
|---|---|
| Overview | Name, country, state, region, description, coordinates, featured flag — inline editable |
| Gallery | Grid of all `photoGallery` images with a **lightbox** viewer (prev/next arrows, click-outside-to-close) |

### DestinationEdit — `src/views/destinations/DestinationEdit.jsx`

- Create or edit a destination (shared component, used at `/destinations/new` and `/destinations/:id/edit`)

### DestinationRequests — `src/views/destinations/DestinationRequests.jsx`

- Lists incoming destination creation requests
- Approve or reject each request with reason

### HotspotList — `src/views/destinations/HotspotList.jsx`

- Lists all hotspots across destinations with edit/delete actions

---

## Trips

### TripList — `src/views/trips/TripList.jsx`

- Paginated, sortable trip list
- Trip title is a **clickable link** → navigates to `TripDetail`
- Status badges, featured flag, slot counts

### TripDetail — `src/views/trips/TripDetail.jsx`

Full trip management page with **6 tabs** and inline editing:

| Tab | Contents | Editable |
|---|---|---|
| Overview | Title, description, dates, location, difficulty, slots, services, tags, flags | ✅ |
| Itinerary | Day-by-day cards with collapsible activity list | — |
| Participants | Booking participant table; user info, booking status, payment status | — |
| Payments | All payments for this trip | — |
| Providers | Service provider assignments; agreed amount, lifecycle status | — |
| Reviews | Average rating banner + individual review cards | — |

- **Cover thumbnail** from `imageUrls[0]` with letter-avatar fallback
- **Stats strip:** slots filled, reviews count, payments count, participants count
- Save/Cancel buttons per-tab with success/error feedback

### CuratedTrips — `src/views/trips/CuratedTrips.jsx`

- Lists trips managed by Trip Managers

---

## Finance

All money is stored in **paise** (minor units) and displayed as `₹X,XX,XXX.XX`.

### PaymentList — `src/views/finance/PaymentList.jsx`

- Paginated payment list with status filter and sorting
- **View** button → navigates to `PaymentDetail`

### PaymentDetail — `src/views/finance/PaymentDetail.jsx`

Full payment breakdown:

- **Amount box:** Base Amount, Platform Fee, Gateway Fee, GST on Gateway, Discount, Total Charged, Total Refunded
- Transaction IDs in `font-monospace`
- Two-column layout: left (amounts, IDs, method) / right (payer, recipient, trip, booking, timestamps)
- **Refunds table** (when present)
- **Payouts table:** Gross, Net, Platform Fee, Method, Status, Created
- Collapsible **raw gateway payload** (`<details>`)

### RefundList — `src/views/finance/RefundList.jsx`

- Paginated refund list with **View** button → `RefundDetail`

### RefundDetail — `src/views/finance/RefundDetail.jsx`

- Refund amount, currency, policy percentage
- Reason, initiator, journal ID, gateway refund ID
- Timeline (created / initiated / completed)
- Original payment summary with **"View Full Payment →"** link

### LinkedAccounts — `src/views/finance/LinkedAccounts.jsx`

- Lists all connected gateway accounts (TripManagers / SPs)
- KYC status, onboard status, active flag
- **View** button → `LinkedAccountDetail`

### LinkedAccountDetail — `src/views/finance/LinkedAccountDetail.jsx`

Two tabs:

| Tab | Contents |
|---|---|
| Account Details | Gateway account ID, entity, KYC status + rejection reason, product config ID, onboard status |
| Transfer History | Status summary chips; full payout table (trip, gross, platform fee, net, method, mode, status, gateway ref, initiated, completed); failure notes |

- **Total transferred** (sum of SUCCESS payouts) displayed in header

### PayoutList — `src/views/finance/PayoutList.jsx`

Paginated list of all payouts.

### PayoutSchedule — `src/views/finance/PayoutSchedule.jsx`

Payout milestone schedule view.

---

## Media Library

**File:** `src/views/media/MediaLibrary.jsx`

A full media management tool for all records in the `Media` table.

### Grid View

- Responsive CSS grid (`auto-fill`, `minmax(160px, 1fr)`)
- **Images:** lazy-loaded thumbnail (`thumbUrl` → `url` fallback)
- **Videos:** `<video poster={thumbUrl} preload="metadata">` with a play-button overlay
- **Other files:** MIME type label + icon fallback
- **Broken image detection:** `onError` event adds ID to a client-side `brokenIds` Set; broken items get a red badge

### Filters & Search

| Filter | Options |
|---|---|
| Search | File name / key substring |
| Type | All / Images / Videos / Documents |
| Status | All / Active / Inactive / Archived |
| MIME | All / image / video / application |
| Broken only | Toggle to show only broken images |

### Selection & Bulk Actions

- **Checkbox** on each card (top-left); click card → open sidebar, click checkbox → select
- **Select All** / deselect all visible items
- **Delete N selected** — bulk DELETE with confirmation dialog
- **Clear selection** — resets all checkboxes instantly

### Right Sidebar (`COffcanvas`)

Opens on card click (placement=end, width=340). Scroll-lock bug fixed: `scroll` + `backdrop={false}` prevents body `overflow:hidden` from getting stuck.

**Contents:**
- Full image preview (or `<video controls>` for videos)
- Status + type badges
- Details table: file name, size, dimensions (w×h), MIME type, uploader name/email, created date, storage key (monospace)
- **Used In** section: trip, destination, user, service listing references
- **Visible / Hidden** toggle buttons (approval status)
- **Delete** button with confirmation

---

## Operations

| Page | Path | Description |
|---|---|---|
| CaseList | `/cases` | Support case queue with status filter |
| CaseDetail | `/cases/:id` | Full case view with admin response |
| BroadcastList | `/broadcasts` | Push notification broadcast history |
| ReviewList | `/reviews` | All user reviews; flag / verify / delete |
| MessageList | `/messages` | Conversation message log |

---

## Jungle Mode

| Page | Path | Description |
|---|---|---|
| SafariSessions | `/jungle-mode` | List of all safari / sighting sessions |
| SafariSessionDetail | `/jungle-mode/:id` | Session detail; sightings, participants, map |
| SpeciesList | `/species` | Species catalogue with vulnerability flag |

---

## Settings

### Platform Fee Settings — `src/views/settings/PlatformFeeSettings.jsx`

Manages `PlatformFeeConfig` records. Activity is **date-derived**: a config is active when `effectiveFrom ≤ now` and `effectiveUntil` is null or in the future.

| Feature | Behaviour |
|---|---|
| List | Sortable table; rate, appliesTo, effectiveFrom/Until, status badge |
| New Config | Modal form: Rate (%), Applies To, Effective From/Until, Notes |
| Set Active | Single-click activation; **all other active configs get `effectiveUntil = now`** in the same DB transaction |
| Cache | `clearCacheByPattern("/api/admin/platform-fee-configs")` called after create and activate to bust the server-side ETag cache |
| Feedback | Green success toast (4 s auto-dismiss); red error alert in modal footer or above table |

### Tax Settings — `src/views/settings/TaxSettings.jsx`

Manages `TaxPolicy` records. Uses an explicit `active` boolean.

| Feature | Behaviour |
|---|---|
| List | Sortable table; kind, rate, liability, appliesTo, effectiveFrom/Until, status badge |
| New Policy | Modal form: Kind (6 enum values), Rate (%), Liability, Applies To, Effective From/Until, Notes |
| Set Active | Activates the selected policy; **deactivates only other policies of the same `kind`** (e.g. activating a new `GST_ON_PLATFORM_FEE` leaves `CGST` policies untouched) — sets `active = false` + `effectiveUntil = now` on displaced policies |
| Cache | `clearCacheByPattern("/api/admin/tax-policies")` called after create and activate |

### Policy Settings — `src/views/settings/PolicySettings.jsx`

Cancellation and refund policy configuration.

### Notification Templates — `src/views/settings/NotificationTemplates.jsx`

Push/email notification template management.

---

## Monitoring

### Live Users — `src/views/monitoring/LiveUsers.jsx`

Real-time socket connection monitor via Socket.IO (`joinAdmin` room).

**Left panel:**
- Large connection count badge
- Unique user count
- Last-update timestamp
- Recent updates history (last 20 events)

**Right panel — Connected Users table:**

| Column | Source |
|---|---|
| User (avatar + name + email) | Fetched from DB once during socket auth middleware; stored in `socket.data` |
| Role | Badge colour-coded by role |
| Connections | Count of sockets for same userId; shows "N tabs" badge if > 1 |
| Connected Since | `socket.data.connectedAt` ISO timestamp |

On every connect/disconnect, `emitLiveUpdate` iterates all sockets, deduplicates by `userId` into a Map, and broadcasts `{ connectedCount, users[], timestamp }` to the `admin-monitor` room.

### Webhook Log — `src/views/monitoring/WebhookLog.jsx`

Paginated log of all inbound webhook events from Razorpay and other gateways.

### Notification Log — `src/views/monitoring/NotificationLog.jsx`

Delivery log for push and email notifications.

---

## Admin Profile

**File:** `src/views/profile/AdminProfile.jsx`

- View and edit admin user's own name, email, phone, bio
- Change password (current password + new password confirmation)
- Profile photo display

---

## Navigation

**File:** `src/_nav.jsx`

Navigation groups:

| Group | Items |
|---|---|
| — | Dashboard |
| Users | All Users, SP Verification *(commented out)* |
| Content | Destinations, Destination Requests, Hotspots, Trips, Curated Trips, Media Library |
| Finance | Payments, Refunds, Payouts, Payout Schedule, Linked Accounts |
| Operations | Cases, Broadcasts, Reviews, Messages |
| Jungle Mode | Safari Sessions, Species |
| Monitoring | Live Users, Webhooks, Notifications → Delivery Log *(Queue commented out)* |
| Settings | Platform Fee, Tax Policies, Policies, Notification Templates |
| — | Admin Profile |

---

## Routing

**File:** `src/routes.js`

All routes use `React.lazy()` for code-split loading. Key ordering rules:

- Specific paths **before** parameterised paths — e.g. `/payments/refunds` and `/payments/linked-accounts` are declared before `/payments/:id` to prevent Express-style catch-all matching
- Detail pages follow their list pages in the same section

| Path | Component |
|---|---|
| `/dashboard` | Dashboard |
| `/users` | UserList |
| `/users/:id` | UserDetail |
| `/destinations` | DestinationList |
| `/destinations/requests` | DestinationRequests |
| `/destinations/:id` | DestinationDetail |
| `/destinations/:id/edit` | DestinationEdit |
| `/hotspots` | HotspotList |
| `/trips` | TripList |
| `/trips/:id` | TripDetail |
| `/payments/refunds/:id` | RefundDetail |
| `/payments/refunds` | RefundList |
| `/payments/linked-accounts/:id` | LinkedAccountDetail |
| `/payments/linked-accounts` | LinkedAccounts |
| `/payments/:id` | PaymentDetail |
| `/payments` | PaymentList |
| `/payouts` | PayoutList |
| `/payouts/schedule` | PayoutSchedule |
| `/cases/:id` | CaseDetail |
| `/cases` | CaseList |
| `/broadcasts` | BroadcastList |
| `/reviews` | ReviewList |
| `/messages` | MessageList |
| `/jungle-mode/:id` | SafariSessionDetail |
| `/jungle-mode` | SafariSessions |
| `/species` | SpeciesList |
| `/live` | LiveUsers |
| `/webhooks` | WebhookLog |
| `/notifications/log` | NotificationLog |
| `/notifications/queue` | NotificationQueue |
| `/media` | MediaLibrary |
| `/profile` | AdminProfile |
| `/settings/platform-fee` | PlatformFeeSettings |
| `/settings/tax` | TaxSettings |
| `/settings/policies` | PolicySettings |
| `/settings/notification-templates` | NotificationTemplates |

---

*Last updated: June 2026*
