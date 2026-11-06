import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Activity, DashboardMetrics, Order } from '../types';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { TrendingUp, Users, ArrowRight } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function load() {
      const [m, a, o] = await Promise.all([
        api.getMetrics(),
        api.getActivities(),
        api.getOrders(),
      ]);
      setMetrics(m);
      setActivities(a);
      setRecentOrders(o.orders.slice(0, 3));
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#14302b]">
              {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Overview Dashboard'}
            </h2>
            {user?.role && (
              <span className="rounded-md bg-[#e4f0ed] px-2 py-0.5 text-[10px] font-bold text-[#0f6b5c]">
                {user.role}
              </span>
            )}
          </div>
          <p className="text-xs text-[#6b7f7a]">
            {user?.storeName || 'Specialty Roasters'} &bull; Store fulfillment health, revenue, and live customer activity.
          </p>
        </div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f6b5c] hover:underline"
        >
          <span>View all orders</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Top 2 Big Metric Cards using shadcn Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6b7f7a]">Revenue this month</span>
            <span className="rounded-md bg-[#d9f0e3] p-1.5 text-[#2e8b57]">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#14302b]">
            ${metrics ? metrics.monthlyRevenue.toLocaleString() : '48,920'}
          </p>
          <span className="mt-1 inline-block text-[11px] text-[#2e8b57]">
            +14.2% from previous month
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6b7f7a]">New customers</span>
            <span className="rounded-md bg-[#e4f0ed] p-1.5 text-[#0f6b5c]">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#14302b]">
            {metrics ? metrics.newCustomersCount : 146}
          </p>
          <span className="mt-1 inline-block text-[11px] text-[#2e8b57]">
            +28 new accounts this week
          </span>
        </Card>
      </div>

      {/* Recent Activity Section in shadcn Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#6b7f7a]">
            Recent Activity
          </CardTitle>
          <span className="text-[11px] text-[#6b7f7a]">Auto-updated</span>
        </CardHeader>

        <CardContent>
          <div className="divide-y divide-[#dde4e2]">
            {activities.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-2 w-2 rounded-full ${item.type === 'inventory'
                        ? 'bg-[#c8442f]'
                        : item.type === 'order'
                          ? 'bg-[#0f6b5c]'
                          : 'bg-[#f2a33a]'
                      }`}
                  />
                  <span className="text-[#14302b]">{item.text}</span>
                </div>
                <em className="text-[11px] not-italic text-[#6b7f7a]">{item.timeAgo}</em>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Recent Orders Preview in shadcn Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#6b7f7a]">
            Latest Orders
          </CardTitle>
          <Link to="/orders" className="text-xs font-semibold text-[#0f6b5c] hover:underline">
            Manage &rarr;
          </Link>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#dde4e2] text-[#6b7f7a]">
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde4e2]">
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5 font-semibold text-[#14302b]">{o.id}</td>
                    <td className="py-2.5 text-[#14302b]">{o.customerName}</td>
                    <td className="py-2.5 font-medium text-[#14302b]">${o.total.toFixed(2)}</td>
                    <td className="py-2.5 text-right">
                      <StatusBadge status={o.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
