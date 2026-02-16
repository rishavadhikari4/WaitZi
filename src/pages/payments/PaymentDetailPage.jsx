import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPayment, processRefund } from '../../api/payments';
import PageHeader from '../../components/shared/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import useAuth from '../../hooks/useAuth';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefund, setShowRefund] = useState(false);
  const [refundData, setRefundData] = useState({ amount: '', reason: '' });
  const [isRefunding, setIsRefunding] = useState(false);

  const fetchPayment = async () => {
    try {
      const res = await getPayment(id);
      setPayment(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load payment');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPayment(); }, [id]);

  const handleRefund = async () => {
    setIsRefunding(true);
    try {
      await processRefund(id, { amount: Number(refundData.amount), reason: refundData.reason, refundedBy: user?._id });
      toast.success('Refund processed');
      setShowRefund(false);
      fetchPayment();
    } catch (err) {
      toast.error(err.message || 'Refund failed');
    } finally {
      setIsRefunding(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!payment) return <p className="text-center py-20 text-gray-500">Payment not found</p>;

  const canRefund = ['admin', 'manager'].includes(user?.role?.name) && payment.paymentStatus === 'Paid';

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Payment #${payment._id?.slice(-6)}`}
        actions={canRefund && <Button variant="danger" onClick={() => { setRefundData({ amount: payment.amount, reason: '' }); setShowRefund(true); }}>Refund</Button>}
      />
      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Status</span><div className="mt-1"><Badge status={payment.paymentStatus} /></div></div>
          <div><span className="text-gray-500">Method</span><p className="font-medium mt-1">{payment.paymentMethod}</p></div>
          <div><span className="text-gray-500">Amount</span><p className="font-medium mt-1">{formatCurrency(payment.amount)}</p></div>
          <div><span className="text-gray-500">Transaction ID</span><p className="font-medium mt-1">{payment.transactionId || '-'}</p></div>
          <div><span className="text-gray-500">Order</span><p className="font-medium mt-1">#{(payment.order?._id || payment.order)?.slice(-6)}</p></div>
          <div><span className="text-gray-500">Time</span><p className="font-medium mt-1">{payment.paymentTime ? formatDateTime(payment.paymentTime) : '-'}</p></div>
          <div><span className="text-gray-500">Handled By</span><p className="font-medium mt-1">{payment.handledBy ? `${payment.handledBy.firstName} ${payment.handledBy.lastName}` : '-'}</p></div>
        </div>
      </div>

      <Modal isOpen={showRefund} onClose={() => setShowRefund(false)} title="Process Refund" size="sm">
        <div className="space-y-4">
          <Input label="Refund Amount" type="number" step="0.01" value={refundData.amount} onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })} />
          <Input label="Reason" value={refundData.reason} onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })} placeholder="Reason for refund" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowRefund(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleRefund} isLoading={isRefunding}>Process Refund</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
