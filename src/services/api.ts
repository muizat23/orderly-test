import type {
  Order,
  OrderStatus,
  Product,
  Customer,
  InventoryItem,
  InventoryAdjustment,
  Activity,
  TeamMember,
  AppSettings,
  DashboardMetrics,
} from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_ADJUSTMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_TEAM,
  INITIAL_SETTINGS,
  INITIAL_METRICS,
} from '../data/mockData';

// Storage keys
const STORAGE_KEYS = {
  ORDERS: 'orderly_orders_v1',
  PRODUCTS: 'orderly_products_v1',
  CUSTOMERS: 'orderly_customers_v1',
  INVENTORY: 'orderly_inventory_v1',
  ADJUSTMENTS: 'orderly_adjustments_v1',
  ACTIVITIES: 'orderly_activities_v1',
  TEAM: 'orderly_team_v1',
  SETTINGS: 'orderly_settings_v1',
};

// Helper to load or seed storage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Simulated network delay
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * State Transition Rules:
 * - Pending -> Shipped, Cancelled
 * - Shipped -> Delivered, Cancelled
 * - Delivered -> Terminal (cannot transition back)
 * - Cancelled -> Terminal (cannot transition back)
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): { valid: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  if (currentStatus === 'Delivered') {
    return {
      valid: false,
      reason: 'Delivered orders cannot be transitioned back to another status.',
    };
  }

  if (currentStatus === 'Cancelled') {
    return {
      valid: false,
      reason: 'Cancelled orders are closed and cannot be reopened.',
    };
  }

  if (currentStatus === 'Pending' && targetStatus === 'Delivered') {
    return {
      valid: false,
      reason: 'Orders must be Shipped before they can be marked as Delivered.',
    };
  }

  return { valid: true };
}

