'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingBag, Clock, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

function StatCard({ icon: Icon, label, value, tone = 'ink' }) {
  const tones = { ink: 'bg-ink text-cream', gold: 'bg-gold text-ink', garnet: 'bg-garnet text-cream' };
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-2xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-charcoal/50">{label}</p>
    </div>
  );
}

export default function DashboardStats({ stats }) {
  const chartData = (stats.revenueByDay || []).map((d) => ({ date: d._id.slice(5), revenue: d.revenue }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Revenue (paid orders)" value={formatPrice(stats.totalRevenue)} tone="gold" />
        <StatCard icon={ShoppingBag} label="Paid Orders" value={stats.paidOrderCount} />
        <StatCard icon={Clock} label="Awaiting Payment Check" value={stats.pendingVerificationCount} tone="garnet" />
        <StatCard icon={Package} label="Active Products" value={stats.productCount} />
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <h3 className="mb-4 font-display text-base text-ink">Revenue — Last 30 Days</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#AD8544" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#AD8544" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#24201a1a" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8a8478' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8a8478' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => [formatPrice(v), 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #eee' }} />
              <Area type="monotone" dataKey="revenue" stroke="#AD8544" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <h3 className="mb-4 font-display text-base text-ink">Top Products</h3>
          <ul className="divide-y divide-ink/10">
            {(stats.topProducts || []).map((p) => (
              <li key={p._id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-charcoal">{p._id}</span>
                <span className="text-charcoal/50">{p.unitsSold} sold · {formatPrice(p.revenue)}</span>
              </li>
            ))}
            {(!stats.topProducts || stats.topProducts.length === 0) && (
              <p className="py-3 text-sm text-charcoal/40">No sales yet.</p>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <h3 className="mb-4 font-display text-base text-ink">Orders by Status</h3>
          <ul className="space-y-2.5">
            {Object.entries(stats.ordersByStatus || {}).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-charcoal">{status}</span>
                <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-charcoal/70">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
