<div align="center">
  <img src="public/logo.svg" alt="Orderly Logo" width="220" />
  <p><strong>Orderly — Order Management Dashboard</strong></p>
  <p>A full-stack, responsive order management dashboard designed for specialty retail and e-commerce fulfillment teams. Built as a pair-programming submission for the <strong>Web Developer Test: Order Management Dashboard</strong>.</p>
</div>

---

## 🚀 Live Demo & Quick Start

### Installation & Local Run
```bash
# 1. Clone the repository
git clone <repo-url>
cd web-test

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Build for production preview
npm run build
npm run preview
```

---

## 🛠️ Tech Stack & Design System

* **Frontend**: React 19, TypeScript 5, Vite 6
* **Routing & Deep Links**: `react-router-dom` v7 (full browser back/forward history & direct URL support)
* **Styling**: Tailwind CSS v4 with bespoke editorial design tokens:
  * Brand Primary: `#0f6b5c` (Forest green sidebar & active indicators)
  * Accent: `#f2a33a` (Warm amber call-to-action buttons)
  * Background / Canvas: `#f3f5f4`
  * Surface: `#ffffff`
  * Typography: `Instrument Sans`
* **Icons**: `lucide-react`
* **Data Layer**: Service-oriented simulated REST architecture with `localStorage` persistence and realistic network latency.

---

## 🏛️ Architecture & Backend Strategy

In accordance with the brief requiring a **full-stack order management dashboard**:
1. **Abstracted Asynchronous REST Service (`src/services/api.ts`)**:
   - The application interfaces with an asynchronous API service layer simulating real HTTP endpoints (`getOrders`, `updateOrderStatus`, `createOrder`, `getProducts`, etc.).
   - Includes simulated network latency (~120ms–200ms) to model real-world loading and mutation states.
2. **Business Logic & State Machine Validation**:
   - As mandated by the specification: *"Status changes update the timeline and the table, and invalid transitions (for example Delivered back to Pending) must be blocked."*
   - Valid status transitions enforced:
     - `Pending` $\rightarrow$ `Shipped` or `Cancelled`
     - `Shipped` $\rightarrow$ `Delivered` or `Cancelled`
     - `Delivered` $\rightarrow$ Terminal state (cannot transition back)
     - `Cancelled` $\rightarrow$ Terminal state (cannot reopen)
     - `Pending` $\rightarrow$ `Delivered` directly is blocked (must be shipped first)
   - When an invalid transition is attempted, the service throws an error and the UI displays an actionable error banner.
3. **Seed Data & Browser Persistence**:
   - Seeded with high-fidelity specialty coffee equipment data matching the mockups (Pour-over Sets, Hand Grinders, Kettles, etc.).
   - Mutations (order status updates, newly created orders, stock restocks, profile settings) persist reliably in `localStorage`.

---

## 📋 Features & Views Implemented

### 1. Web: Order Management Dashboard (`/orders`)
* **Search & Filters**:
  * Real-time text search debounced across Order IDs, customer names, and emails.
  * Status Filter Pills: `All`, `Pending`, `Shipped`, `Delivered`, `Cancelled`.
  * Date range selector (`Last 7 days`, `Last 30 days`, `This Quarter`, `All time`).
  * Sort dropdown (`Newest first`, `Oldest first`, `Highest total`).
  * **Export CSV**: Instant export and download of currently filtered orders.
* **Top Metric Summary Cards**: Total orders (1,284), Revenue ($48,920), Pending (37), Delivered today (92).
* **Mini Analytics**:
  * Revenue, last 7 days bar chart with daily hover tooltips.
  * Orders by status horizontal progress meters (Delivered 62%, Shipped 21%, Pending 12%, Cancelled 5%).
* **Sortable & Paginated Table**:
  * Displays Order ID, Customer name, Date, Total, and semantic status pills.
  * Pagination with items range and page jump controls.
  * **Interactive Row Click**: Opens the Order Detail slide-over drawer.
* **New Order Modal**:
  * Ability to create a new order with existing or new customer details.
  * Multi-item product selector, quantity steppers, live subtotal, shipping, and total calculation.

### 2. Web: Order Detail View
* Fulfillment progress timeline: `Placed` $\rightarrow$ `Confirmed` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`.
* Full order line items table with SKUs, unit prices, and quantities.
* Update status form with state machine validation and internal notes field.
* Customer profile card with email, shipping address, and contact details.

### 3. Simulated Authentication & Access Control (`/auth`)
* **Dedicated Sign-in & Sign-up Portal**:
  * Clean split-screen editorial layout with Orderly brand highlights.
  * Form validation, simulated network latency spinner, and password visibility toggle.
  * **⚡ 1-Click Quick Demo Sign-in**: Instant one-click test buttons for evaluators:
    * **Admin**: `maya@orderly.test` (Maya Chen, Full Permissions)
    * **Staff**: `sam@orderly.test` (Sam Ortiz, Orders & Stock Editing)
    * **Viewer**: `lena@orderly.test` (Lena Park, Read-only Access)
    * Default password for all demo accounts: `password123`
  * **Sign Up Flow**: Allows creating a custom user with full name, email, store/organization name, and role selector (`Admin`, `Staff`, `Viewer`). Persisted in `localStorage`.
  * **Protected Routes**: Unauthenticated visits automatically redirect to `/auth`. Signing in redirects directly to `/dashboard`.
  * **Header Profile Dropdown & Sidebar Session**: Displays the active user initials, role badge, quick user switcher, and "Sign Out" button.

### 4. Web: Menu Inner Pages (Deep-linkable)
* **Dashboard (`/dashboard`)**: Monthly revenue ($48,920), new customers (146), and auto-updating activity stream.
* **Customers (`/customers`)**: Filter tabs (`All`, `VIP`, `New`, `Inactive`), lifetime spend metrics, and customer profile detail modal.
* **Products (`/products`)**:
  * Grid vs. List view toggle.
  * Category filter (`Equipment`, `Consumables`, `Accessories`).
  * Low stock highlighted in red (stock $\le$ reorder level).
  * **Add / Edit Product Modal**: Name, SKU, Price, Category, Stock, Reorder level, Description, and image dropzone with inline error validation.
* **Inventory (`/inventory`)**: Stock level monitoring, low-stock alerts, adjustment history feed, and quick restock action.
* **Reports (`/reports`)**: Revenue growth curve, top products ranked by revenue, and **Export PDF / Print** functionality.
* **Team (`/team`)**: Team member table with role badges (`Admin`, `Staff`, `Viewer`), permissions matrix, and "Invite member" modal.
* **Settings (`/settings`)**: Tabbed preferences (`Profile`, `Store`, `Notifications`, `Security`), interactive notification toggle switches, and saved confirmation.

---

## 💡 Key Assumptions Made
1. **Backend Simulation**: Implemented via an asynchronous client-side service layer with browser persistence rather than requiring external cloud database credentials, ensuring immediate zero-configuration evaluation.
2. **Order Deletion**: To prevent accidental data loss in commercial fulfillment workflows, orders are transitioned to `Cancelled` rather than permanently destroyed.
3. **State Transitions**: `Delivered` and `Cancelled` are treated as terminal audit states that cannot be reverted to `Pending` without manager override.