export const api = {
  // Orders
  async getOrders(params?: {
    query?: string;
    status?: string;
    dateRange?: string;
    sortBy?: string;
  }): Promise<{ orders: Order[]; totalCount: number }> {
    await delay();
    let orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    if (params?.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== 'All') {
      orders = orders.filter((o) => o.status === params.status);
    }

    if (params?.sortBy === 'Oldest first') {
      orders.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
    } else if (params?.sortBy === 'Highest total') {
      orders.sort((a, b) => b.total - a.total);
    } else {
      // Default: Newest first
      orders.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
    }

    return { orders, totalCount: orders.length };
  },

  async getOrderById(id: string): Promise<Order | null> {
    await delay();
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders.find((o) => o.id === id) || null;
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    internalNote?: string
  ): Promise<Order> {
    await delay(150);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.id === orderId);

    if (index === -1) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    const currentOrder = orders[index];
    const validation = isValidStatusTransition(currentOrder.status, newStatus);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid status transition.');
    }

    const updatedTimeline = { ...currentOrder.timeline };
    const nowStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (newStatus === 'Shipped' && !updatedTimeline.shippedAt) {
      updatedTimeline.shippedAt = nowStr;
    } else if (newStatus === 'Delivered' && !updatedTimeline.deliveredAt) {
      updatedTimeline.deliveredAt = nowStr;
    } else if (newStatus === 'Cancelled' && !updatedTimeline.cancelledAt) {
      updatedTimeline.cancelledAt = nowStr;
    }

    const updatedOrder: Order = {
      ...currentOrder,
      status: newStatus,
      internalNote: internalNote !== undefined ? internalNote : currentOrder.internalNote,
      timeline: updatedTimeline,
    };

    orders[index] = updatedOrder;
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Record activity
    await this.addActivity(`Order ${orderId} status updated to ${newStatus}`, 'order');

    return updatedOrder;
  },

  async createOrder(newOrderData: Omit<Order, 'id' | 'date' | 'placedTimestamp' | 'rawDate' | 'timeline'>): Promise<Order> {
    await delay(120);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    
    // Find max ID dynamically
    let maxId = 10482;
    orders.forEach((o) => {
      const match = o.id.match(/#(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    });
    const newId = `#${maxId + 1}`;

    const now = new Date();
    const nowFormatted = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const nowWithTime = `Placed ${nowFormatted}, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const newOrder: Order = {
      ...newOrderData,
      id: newId,
      date: nowFormatted,
      placedTimestamp: nowWithTime,
      rawDate: now.toISOString(),
      timeline: {
        placedAt: nowFormatted,
        confirmedAt: newOrderData.status === 'Pending' ? undefined : nowFormatted,
        shippedAt: newOrderData.status === 'Shipped' ? nowFormatted : undefined,
        deliveredAt: newOrderData.status === 'Delivered' ? nowFormatted : undefined,
      },
    };

    orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Update customer stats or create new customer
    const customers = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const custIndex = customers.findIndex(
      (c) => (newOrder.customerId && c.id === newOrder.customerId) || c.name.toLowerCase() === newOrder.customerName.toLowerCase()
    );
    if (custIndex !== -1) {
      customers[custIndex].orderCount += 1;
      customers[custIndex].totalSpent += newOrder.total;
      customers[custIndex].lastOrderDate = nowFormatted;
      saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    } else {
      // Create and persist new customer
      const generatedCustId = newOrder.customerId || `cust-${Date.now()}`;
      newOrder.customerId = generatedCustId;
      const initials = newOrder.customerName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'NC';

      const newCustomer: Customer = {
        id: generatedCustId,
        name: newOrder.customerName,
        email: newOrder.customerEmail,
        address: newOrder.shippingAddress,
        phone: '+44 7700 900' + Math.floor(100 + Math.random() * 900),
        orderCount: 1,
        totalSpent: newOrder.total,
        lastOrderDate: nowFormatted,
        isVip: false,
        status: 'New',
        avatarInitials: initials,
      };
      customers.unshift(newCustomer);
      saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
      await this.addActivity(`New customer ${newCustomer.name} created via order`, 'customer');
    }

    // Deduct inventory
    const inventory = loadFromStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    newOrder.items.forEach((item) => {
      const invItem = inventory.find((inv) => inv.sku === item.sku);
      if (invItem) {
        invItem.inStock = Math.max(0, invItem.inStock - item.qty);
        if (invItem.inStock <= invItem.reorderAt) {
          invItem.status = 'Low';
        } else if (invItem.inStock <= invItem.reorderAt * 1.5) {
          invItem.status = 'Near';
        }
      }
    });
    saveToStorage(STORAGE_KEYS.INVENTORY, inventory);

    // Record activity
    await this.addActivity(`Order ${newId} placed by ${newOrder.customerName}`, 'order');

    return newOrder;
  },

  async deleteOrder(orderId: string): Promise<void> {
    await delay(120);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderToDelete = orders.find((o) => o.id === orderId);
    const updated = orders.filter((o) => o.id !== orderId);
    saveToStorage(STORAGE_KEYS.ORDERS, updated);

    if (orderToDelete) {
      await this.addActivity(`Order ${orderId} (${orderToDelete.customerName}) was deleted`, 'order');
    }
  },

  async deleteOrders(orderIds: string[]): Promise<void> {
    await delay(150);
    const idSet = new Set(orderIds);
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const updated = orders.filter((o) => !idSet.has(o.id));
    saveToStorage(STORAGE_KEYS.ORDERS, updated);

    await this.addActivity(`${orderIds.length} orders were deleted`, 'order');
  },

  // Products
  async getProducts(): Promise<Product[]> {
    await delay();
    return loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    await delay(150);
    const products = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Also sync to inventory
    const inventory = loadFromStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const newInvItem: InventoryItem = {
      sku: newProduct.sku,
      productId: newProduct.id,
      productName: newProduct.name,
      inStock: newProduct.stock,
      reorderAt: newProduct.reorderLevel,
      status: newProduct.stock <= newProduct.reorderLevel ? 'Low' : 'OK',
    };
    inventory.push(newInvItem);
    saveToStorage(STORAGE_KEYS.INVENTORY, inventory);

    await this.addActivity(`New product ${newProduct.name} (${newProduct.sku}) added`, 'inventory');
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay(150);
    const products = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const updated = { ...products[idx], ...updates };
    products[idx] = updated;
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return updated;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    await delay();
    return loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  async createCustomer(data: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
    notes?: string;
    isVip?: boolean;
    status?: 'New' | 'VIP' | 'Inactive';
  }): Promise<Customer> {
    await delay(120);
    const customers = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const newId = `cust-${Date.now()}`;
    const initials = data.name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'NC';

    const newCust: Customer = {
      id: newId,
      name: data.name,
      email: data.email,
      address: data.address || 'Standard Address',
      phone: data.phone || '+44 7700 900' + Math.floor(100 + Math.random() * 900),
      notes: data.notes,
      orderCount: 0,
      totalSpent: 0,
      lastOrderDate: 'Never',
      isVip: data.isVip || false,
      status: data.status || (data.isVip ? 'VIP' : 'New'),
      avatarInitials: initials,
    };
    customers.unshift(newCust);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    await this.addActivity(`New customer ${newCust.name} added`, 'customer');
    return newCust;
  },

  // Inventory
  async getInventory(): Promise<{ items: InventoryItem[]; adjustments: InventoryAdjustment[] }> {
    await delay();
    const items = loadFromStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const adjustments = loadFromStorage<InventoryAdjustment[]>(STORAGE_KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS);
    return { items, adjustments };
  },

  async restockInventory(
    sku: string,
    quantityToAdd: number,
    actor = 'Maya'
  ): Promise<{ items: InventoryItem[]; adjustments: InventoryAdjustment[] }> {
    await delay(150);
    const inventory = loadFromStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const adjustments = loadFromStorage<InventoryAdjustment[]>(STORAGE_KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS);
    const products = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

    const invIndex = inventory.findIndex((it) => it.sku === sku);
    if (invIndex === -1) {
      throw new Error(`Inventory item with SKU "${sku}" not found.`);
    }

    const item = inventory[invIndex];
    const newStock = item.inStock + quantityToAdd;
    const newStatus: 'OK' | 'Near' | 'Low' =
      newStock <= item.reorderAt
        ? 'Low'
        : newStock <= item.reorderAt * 1.5
        ? 'Near'
        : 'OK';

    inventory[invIndex] = {
      ...item,
      inStock: newStock,
      status: newStatus,
    };
    saveToStorage(STORAGE_KEYS.INVENTORY, inventory);

    // Sync product stock
    const prodIndex = products.findIndex((p) => p.sku === sku);
    if (prodIndex !== -1) {
      products[prodIndex].stock = newStock;
      saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    }

    // Add adjustment entry
    const newAdjustment: InventoryAdjustment = {
      id: `adj-${Date.now()}`,
      sku,
      change: `+${quantityToAdd} (restock)`,
      actor,
      timestamp: 'Just now',
    };
    adjustments.unshift(newAdjustment);
    saveToStorage(STORAGE_KEYS.ADJUSTMENTS, adjustments);

    await this.addActivity(`Restocked ${item.productName} (+${quantityToAdd}) by ${actor}`, 'inventory');

    return { items: inventory, adjustments };
  },

  // Activities
  async getActivities(): Promise<Activity[]> {
    await delay();
    return loadFromStorage<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },

  async addActivity(text: string, type: 'order' | 'inventory' | 'customer'): Promise<void> {
    const activities = loadFromStorage<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    activities.unshift({
      id: `act-${Date.now()}`,
      text,
      timeAgo: 'Just now',
      type,
    });
    saveToStorage(STORAGE_KEYS.ACTIVITIES, activities.slice(0, 20));
  },

  // Team
  async getTeam(): Promise<TeamMember[]> {
    await delay();
    return loadFromStorage<TeamMember[]>(STORAGE_KEYS.TEAM, INITIAL_TEAM);
  },

  async addTeamMember(data: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    await delay(120);
    const team = loadFromStorage<TeamMember[]>(STORAGE_KEYS.TEAM, INITIAL_TEAM);
    const newMember: TeamMember = {
      ...data,
      id: `team-${Date.now()}`,
    };
    team.push(newMember);
    saveToStorage(STORAGE_KEYS.TEAM, team);
    await this.addActivity(`Team member ${newMember.name} (${newMember.role}) added`, 'customer');
    return newMember;
  },

  async deleteTeamMember(id: string): Promise<void> {
    await delay(120);
    const team = loadFromStorage<TeamMember[]>(STORAGE_KEYS.TEAM, INITIAL_TEAM);
    const filtered = team.filter((m) => m.id !== id);
    saveToStorage(STORAGE_KEYS.TEAM, filtered);
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    await delay();
    return loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    await delay(150);
    const current = loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const updated = { ...current, ...settings };
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('orderly_settings_updated', { detail: updated }));
    }
    return updated;
  },

  // Metrics
  async getMetrics(): Promise<DashboardMetrics> {
    await delay();
    const orders = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const customers = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const totalOrders = Math.max(0, INITIAL_METRICS.totalOrders + (orders.length - INITIAL_ORDERS.length));
    const pendingCount = orders.filter((o) => o.status === 'Pending').length;
    const initialOrdersTotal = INITIAL_ORDERS.reduce((sum, o) => sum + o.total, 0);
    const currentOrdersTotal = orders.reduce((sum, o) => sum + o.total, 0);
    const revenue = Math.max(0, Math.round(INITIAL_METRICS.revenue + (currentOrdersTotal - initialOrdersTotal)));
    const newCustomersCount = Math.max(0, INITIAL_METRICS.newCustomersCount + (customers.length - INITIAL_CUSTOMERS.length));

    return {
      totalOrders,
      revenue,
      pendingCount,
      deliveredToday: INITIAL_METRICS.deliveredToday,
      monthlyRevenue: revenue,
      newCustomersCount,
    };
  },
};
