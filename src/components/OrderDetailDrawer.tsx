import { useState, useEffect } from 'react';
import type { Order, OrderStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { isValidStatusTransition } from '../services/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import { X, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedOrder: Order) => void;
  onDeleteOrder?: (order: Order) => void;
}

export const OrderDetailDrawer = ({
  order,
  isOpen,
  onClose,
  onStatusUpdated,
  onDeleteOrder,
}: OrderDetailDrawerProps) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Pending');
  const [internalNote, setInternalNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setInternalNote(order.internalNote || '');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleStatusChange = (newStatus: OrderStatus) => {
    setErrorMessage(null);
    setSelectedStatus(newStatus);
    const validation = isValidStatusTransition(order.status, newStatus);
    if (!validation.valid) {
      setErrorMessage(validation.reason || 'Invalid status transition.');
    }
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validation = isValidStatusTransition(order.status, selectedStatus);
    if (!validation.valid) {
      setErrorMessage(validation.reason || 'Invalid transition.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { api } = await import('../services/api');
      const updated = await api.updateOrderStatus(order.id, selectedStatus, internalNote);
      setSuccessMessage('Order status updated successfully!');
      onStatusUpdated(updated);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to update order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Timeline progression state calculation
  const getTimelineStepStatus = (step: 'Placed' | 'Confirmed' | 'Shipped' | 'Delivered') => {
    if (order.status === 'Cancelled') {
      return step === 'Placed' ? 'active' : 'inactive';
    }

    switch (step) {
      case 'Placed':
        return 'active';
      case 'Confirmed':
        return order.timeline.confirmedAt || ['Shipped', 'Delivered'].includes(order.status)
          ? 'active'
          : 'inactive';
      case 'Shipped':
        return ['Shipped', 'Delivered'].includes(order.status) ? 'active' : 'inactive';
      case 'Delivered':
        return order.status === 'Delivered' ? 'active' : 'inactive';
      default:
        return 'inactive';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl transition-transform">
          {/* Top drawer bar */}
          <div className="flex items-center justify-between border-b border-[#dde4e2] px-6 py-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#14302b]">Order {order.id}</h2>
              <StatusBadge status={order.status} />
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#6b7f7a] hover:bg-[#e4f0ed] hover:text-[#14302b]"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-[calc(100vh-65px)] overflow-y-auto p-6 space-y-6">
            {/* Timeline Widget */}
            <div className="rounded-xl border border-[#dde4e2] bg-[#fbfcfc] p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs text-[#6b7f7a]">{order.placedTimestamp}</span>
                {order.status === 'Cancelled' && (
                  <span className="text-xs font-semibold text-[#c8442f]">Cancelled order</span>
                )}
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                {(['Placed', 'Confirmed', 'Shipped', 'Delivered'] as const).map((step) => {
                  const state = getTimelineStepStatus(step);
                  const isActive = state === 'active';
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`mb-1.5 flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                          isActive ? 'bg-[#0f6b5c]' : 'bg-[#dde4e2]'
                        }`}
                      >
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <span
                        className={`text-xs ${
                          isActive ? 'font-semibold text-[#14302b]' : 'text-[#6b7f7a]'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two column detail layout: Left Items, Right Actions & Customer */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* Order Items Table (3 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <Card className="p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6b7f7a]">
                    Order Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#dde4e2] text-[#6b7f7a]">
                          <th className="pb-2 font-medium">Item</th>
                          <th className="pb-2 font-medium">SKU</th>
                          <th className="pb-2 text-center font-medium">Qty</th>
                          <th className="pb-2 text-right font-medium">Price</th>
                          <th className="pb-2 text-right font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dde4e2]">
                        {order.items.map((item) => (
                          <tr key={item.id} className="text-[#14302b]">
                            <td className="py-2.5 font-medium">{item.name}</td>
                            <td className="py-2.5 text-[#6b7f7a]">{item.sku}</td>
                            <td className="py-2.5 text-center">{item.qty}</td>
                            <td className="py-2.5 text-right">${item.price.toFixed(2)}</td>
                            <td className="py-2.5 text-right font-semibold">
                              ${item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#dde4e2] pt-3 text-xs">
                    <div className="space-x-3 text-[#6b7f7a]">
                      <span>Shipping ${order.shipping.toFixed(2)}</span>
                      <span>Tax ${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="text-sm font-bold text-[#14302b]">
                      Total ${order.total.toFixed(2)}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Status Update & Customer Info (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                {/* Update Status Card in shadcn Card */}
                <Card className="p-4">
                  <h3 className="mb-3 text-sm font-semibold text-[#14302b]">Update status</h3>

                  {errorMessage && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-[#f2c1b8] bg-[#f8dfda] p-2.5 text-xs text-[#c8442f]">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#bfe5d1] bg-[#d9f0e3] p-2.5 text-xs text-[#2e8b57]">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#6b7f7a] mb-1">Status</label>
                      <Select
                        value={selectedStatus}
                        onValueChange={(val) => handleStatusChange(val as OrderStatus)}
                      >
                        <SelectTrigger className="w-full h-9 rounded-lg bg-[#fbfcfc] border-[#dde4e2]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-[#6b7f7a] mb-1">Internal note</label>
                      <textarea
                        rows={2}
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Add internal notes for staff..."
                        className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2.5 text-xs text-[#14302b] focus:border-[#0f6b5c] focus:outline-hidden"
                      />
                    </div>

                    <Button
                      variant="accent"
                      onClick={handleSave}
                      disabled={isSubmitting || !!errorMessage}
                      className="w-full"
                    >
                      {isSubmitting ? 'Saving...' : 'Save changes'}
                    </Button>

                    {onDeleteOrder && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onDeleteOrder(order)}
                        className="w-full gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete order</span>
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Customer Info Card in shadcn Card */}
                <Card className="p-4 text-xs space-y-2.5">
                  <h3 className="text-sm font-semibold text-[#14302b]">Customer</h3>
                  <div>
                    <span className="text-[#6b7f7a]">Name</span>
                    <p className="mt-0.5 rounded-lg border border-[#dde4e2] bg-[#fbfcfc] px-2.5 py-1.5 font-medium text-[#14302b]">
                      {order.customerName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6b7f7a]">Email</span>
                    <p className="mt-0.5 truncate rounded-lg border border-[#dde4e2] bg-[#fbfcfc] px-2.5 py-1.5 font-medium text-[#14302b]">
                      {order.customerEmail}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6b7f7a]">Ship to</span>
                    <p className="mt-0.5 rounded-lg border border-[#dde4e2] bg-[#fbfcfc] px-2.5 py-1.5 font-medium text-[#14302b]">
                      {order.shippingAddress}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
