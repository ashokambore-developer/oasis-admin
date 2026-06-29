# Oasis Admin Panel

Internal administration dashboard for the **Oasis** wildlife & curated-travel platform. Built with React + CoreUI, communicates with the Oasis backend via tRPC and REST APIs.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18, Vite |
| UI Library | CoreUI React v5 |
| Data fetching | TanStack Query v4 |
| Charts | Chart.js via @coreui/react-chartjs |
| Real-time | Socket.io client |
| Auth | JWT (stored in memory via AuthContext) |
| Routing | React Router v6 |

---

## Getting Started

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # production build → dist/
```

Set `VITE_API_URL` in `.env` to point at the backend (defaults to `http://localhost:8000`).

---

## Features

### Dashboard
- Platform overview: total users, trips, revenue, active bookings
- Daily revenue bar chart (30-day rolling)
- Top contributors list
- Quick-links to key sections

### Users
- **User List** — paginated, sortable; filter by role and status; excludes the currently logged-in admin
- **User Detail** — profile info, role badge, tabs for: Details, Trips, Payments, Gallery (media uploaded by the user with load-more pagination, grid/list toggle, delete action)
- **Service Provider Verification** — review SP applications, approve or reject with reason
- **Service Detail** — view individual service listing

### Trips
- **Trip List** — all trips with status, manager, participant count, sortable columns
- **Trip Detail** — full trip info, provider assignments, tabs for: Overview, Participants, Payments, Gallery (trip cover/gallery/highlight images with type labels)
- **Curated Trips** — manage featured/curated trip listings

### Finance
- **Financial Dashboard** — month-to-date revenue, daily revenue chart (formatted `2-Jun` labels), pending payouts count, quick-links
- **Payment List** — all payments with status filters, sortable; link to detail
- **Payment Detail** — full payment breakdown, download PDF invoice from S3
- **Refund List / Refund Detail** — refund tracking and status management
- **Payout List / Payout Detail** — payout records per service provider
- **Payout Schedule** — milestone-based payout schedule view
- **Linked Accounts** — Razorpay linked account management per SP
- **Linked Account Detail** — account verification status, fund account details

### Destinations
- **Destination List** — all destinations with search and filters
- **Destination Detail** — info, hotspots, linked trips, media
- **Destination Edit** — update destination details and metadata
- **Destination Requests** — user-submitted destination suggestions
- **Hotspot List** — wildlife hotspot management per destination

### Operations
- **Case List** — support cases with stats bar (Open / In Progress / Awaiting Reply / Resolved / Total); clickable stats filter the list
- **Case Detail** — status stepper (Open → In Progress → Awaiting Reply → Resolved), case info grid, response thread with admin replies, reply input (visible-to-user toggle, optional status change on reply), Update Status modal, Create Broadcast action
- **Broadcast List** — SOS/alert broadcasts sent to service providers
- **Review List** — user reviews with visibility toggle (confirmation required before changing public/private status)
- **Message List** — platform conversations overview

### Jungle Mode
- **Species List** — wildlife species catalogue with vulnerability flags
- **Safari Sessions** — active and past safari session records
- **Safari Session Detail** — session info, sightings, media

### Media Library
- Global media browser across all types (Portfolio, Trip Gallery, Trip Cover, Trip Highlight, Destination Photo)
- Grid/list toggle, type filters, delete action

### Monitoring
- **Live Users** — real-time connected user count and active session map via Socket.io
- **Analytics** — platform usage metrics
- **Notification Log** — delivery log across FCM / Expo Push / SMS channels
- **Notification Queue** — pending and scheduled notification jobs
- **Webhook Log** — Razorpay webhook event history with payload viewer

### Settings
- **Platform Fee Settings** — configure platform fee percentages
- **Tax Settings** — GST/tax policy configuration
- **Policy Settings** — platform policy text management
- **Notification Templates** — edit FCM/SMS notification message templates

### Profile
- Admin profile view and password change

---

## Project Structure

```
src/
├── components/
│   ├── AdminMediaGallery.jsx   # reusable media gallery (grid/list, load-more, delete)
│   ├── AdminTableFooter.jsx    # pagination footer for all tables
│   ├── SortableHeader.jsx      # sortable table column header
│   ├── ProtectedRoute.jsx      # auth guard
│   └── AppHeader/Sidebar/...  # layout shell
├── context/
│   └── AuthContext.jsx         # JWT auth state
├── lib/
│   ├── api.js                  # axios instance with auth interceptor
│   ├── constants.js            # formatRupees, status colors, roles
│   └── dateUtils.js            # fmtDate, fmtDateTime helpers
├── views/
│   ├── dashboard/
│   ├── users/
│   ├── trips/
│   ├── finance/
│   ├── destinations/
│   ├── operations/
│   ├── jungle/
│   ├── media/
│   ├── monitoring/
│   └── settings/
├── routes.js                   # lazy-loaded route definitions
└── store.js                    # sidebar collapse state
```

---

## Conventions

- Currency is always formatted via `formatRupees` from `src/lib/constants.js` — never inline
- Status badge colors are imported from `STATUS_COLORS` in `constants.js`
- All list pages use `AdminTableFooter` for pagination
- All detail pages use `navigate(-1)` for the Back button
- Money values from the API are in **paise** (integer) — divide by 100 before display
