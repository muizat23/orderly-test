import { useState, useEffect, useMemo } from 'react';
import type { Order } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { OrderDetailDrawer } from '../components/OrderDetailDrawer';
import { NewOrderModal } from '../components/NewOrderModal';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../components/ui/select';
import { Search, Download, ChevronLeft, ChevronRight, Plus, CheckCircle2, ArrowRight, Trash2, AlertTriangle } from 'lucide-react';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('Newest first');
  const [dateRange, setDateRange] = useState<string>('Last 30 days');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Selected order for detail drawer
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // Real-time flash & Toast notification
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    id?: string;
    customer?: string;
    total?: number;
    message?: string;
    type?: 'success' | 'danger';
  } | null>(null);

  // Multi-select & Deletion state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [orderToDelete, setOrderToDelete] = useState<
    Order | { ids: string[]; count: number; total: number } | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState({
    totalOrders: 1284,
    revenue: 48920,
    pending: 37,
    deliveredToday: 92,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderRes, metricRes] = await Promise.all([
        api.getOrders({
          query: searchQuery,
          status: selectedStatus,
          sortBy: selectedSort,
        }),
        api.getMetrics(),
      ]);
      setOrders(orderRes.orders);
      setMetrics({
        totalOrders: metricRes.totalOrders,
        revenue: metricRes.revenue,
        pending: metricRes.pendingCount,
        deliveredToday: metricRes.deliveredToday,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedStatus, selectedSort]);

  // Dynamic Status Breakdown computed live from current orders
  const statusBreakdown = useMemo(() => {
    const total = orders.length || 1;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    const shipped = orders.filter((o) => o.status === 'Shipped').length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;

    return {
      delivered: { count: delivered, pct: Math.round((delivered / total) * 100) },
      shipped: { count: shipped, pct: Math.round((shipped / total) * 100) },
      pending: { count: pending, pct: Math.round((pending / total) * 100) },
      cancelled: { count: cancelled, pct: Math.round((cancelled / total) * 100) },
    };
  }, [orders]);

  // Handle CSV export
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Date', 'Total', 'Status', 'Shipping Address'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.date}"`,
      o.total.toFixed(2),
      o.status,
      `"${o.shippingAddress}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, currentPage]);

  // Checkbox selection helpers
  const isAllPageSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((o) => selectedOrderIds.includes(o.id));

  const handleToggleSelectAll = () => {
    if (isAllPageSelected) {
      setSelectedOrderIds((prev) =>
        prev.filter((id) => !paginatedOrders.some((o) => o.id === id))
      );
    } else {
      const pageIds = paginatedOrders.map((o) => o.id);
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectRow = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Adjust pagination when rows are removed
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(orders.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [orders.length, currentPage]);

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    try {
      setIsDeleting(true);
      if ('id' in orderToDelete) {
        const deletedId = orderToDelete.id;
        await api.deleteOrder(deletedId);
        setOrders((prev) => prev.filter((o) => o.id !== deletedId));
        setSelectedOrderIds((prev) => prev.filter((id) => id !== deletedId));

        if (activeOrder?.id === deletedId) {
          setIsDetailOpen(false);
          setActiveOrder(null);
        }

        setToastNotification({
          message: `Order ${deletedId} was successfully deleted.`,
          type: 'danger',
        });
      } else {
        const idsToDelete = orderToDelete.ids;
        await api.deleteOrders(idsToDelete);
        const set = new Set(idsToDelete);
        setOrders((prev) => prev.filter((o) => !set.has(o.id)));
        setSelectedOrderIds([]);

        if (activeOrder && set.has(activeOrder.id)) {
          setIsDetailOpen(false);
          setActiveOrder(null);
        }

        setToastNotification({
          message: `${orderToDelete.count} orders were successfully deleted.`,
          type: 'danger',
        });
      }

      const m = await api.getMetrics();
      setMetrics({
        totalOrders: m.totalOrders,
        revenue: m.revenue,
        pending: m.pendingCount,
        deliveredToday: m.deliveredToday,
      });

      setTimeout(() => {
        setToastNotification(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
    }
  };

  const handleRowClick = (order: Order) => {
    setActiveOrder(order);
    setIsDetailOpen(true);
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    setActiveOrder(updatedOrder);
    api.getMetrics().then((m) => {
      setMetrics({
        totalOrders: m.totalOrders,
        revenue: m.revenue,
        pending: m.pendingCount,
        deliveredToday: m.deliveredToday,
      });
    });
  };

  const handleOrderCreated = (newOrder: Order) => {
    setSelectedStatus('All');
    setSearchQuery('');
    setCurrentPage(1);
    setOrders((prev) => [newOrder, ...prev]);

    setNewlyCreatedId(newOrder.id);
    setTimeout(() => {
      setNewlyCreatedId(null);
    }, 6000);

    setToastNotification({
      id: newOrder.id,
      customer: newOrder.customerName,
      total: newOrder.total,
      type: 'success',
    });
    setTimeout(() => {
      setToastNotification(null);
    }, 5000);

    api.getMetrics().then((m) => {
      setMetrics({
        totalOrders: m.totalOrders,
        revenue: m.revenue,
        pending: m.pendingCount,
        deliveredToday: m.deliveredToday,
      });
    });
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastNotification && (
        <div
          className={`flex items-center justify-between rounded-xl border p-3 text-xs shadow-sm animate-fade-in ${toastNotification.type === 'danger'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-[#bfe5d1] bg-[#d9f0e3] text-[#2e8b57]'
            }`}
        >
          <div className="flex items-center gap-2">
            {toastNotification.type === 'danger' ? (
              <Trash2 className="h-4 w-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2e8b57]" />
            )}
            <span>
              {toastNotification.message ? (
                toastNotification.message
              ) : (
                <>
                  <strong>{toastNotification.id}</strong> created for{' '}
                  <strong>{toastNotification.customer}</strong> ($
                  {toastNotification.total?.toFixed(2)}) — added to table in real time!
                </>
              )}
            </span>
          </div>
          {toastNotification.id && !toastNotification.message && (
            <button
              onClick={() => {
                const created = orders.find((o) => o.id === toastNotification.id);
                if (created) {
                  setActiveOrder(created);
                  setIsDetailOpen(true);
                }
                setToastNotification(null);
              }}
              className="flex items-center gap-1 font-bold underline hover:text-[#0f6b5c] cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
          {toastNotification.message && (
            <button
              onClick={() => setToastNotification(null)}
              className="font-semibold hover:underline cursor-pointer ml-3 shrink-0"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Top Search & Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by order ID or customer"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-[#dde4e2] bg-white py-2 pl-9 pr-3 text-xs text-[#14302b] placeholder-[#6b7f7a] focus:border-[#0f6b5c] focus:outline-hidden"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6b7f7a]" />
        </div>

        <Button
          variant="accent"
          onClick={() => setIsNewOrderOpen(true)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>New order</span>
        </Button>
      </div>

      {/* 4 Summary Stats Cards using shadcn Card */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <span className="text-xs text-[#6b7f7a]">Total orders</span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#14302b]">
            {metrics.totalOrders.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-[#6b7f7a]">Revenue</span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#14302b]">
            ${metrics.revenue.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-[#6b7f7a]">Pending</span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#14302b]">
            {metrics.pending}
          </p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-[#6b7f7a]">Delivered today</span>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#14302b]">
            {metrics.deliveredToday}
          </p>
        </Card>
      </div>

      {/* Mini Charts Grid: shadcn Card for Revenue & Status Breakdown */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Revenue 7 days Bar Chart Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#14302b]">Revenue, last 7 days</CardTitle>
            <span className="text-[11px] text-[#6b7f7a]">Avg $6,988/day</span>
          </CardHeader>
          <CardContent>
            <div className="flex h-28 items-end gap-3 pt-2">
              {[
                { day: 'Mon', h: '45%', val: '$4,520' },
                { day: 'Tue', h: '62%', val: '$6,200' },
                { day: 'Wed', h: '50%', val: '$5,010' },
                { day: 'Thu', h: '78%', val: '$7,840' },
                { day: 'Fri', h: '68%', val: '$6,800' },
                { day: 'Sat', h: '92%', val: '$9,250' },
                { day: 'Sun', h: '70%', val: '$7,100', accent: true },
              ].map((col) => (
                <div key={col.day} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      style={{ height: col.h }}
                      className={`w-full rounded-t-sm transition-all group-hover:opacity-90 ${col.accent ? 'bg-[#f2a33a]' : 'bg-[#0f6b5c]'
                        }`}
                    />
                  </div>
                  <span className="mt-1.5 text-[10px] text-[#6b7f7a]">{col.day}</span>
                  <div className="pointer-events-none absolute -top-7 hidden rounded bg-[#14302b] px-1.5 py-0.5 text-[10px] text-white shadow-xs group-hover:block">
                    {col.val}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Orders by Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold text-[#14302b]">Orders by status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-[#14302b]">Delivered</span>
                <span className="text-[#6b7f7a]">
                  {statusBreakdown.delivered.pct}% ({statusBreakdown.delivered.count})
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#e4f0ed]">
                <div
                  className="h-full bg-[#0f6b5c] transition-all duration-500"
                  style={{ width: `${Math.max(4, statusBreakdown.delivered.pct)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-[#14302b]">Shipped</span>
                <span className="text-[#6b7f7a]">
                  {statusBreakdown.shipped.pct}% ({statusBreakdown.shipped.count})
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#e4f0ed]">
                <div
                  className="h-full bg-[#2f6fc8] transition-all duration-500"
                  style={{ width: `${Math.max(4, statusBreakdown.shipped.pct)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-[#14302b]">Pending</span>
                <span className="text-[#6b7f7a]">
                  {statusBreakdown.pending.pct}% ({statusBreakdown.pending.count})
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#e4f0ed]">
                <div
                  className="h-full bg-[#f2a33a] transition-all duration-500"
                  style={{ width: `${Math.max(4, statusBreakdown.pending.pct)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-[#14302b]">Cancelled</span>
                <span className="text-[#6b7f7a]">
                  {statusBreakdown.cancelled.pct}% ({statusBreakdown.cancelled.count})
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#e4f0ed]">
                <div
                  className="h-full bg-[#c8442f] transition-all duration-500"
                  style={{ width: `${Math.max(4, statusBreakdown.cancelled.pct)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
            className={`rounded-lg border px-3 py-1.5 transition-colors cursor-pointer ${selectedStatus === status
                ? 'border-[#0f6b5c] bg-[#e4f0ed] font-semibold text-[#0f6b5c]'
                : 'border-[#dde4e2] bg-white text-[#14302b] hover:bg-[#f3f5f4]'
              }`}
          >
            {status}
          </button>
        ))}

        <Select value={dateRange} onValueChange={(val) => setDateRange(val)}>
          <SelectTrigger className="w-auto h-8 gap-2 bg-white">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Last 7 days">Date: Last 7 days</SelectItem>
            <SelectItem value="Last 30 days">Date: Last 30 days</SelectItem>
            <SelectItem value="This Quarter">Date: This Quarter</SelectItem>
            <SelectItem value="All time">Date: All time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSort} onValueChange={(val) => setSelectedSort(val)}>
          <SelectTrigger className="w-auto h-8 gap-2 bg-white">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Newest first">Sort: Newest first</SelectItem>
            <SelectItem value="Oldest first">Sort: Oldest first</SelectItem>
            <SelectItem value="Highest total">Sort: Highest total</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="ml-auto gap-1.5"
        >
          <Download className="h-3.5 w-3.5 text-[#6b7f7a]" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Multi-select Action Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-2.5 text-xs text-rose-950 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
              {selectedOrderIds.length}
            </span>
            <span className="font-semibold">
              {selectedOrderIds.length === 1 ? '1 order' : `${selectedOrderIds.length} orders`} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Clear selection
            </button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
                const totalAmount = selected.reduce((sum, o) => sum + o.total, 0);
                setOrderToDelete({
                  ids: selectedOrderIds,
                  count: selectedOrderIds.length,
                  total: totalAmount,
                });
              }}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete selected ({selectedOrderIds.length})</span>
            </Button>
          </div>
        </div>
      )}

      {/* Orders Data Table in shadcn Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#dde4e2] bg-[#fbfcfc] text-[#6b7f7a]">
                <th className="py-2.5 pl-4 pr-2 w-9">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={handleToggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-[#dde4e2] accent-[#0f6b5c] cursor-pointer"
                    aria-label="Select all orders on this page"
                  />
                </th>
                <th className="py-2.5 px-3 font-semibold">Order</th>
                <th className="px-3 py-2.5 font-semibold">Customer</th>
                <th className="px-3 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 font-semibold">Total</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="py-2.5 pl-3 pr-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4e2]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#6b7f7a]">
                    Loading orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#6b7f7a]">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isNew = order.id === newlyCreatedId;
                  const isSelected = selectedOrderIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleRowClick(order)}
                      className={`cursor-pointer transition-colors duration-200 ${isSelected
                          ? 'bg-[#f0f7f5]'
                          : isNew
                            ? 'bg-[#d9f0e3]/50 hover:bg-[#d9f0e3]/70 font-semibold'
                            : 'hover:bg-[#f9fbfa]'
                        }`}
                    >
                      <td
                        className="py-3 pl-4 pr-2 w-9"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(order.id)}
                          className="h-3.5 w-3.5 rounded border-[#dde4e2] accent-[#0f6b5c] cursor-pointer"
                          aria-label={`Select order ${order.id}`}
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#14302b]">
                        <div className="flex items-center gap-2">
                          <span>{order.id}</span>
                          {isNew && (
                            <span className="rounded-full bg-[#0f6b5c] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider animate-pulse">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-[#14302b]">
                        {order.customerName}
                      </td>
                      <td className="px-3 py-3 text-[#6b7f7a]">{order.date}</td>
                      <td className="px-3 py-3 font-bold text-[#14302b]">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td
                        className="py-3 pl-3 pr-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          title={`Delete order ${order.id}`}
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#6b7f7a] hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer group"
                        >
                          <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#dde4e2] px-4 py-3 sm:flex-row">
          <span className="text-xs text-[#6b7f7a]">
            Showing {orders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, orders.length)} of {metrics.totalOrders.toLocaleString()}
          </span>

          <div className="flex items-center gap-1.5 text-xs text-[#6b7f7a]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded px-2 py-1 hover:bg-[#f3f5f4] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`h-6 w-6 rounded text-xs transition-colors cursor-pointer ${currentPage === p
                      ? 'bg-[#0f6b5c] font-semibold text-white'
                      : 'hover:bg-[#f3f5f4] text-[#14302b]'
                    }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded px-2 py-1 hover:bg-[#f3f5f4] disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Card>

      <p className="text-xs text-[#6b7f7a]">
        Clicking a row opens a detail drawer with items, customer info, and a status dropdown.
      </p>

      {/* Slide-over Detail Drawer */}
      <OrderDetailDrawer
        order={activeOrder}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusUpdated={handleOrderUpdated}
        onDeleteOrder={(order) => setOrderToDelete(order)}
      />

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isDeleting && setOrderToDelete(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-[#dde4e2] bg-white p-6 shadow-xl animate-fade-in z-10">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#14302b]">
                  {'id' in orderToDelete
                    ? `Delete Order ${orderToDelete.id}?`
                    : `Delete ${orderToDelete.count} Orders?`}
                </h3>
                <p className="mt-1 text-xs text-[#6b7f7a] leading-relaxed">
                  {'id' in orderToDelete ? (
                    <>
                      Are you sure you want to delete order{' '}
                      <strong className="text-[#14302b]">{orderToDelete.id}</strong> placed by{' '}
                      <strong className="text-[#14302b]">{orderToDelete.customerName}</strong> for{' '}
                      <strong className="text-[#0f6b5c]">${orderToDelete.total.toFixed(2)}</strong>?
                    </>
                  ) : (
                    <>
                      Are you sure you want to delete{' '}
                      <strong className="text-[#14302b]">
                        {orderToDelete.count} selected orders
                      </strong>{' '}
                      totaling{' '}
                      <strong className="text-[#0f6b5c]">${orderToDelete.total.toFixed(2)}</strong>?
                    </>
                  )}
                  <br />
                  <span className="text-rose-600 font-medium">This action cannot be undone.</span>
                </p>

                {'id' in orderToDelete && (
                  <div className="mt-3 rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[#6b7f7a]">Date:</span>
                      <span className="font-medium text-[#14302b]">{orderToDelete.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#6b7f7a]">Status:</span>
                      <StatusBadge status={orderToDelete.status} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#6b7f7a]">Email:</span>
                      <span className="font-medium text-[#14302b]">{orderToDelete.customerEmail}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Order'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
