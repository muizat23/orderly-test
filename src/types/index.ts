export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  price: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  avatar?: string;
  avatarInitials?: string;
  isVip?: boolean;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'VIP' | 'New' | 'Inactive' | 'Active';
  notes?: string;
}

export interface OrderTimeline {
  placedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface Order {
  id: string; // e.g. '#10482'
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  date: string; // Display date e.g. '3 Nov 2026'
  placedTimestamp: string; // e.g. 'Placed 3 Nov 2026, 09:41'
  rawDate: string; // ISO date string for sorting & date math
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  timeline: OrderTimeline;
  internalNote?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
  reorderLevel: number;
  description: string;
  imageUrl?: string;
}

export interface InventoryItem {
  sku: string;
  productId: string;
  productName: string;
  inStock: number;
  reorderAt: number;
  status: 'Low' | 'OK' | 'Near';
}

export interface InventoryAdjustment {
  id: string;
  sku: string;
  change: string; // e.g. '-3 (sold)' or '+40 (restock)'
  actor: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  text: string;
  timeAgo: string;
  type: 'order' | 'inventory' | 'customer';
}

export type UserRole = 'Admin' | 'Staff' | 'Viewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeName?: string;
  avatarColor?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  canEditOrders: boolean;
  canManageTeam: boolean;
  avatarColor?: string;
}

export interface AppSettings {
  fullName: string;
  email: string;
  emailOnOrder: boolean;
  lowStockAlerts: boolean;
  weeklySummary: boolean;
  storeName: string;
  currency: string;
  timezone?: string;
  supportEmail?: string;
  twoFactorAuth?: boolean;
}

export interface DashboardMetrics {
  totalOrders: number;
  revenue: number;
  pendingCount: number;
  deliveredToday: number;
  monthlyRevenue: number;
  newCustomersCount: number;
}

