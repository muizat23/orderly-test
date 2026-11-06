import { useState, useEffect } from 'react';
import type { Customer, Product, OrderItem, Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { X, Plus, Trash2, ShoppingBag, UserCheck, UserPlus } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

export const NewOrderModal = ({
  isOpen,
  onClose,
  onOrderCreated,
}: NewOrderModalProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Customer type: 'existing' | 'new'
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customAddress, setCustomAddress] = useState('');

  // Items & Status
  const [lineItems, setLineItems] = useState<{ productId: string; qty: number }[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Pending');
  const [internalNote, setInternalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDependencies = async () => {
    setError(null);
    const [custs, prods] = await Promise.all([api.getCustomers(), api.getProducts()]);
    setCustomers(custs);
    setProducts(prods);

    if (custs.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(custs[0].id);
    }
    if (prods.length > 0 && lineItems.length === 0) {
      setLineItems([{ productId: prods[0].id, qty: 1 }]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddLineItem = () => {
    if (products.length > 0) {
      setLineItems([...lineItems, { productId: products[0].id, qty: 1 }]);
    }
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const updated = [...lineItems];
    updated[index].productId = prodId;
    setLineItems(updated);
  };

  const handleQtyChange = (index: number, delta: number) => {
    const updated = [...lineItems];
    const newQty = Math.max(1, updated[index].qty + delta);
    updated[index].qty = newQty;
    setLineItems(updated);
  };

  // Calculations
  const calculatedItems: OrderItem[] = lineItems
    .map((li, idx) => {
      const prod = products.find((p) => p.id === li.productId);
      if (!prod) return null;
      return {
        id: `item-${li.productId}-${idx}`,
        name: prod.name,
        sku: prod.sku,
        qty: li.qty,
        price: prod.price,
        total: prod.price * li.qty,
      };
    })
    .filter(Boolean) as OrderItem[];

  const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 4.5;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (calculatedItems.length === 0) {
      setError('Please add at least one item to the order.');
      return;
    }

    let customerName = '';
    let customerEmail = '';
    let shippingAddress = '';
    let customerId = '';

    if (customerMode === 'existing') {
      const existing = customers.find((c) => c.id === selectedCustomerId) || customers[0];
      if (!existing) {
        setError('Please select a customer.');
        return;
      }
      customerId = existing.id;
      customerName = existing.name;
      customerEmail = existing.email;
      shippingAddress = existing.address;
    } else {
      if (!customName.trim()) {
        setError('Customer name is required.');
        return;
      }
      customerName = customName.trim();
      customerEmail = customEmail.trim() || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      shippingAddress = customAddress.trim() || 'Standard Delivery Address';
    }

    try {
      setIsSubmitting(true);
      const created = await api.createOrder({
        customerId,
        customerName,
        customerEmail,
        shippingAddress,
        items: calculatedItems,
        subtotal,
        shipping,
        tax,
        total,
        status: orderStatus,
        internalNote,
      });

      onOrderCreated(created);
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to create order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl border border-[#dde4e2] bg-white shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#dde4e2] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f0ed] text-[#0f6b5c]">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14302b]">Create New Order</h2>
              <p className="text-[11px] text-[#6b7f7a]">Add customer, products, and instant live pricing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6b7f7a] hover:bg-[#e4f0ed] hover:text-[#14302b]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="rounded-lg border border-[#f2c1b8] bg-[#f8dfda] p-3 text-xs text-[#c8442f]">
              {error}
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6b7f7a]">
                Customer Information
              </label>

              {/* Segmented switch: Existing vs New */}
              <div className="flex rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setCustomerMode('existing')}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${customerMode === 'existing'
                    ? 'bg-[#0f6b5c] text-white shadow-xs'
                    : 'text-[#6b7f7a] hover:text-[#14302b]'
                    }`}
                >
                  <UserCheck className="h-3 w-3" />
                  <span>Existing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('new')}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${customerMode === 'new'
                    ? 'bg-[#0f6b5c] text-white shadow-xs'
                    : 'text-[#6b7f7a] hover:text-[#14302b]'
                    }`}
                >
                  <UserPlus className="h-3 w-3" />
                  <span>New Customer</span>
                </button>
              </div>
            </div>

            {customerMode === 'existing' ? (
              <div>
                <Select
                  value={selectedCustomerId}
                  onValueChange={(val) => setSelectedCustomerId(val)}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl bg-[#fbfcfc] border-[#dde4e2]">
                    <SelectValue placeholder="Select customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — {c.email} {c.isVip ? '⭐ VIP' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    placeholder="Customer full name *"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs text-[#14302b] focus:border-[#0f6b5c] focus:bg-white focus:outline-hidden"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <input
                    type="email"
                    placeholder="Email address (optional)"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs text-[#14302b] focus:border-[#0f6b5c] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Shipping address (optional)"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs text-[#14302b] focus:border-[#0f6b5c] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Order Items */}
          <div className="space-y-3 border-t border-[#dde4e2] pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6b7f7a]">
                Order Items ({lineItems.length})
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="flex items-center gap-1 text-xs font-semibold text-[#0f6b5c] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {lineItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 rounded-xl border border-[#dde4e2] bg-[#fbfcfc] p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Product Selector */}
                    <div className="min-w-0 flex-1">
                      <Select
                        value={item.productId}
                        onValueChange={(val) => handleProductSelect(idx, val)}
                      >
                        <SelectTrigger className="w-full h-9 rounded-lg bg-white border-[#dde4e2]">
                          <SelectValue placeholder="Select product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} (${p.price.toFixed(2)}) — Stock: {p.stock}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Stepper + Price & Remove */}
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg border border-[#dde4e2] bg-white">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(idx, -1)}
                          className="h-7 w-7 text-xs font-bold text-[#6b7f7a] hover:bg-[#e4f0ed] hover:text-[#0f6b5c]"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#14302b]">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(idx, 1)}
                          className="h-7 w-7 text-xs font-bold text-[#6b7f7a] hover:bg-[#e4f0ed] hover:text-[#0f6b5c]"
                        >
                          +
                        </button>
                      </div>

                      {/* Total for this line */}
                      <div className="w-20 text-right font-bold text-[#14302b]">
                        ${prod ? (prod.price * item.qty).toFixed(2) : '0.00'}
                      </div>

                      {/* Remove Button */}
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="rounded-lg p-1.5 text-[#c8442f] hover:bg-[#f8dfda]"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Status & Internal Note */}
          <div className="grid grid-cols-1 gap-3 border-t border-[#dde4e2] pt-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#14302b]">Initial Status</label>
              <Select
                value={orderStatus}
                onValueChange={(val) => setOrderStatus(val as OrderStatus)}
              >
                <SelectTrigger className="w-full h-9 rounded-lg bg-[#fbfcfc] border-[#dde4e2]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#14302b]">Internal Note</label>
              <input
                type="text"
                placeholder="e.g. Gift wrap requested"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs text-[#14302b] focus:border-[#0f6b5c] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 4: Live Order Cost Breakdown */}
          <div className="rounded-xl border border-[#dde4e2] bg-[#fbfcfc] p-4 text-xs space-y-1.5">
            <div className="flex justify-between text-[#6b7f7a]">
              <span>Subtotal</span>
              <span className="font-medium text-[#14302b]">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#6b7f7a]">
              <span>Shipping {subtotal > 100 && '(Free over $100)'}</span>
              <span className="font-medium text-[#14302b]">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[#dde4e2] pt-2 text-base font-bold text-[#14302b]">
              <span>Total Amount</span>
              <span className="text-[#0f6b5c]">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#dde4e2] px-4 py-2 text-xs font-semibold text-[#6b7f7a] hover:bg-[#f3f5f4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || calculatedItems.length === 0}
              className="rounded-xl bg-[#f2a33a] px-5 py-2.5 text-xs font-bold text-[#2b1c00] transition-transform hover:bg-[#e39328] active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
