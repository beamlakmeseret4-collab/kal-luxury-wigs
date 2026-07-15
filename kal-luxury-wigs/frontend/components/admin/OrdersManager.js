'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, MapPin, Truck, Download } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Select, Input, Field } from '@/components/ui/FormFields';
import { PageSpinner, EmptyState, Badge } from '@/components/ui/Feedback';
import OrderMap from './OrderMap';
import {
  useAdminOrders, useConfirmPayment, useUpdateOrderStatus, useAssignDriver, usePublicConfig,
} from '@/lib/hooks';
import { useToastStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusTone = {
  pending: 'outline', confirmed: 'gold', processing: 'gold', shipped: 'ink', delivered: 'ink', cancelled: 'garnet',
};
const paymentTone = {
  pending: 'outline', pending_verification: 'garnet', paid: 'gold', failed: 'garnet', refunded: 'outline',
};

export default function OrdersManager() {
  const [filters, setFilters] = useState({ orderStatus: '', paymentMethod: '', deliveryMethod: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data, isLoading } = useAdminOrders(filters);
  const { data: config } = usePublicConfig();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Orders</h1>
        <a href={`${api.base}/api/orders/export.csv`} target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm" icon={Download}>Export CSV</Button>
        </a>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <Select value={filters.orderStatus} onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })} className="w-auto">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filters.paymentMethod} onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })} className="w-auto">
          <option value="">All payment methods</option>
          <option value="telebirr">TeleBirr</option>
          <option value="cbe">CBE</option>
          <option value="cash">Cash</option>
        </Select>
        <Select value={filters.deliveryMethod} onChange={(e) => setFilters({ ...filters, deliveryMethod: e.target.value })} className="w-auto">
          <option value="">Delivery & Pickup</option>
          <option value="delivery">Delivery only</option>
          <option value="pickup">Pickup only</option>
        </Select>
      </div>

      {isLoading ? (
        <PageSpinner label="Loading orders…" />
      ) : !data?.orders?.length ? (
        <EmptyState title="No orders match those filters" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-charcoal/50">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr
                  key={o._id}
                  onClick={() => setSelectedOrder(o)}
                  className="cursor-pointer border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]"
                >
                  <td className="px-4 py-3 font-medium text-ink">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-charcoal/70">{o.customer.name}<br /><span className="text-xs text-charcoal/40">{o.customer.phone}</span></td>
                  <td className="px-4 py-3 text-charcoal/70">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3"><Badge tone={paymentTone[o.paymentStatus]}>{o.paymentStatus.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-3"><Badge tone={statusTone[o.orderStatus]}>{o.orderStatus}</Badge></td>
                  <td className="px-4 py-3 text-xs text-charcoal/50">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        variant="center"
        widthClass="sm:max-w-2xl"
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : ''}
      >
        {selectedOrder && (
          <OrderDetail order={selectedOrder} mapsApiKey={config?.googleMapsApiKey} onClose={() => setSelectedOrder(null)} />
        )}
      </Modal>
    </div>
  );
}

function OrderDetail({ order, mapsApiKey, onClose }) {
  const confirmPayment = useConfirmPayment();
  const updateStatus = useUpdateOrderStatus();
  const assignDriver = useAssignDriver();
  const showToast = useToastStore((s) => s.showToast);
  const [driver, setDriver] = useState({ name: order.assignedDriver?.name || '', phone: order.assignedDriver?.phone || '' });

  const handleConfirmPayment = async () => {
    try {
      await confirmPayment.mutateAsync(order._id);
      showToast('Payment confirmed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (orderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId: order._id, orderStatus });
      showToast(`Status updated to ${orderStatus}`);
      if (orderStatus === 'cancelled') onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    try {
      await assignDriver.mutateAsync({ orderId: order._id, ...driver });
      showToast('Driver assigned');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-charcoal/40">Customer</p>
          <p className="text-sm font-medium text-ink">{order.customer.name}</p>
          <p className="text-sm text-charcoal/60">{order.customer.phone}</p>
          {order.customer.email && <p className="text-sm text-charcoal/60">{order.customer.email}</p>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-charcoal/40">Fulfillment</p>
          {order.deliveryMethod === 'delivery' ? (
            <>
              <p className="flex items-center gap-1 text-sm text-ink"><Truck className="h-3.5 w-3.5" /> Delivery</p>
              <p className="mt-1 text-sm text-charcoal/60">{order.deliveryAddress?.fullAddress}</p>
              {order.deliveryAddress?.notes && <p className="text-xs italic text-charcoal/50">"{order.deliveryAddress.notes}"</p>}
            </>
          ) : (
            <p className="flex items-center gap-1 text-sm text-ink"><MapPin className="h-3.5 w-3.5" /> Pickup in-store</p>
          )}
        </div>
      </div>

      {order.deliveryMethod === 'delivery' && order.deliveryAddress?.coordinates?.lat && (
        <OrderMap lat={order.deliveryAddress.coordinates.lat} lng={order.deliveryAddress.coordinates.lng} apiKey={mapsApiKey} />
      )}

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-charcoal/40">Items</p>
        <ul className="divide-y divide-ink/10 rounded-xl border border-ink/10">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span>{item.qty}× {item.name} {item.size && `(${item.size})`} {item.color && `· ${item.color}`}</span>
              <span className="text-charcoal/60">{formatPrice(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between text-sm font-medium text-ink">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-charcoal/40">Payment — {order.paymentMethod.toUpperCase()}</p>
        {order.paymentProof?.imageUrl && (
          <a href={order.paymentProof.imageUrl} target="_blank" rel="noreferrer" className="relative block h-40 w-32 overflow-hidden rounded-lg border border-ink/10">
            <Image src={order.paymentProof.imageUrl} alt="Payment proof" fill sizes="128px" className="object-cover" />
          </a>
        )}
        {order.paymentProof && (
          <p className="mt-2 text-xs text-charcoal/50">Paid by: {order.paymentProof.payerName} ({order.paymentProof.payerPhone})</p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <Badge tone={paymentToneFor(order.paymentStatus)}>{order.paymentStatus.replace('_', ' ')}</Badge>
          {order.paymentStatus === 'pending_verification' && (
            <Button size="sm" variant="gold" icon={CheckCircle2} loading={confirmPayment.isPending} onClick={handleConfirmPayment}>
              Confirm Payment
            </Button>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-charcoal/40">Order Status</p>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={updateStatus.isPending}
              className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                order.orderStatus === s ? 'border-ink bg-ink text-cream' : 'border-ink/15 text-charcoal/60 hover:border-ink/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {order.deliveryMethod === 'delivery' && (
        <form onSubmit={handleAssignDriver} className="rounded-xl border border-dashed border-ink/20 p-4">
          <p className="mb-3 text-xs uppercase tracking-wide text-charcoal/40">Assign Driver</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Field label="Driver name" className="flex-1">
              <Input value={driver.name} onChange={(e) => setDriver({ ...driver, name: e.target.value })} />
            </Field>
            <Field label="Driver phone" className="flex-1">
              <Input value={driver.phone} onChange={(e) => setDriver({ ...driver, phone: e.target.value })} />
            </Field>
          </div>
          <Button type="submit" size="sm" variant="outline" className="mt-3" loading={assignDriver.isPending}>Save Driver</Button>
        </form>
      )}
    </div>
  );
}

function paymentToneFor(status) {
  return { pending: 'outline', pending_verification: 'garnet', paid: 'gold', failed: 'garnet', refunded: 'outline' }[status] || 'outline';
}
