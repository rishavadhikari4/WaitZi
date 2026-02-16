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
import Spinner from '../../components/ui/Spinner';
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

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return <p className="text-center py-20 text-gray-500">Order not found</p>;

  return (
    <div className="max-w-lg">
      <PageHeader title="Process Payment" />

      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span>{item.quantity}x {item.menuItem?.name || 'Item'}</span>
              <span>{formatCurrency(item.subtotal || item.menuItem?.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-[#E5E5E5] pt-2 mt-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.totalAmount)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-red-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
            <div className="flex justify-between font-bold text-lg mt-1"><span>Total</span><span>{formatCurrency(order.finalAmount || order.totalAmount)}</span></div>
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
