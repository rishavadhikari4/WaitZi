import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrder, completeOrder } from '../../api/orders';
import { processPayment } from '../../api/payments';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/shared/PageHeader';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { SkeletonDetail, SkeletonForm } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../utils/constants';

export default function ProcessPaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({ paymentMethod: 'Cash', transactionId: '' });

  useEffect(() => {
    getOrder(orderId)
      .then((res) => setOrder(res.data))
      .catch((err) => toast.error(err.message || 'Failed to load order'))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const data = {
        orderId,
        paymentMethod: form.paymentMethod,
        amount: order.finalAmount || order.totalAmount,
        handledBy: user?._id,
      };
      if (form.transactionId) data.transactionId = form.transactionId;
      const res = await processPayment(data);
      await completeOrder(orderId).catch(() => {});
      toast.success('Payment processed');
      navigate(`/payments/${res.data?._id || ''}`);
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-6">
        <SkeletonDetail rows={4} />
        <SkeletonForm fields={2} />
      </div>
    );
  }
  if (!order) return <p className="text-center py-20 text-gray-500">Order not found</p>;

  if (order.isPrepaid && order.status !== 'Paid') {
    return (
      <div className="max-w-lg">
        <PageHeader title="Process Payment" />
        <div className="card text-center py-10">
          <p className="font-semibold text-emerald-700">This order was already paid online at checkout.</p>
          <p className="text-sm text-gray-500 mt-1">No further payment is needed - it'll finish automatically once served.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Process Payment" />

      <div className="card mb-6">
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm font-mono">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="font-sans shrink-0">{item.quantity}× {item.menuItem?.name || 'Item'}</span>
              <span className="leader" />
              <span className="shrink-0">{formatCurrency(item.subtotal || item.menuItem?.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-dashed border-gray-200 pt-2 mt-2">
            <div className="flex justify-between"><span className="font-sans">Subtotal</span><span>{formatCurrency(order.totalAmount)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-red-600"><span className="font-sans">Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
            <div className="flex justify-between font-bold text-lg mt-1"><span className="font-sans">Total</span><span>{formatCurrency(order.finalAmount || order.totalAmount)}</span></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <Select
          label="Payment Method"
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
        />
        {form.paymentMethod !== 'Cash' && (
          <Input
            label="Transaction ID"
            value={form.transactionId}
            onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
            placeholder="Enter transaction ID"
          />
        )}
        <Button type="submit" isLoading={isProcessing} className="w-full">
          Pay {formatCurrency(order.finalAmount || order.totalAmount)}
        </Button>
      </form>
    </div>
  );
}
