import { useState, useEffect } from 'react';
import type { InventoryItem, InventoryAdjustment } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../components/ui/select';
import { PlusCircle, CheckCircle2 } from 'lucide-react';

export const InventoryPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState('');
  const [restockAmount, setRestockAmount] = useState('10');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRestocking, setIsRestocking] = useState(false);

  const loadData = async () => {
    const data = await api.getInventory();
    setItems(data.items);
    setAdjustments(data.adjustments);
    if (data.items.length > 0 && !selectedSku) {
      setSelectedSku(data.items[0].sku);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(restockAmount, 10);
    if (isNaN(qty) || qty <= 0) return;

    try {
      setIsRestocking(true);
      const res = await api.restockInventory(selectedSku, qty, 'Maya');
      setItems(res.items);
      setAdjustments(res.adjustments);
      const targetItem = res.items.find((i) => i.sku === selectedSku);
      setToastMessage(
        `Successfully restocked ${targetItem?.productName || selectedSku} (+${qty} units)! Saved to storage.`
      );
      setIsRestockModalOpen(false);
      setRestockAmount('10');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      console.error('Failed to restock:', err);
    } finally {
      setIsRestocking(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-[#bfe5d1] bg-[#d9f0e3] p-3 text-xs font-medium text-[#2e8b57] animate-fade-in shadow-2xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#14302b]">Inventory</h2>
          <p className="text-xs text-[#6b7f7a]">
            Stock levels, replenishment thresholds, and automated reorder alerts.
          </p>
        </div>

        <Button
          variant="accent"
          onClick={() => setIsRestockModalOpen(true)}
          className="gap-1.5"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Restock item</span>
        </Button>
      </div>

      {/* Main Inventory Table in shadcn Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#dde4e2] text-[#6b7f7a]">
                <th className="py-2.5 pl-4 pr-3 font-medium">SKU</th>
                <th className="px-3 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 font-medium">In stock</th>
                <th className="px-3 py-2.5 font-medium">Reorder at</th>
                <th className="py-2.5 pl-3 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4e2]">
              {items.map((item) => (
                <tr key={item.sku} className="hover:bg-[#f9fbfa]">
                  <td className="py-3 pl-4 pr-3 font-semibold text-[#14302b]">{item.sku}</td>
                  <td className="px-3 py-3 font-medium text-[#14302b]">{item.productName}</td>
                  <td
                    className={`px-3 py-3 font-bold ${
                      item.status === 'Low' ? 'text-[#c8442f]' : 'text-[#14302b]'
                    }`}
                  >
                    {item.inStock}
                  </td>
                  <td className="px-3 py-3 text-[#6b7f7a]">{item.reorderAt}</td>
                  <td className="py-3 pl-3 pr-4">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjustment History Feed in shadcn Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#6b7f7a]">
            Adjustment history
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="divide-y divide-[#dde4e2]">
            {adjustments.map((adj) => (
              <div key={adj.id} className="flex items-center justify-between py-2.5 text-xs">
                <span className="font-medium text-[#14302b]">
                  {adj.sku}: {adj.change} by {adj.actor}
                </span>
                <em className="text-[11px] not-italic text-[#6b7f7a]">{adj.timestamp}</em>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restock Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsRestockModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-[#dde4e2] bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-[#14302b]">Quick Restock</h3>
            <form onSubmit={handleRestock} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-[#6b7f7a] mb-1">Select Item</label>
                <Select
                  value={selectedSku}
                  onValueChange={(val) => setSelectedSku(val)}
                >
                  <SelectTrigger className="w-full h-9 rounded-lg bg-[#fbfcfc] border-[#dde4e2]">
                    <SelectValue placeholder="Select item to restock" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((i) => (
                      <SelectItem key={i.sku} value={i.sku}>
                        {i.productName} ({i.sku}) - Current: {i.inStock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-[#6b7f7a] mb-1">Quantity to add</label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRestockModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={isRestocking}
                >
                  {isRestocking ? 'Restocking...' : 'Confirm Restock'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
