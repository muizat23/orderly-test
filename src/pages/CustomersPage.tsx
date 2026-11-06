import { useState, useEffect } from 'react';
import type { Customer } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Mail, Phone, MapPin, X, Plus, CheckCircle2 } from 'lucide-react';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState<'All' | 'VIP' | 'New' | 'Inactive'>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Customer Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newIsVip, setNewIsVip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = async () => {
    const list = await api.getCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    try {
      setIsSubmitting(true);
      const created = await api.createCustomer({
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || undefined,
        address: newAddress.trim() || undefined,
        isVip: newIsVip,
        status: newIsVip ? 'VIP' : 'New',
      });

      setCustomers((prev) => [created, ...prev]);
      setToastMessage(`Customer ${created.name} successfully added and saved to storage!`);
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewAddress('');
      setNewIsVip(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      console.error('Failed to create customer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (filter === 'All') return true;
    if (filter === 'VIP') return c.isVip || c.status === 'VIP';
    return c.status === filter;
  });

  return (
    <div className="space-y-5">
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-[#bfe5d1] bg-[#d9f0e3] p-3 text-xs font-medium text-[#2e8b57] animate-fade-in shadow-2xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#14302b]">Customers</h2>
          <p className="text-xs text-[#6b7f7a]">
            Manage client profiles, lifetime value, and order history.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add customer</span>
        </Button>
      </div>

      {/* Filter Tabs matching mockup */}
      <div className="flex gap-2">
        {(['All', 'VIP', 'New', 'Inactive'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              filter === tab
                ? 'border-[#0f6b5c] bg-[#e4f0ed] font-semibold text-[#0f6b5c]'
                : 'border-[#dde4e2] bg-white text-[#14302b] hover:bg-[#f3f5f4]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Customers Table in shadcn Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#dde4e2] text-[#6b7f7a]">
                <th className="py-2.5 pl-4 pr-3 font-medium">Customer</th>
                <th className="px-3 py-2.5 font-medium">Orders</th>
                <th className="px-3 py-2.5 font-medium">Spent</th>
                <th className="py-2.5 pl-3 pr-4 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4e2]">
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="cursor-pointer transition-colors hover:bg-[#f9fbfa]"
                >
                  <td className="flex items-center gap-2.5 py-3 pl-4 pr-3 font-semibold text-[#14302b]">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e4f0ed] text-[11px] font-bold text-[#0f6b5c]">
                      {customer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span>{customer.name}</span>
                    {customer.isVip && <StatusBadge status="VIP" size="sm" />}
                  </td>
                  <td className="px-3 py-3 text-[#14302b]">{customer.orderCount}</td>
                  <td className="px-3 py-3 font-medium text-[#14302b]">
                    ${customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3 pl-3 pr-4 text-[#6b7f7a]">{customer.lastOrderDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-[#6b7f7a]">
        Row click opens a profile page: contact details, order history, notes.
      </p>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedCustomer(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-[#dde4e2] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dde4e2] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f6b5c] text-sm font-bold text-white">
                  {selectedCustomer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#14302b] flex items-center gap-2">
                    {selectedCustomer.name}
                    {selectedCustomer.isVip && <StatusBadge status="VIP" size="sm" />}
                  </h3>
                  <span className="text-xs text-[#6b7f7a]">{selectedCustomer.status} Customer</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1.5 text-[#6b7f7a] hover:bg-[#e4f0ed]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#14302b]">
                  <Mail className="h-4 w-4 text-[#6b7f7a]" />
                  <span>{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-[#14302b]">
                    <Phone className="h-4 w-4 text-[#6b7f7a]" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-[#14302b]">
                  <MapPin className="h-4 w-4 text-[#6b7f7a] shrink-0 mt-0.5" />
                  <span>{selectedCustomer.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-y border-[#dde4e2] py-3 text-center">
                <div className="rounded-lg bg-[#fbfcfc] p-2">
                  <span className="text-[11px] text-[#6b7f7a]">Total Orders</span>
                  <p className="text-base font-bold text-[#14302b]">
                    {selectedCustomer.orderCount}
                  </p>
                </div>
                <div className="rounded-lg bg-[#fbfcfc] p-2">
                  <span className="text-[11px] text-[#6b7f7a]">Total Spent</span>
                  <p className="text-base font-bold text-[#14302b]">
                    ${selectedCustomer.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div>
                  <span className="font-semibold text-[#14302b]">Customer Notes</span>
                  <p className="mt-1 rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2.5 text-[#6b7f7a]">
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-[#dde4e2] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dde4e2] pb-3">
              <h3 className="text-base font-bold text-[#14302b]">Add New Customer</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-[#6b7f7a] hover:bg-[#e4f0ed]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[#6b7f7a] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#6b7f7a] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#6b7f7a] mb-1">Phone (optional)</label>
                <input
                  type="text"
                  placeholder="+44 7700 900123"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#6b7f7a] mb-1">Shipping Address (optional)</label>
                <input
                  type="text"
                  placeholder="12 High Street, London"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isVip"
                  checked={newIsVip}
                  onChange={(e) => setNewIsVip(e.target.checked)}
                  className="rounded border-[#dde4e2] text-[#0f6b5c] focus:ring-0"
                />
                <label htmlFor="isVip" className="text-xs font-medium text-[#14302b] cursor-pointer">
                  Mark as VIP Client
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#dde4e2]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Create Customer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
