import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPayment, processRefund } from '../../api/payments';
import PageHeader from '../../components/shared/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { SkeletonDetail } from '../../components/ui/Skeleton';
import useAuth from '../../hooks/useAuth';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHOD_COLORS } from '../../utils/constants';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefund, setShowRefund] = useState(false);
  const [refundData, setRefundData] = useState({ amount: '', reason: '' });
  const [isRefunding, setIsRefunding] = useState(false);

  const fetchPayment = useCallback(async () => {
    try {
      const res = await getPayment(id);
      setPayment(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load payment');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPayment(); }, [fetchPayment]);

  const handleRefund = async () => {
    setIsRefunding(true);
    try {
      await processRefund(id, { refundAmount: Number(refundData.amount), reason: refundData.reason, handledBy: user?._id });
      toast.success('Refund processed');
      setShowRefund(false);
      fetchPayment();
    } catch (err) {
      toast.error(err.message || 'Refund failed');
    } finally {
      setIsRefunding(false);
    }
  };

  if (isLoading) return <div className="max-w-2xl"><SkeletonDetail rows={7} /></div>;
  if (!payment) return <p className="text-center py-20 text-gray-500">Payment not found</p>;

  const canRefund = user?.role?.name === 'admin' && payment.paymentStatus === 'Paid';

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={<>Payment <span className="font-mono">#{payment._id?.slice(-6)}</span></>}
        actions={canRefund && <Button variant="danger" onClick={() => { setRefundData({ amount: payment.amount, reason: '' }); setShowRefund(true); }}>Refund</Button>}
      />
      <div className="card space-y-1">
        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
          <span className="text-sm text-gray-500">Status</span>
          <Badge status={payment.paymentStatus} />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
          <span className="text-sm text-gray-500">Method</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_METHOD_COLORS[payment.paymentMethod]?.badge || 'bg-gray-100 text-gray-800'}`}>{payment.paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="font-mono font-bold text-base">{formatCurrency(payment.amount)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
          <span className="text-sm text-gray-500">Transaction ID</span>
          <span className="font-mono text-sm">{payment.transactionId || '-'}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
          <span className="text-sm text-gray-500">Order</span>
          <span className="font-mono text-sm">#{(payment.order?._id || payment.order)?.slice(-6)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
          <span className="text-sm text-gray-500">Time</span>
          <span className="font-mono text-xs text-gray-600">{payment.paymentTime ? formatDateTime(payment.paymentTime) : '-'}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-500">Handled By</span>
          <span className="text-sm font-medium">{payment.handledBy ? `${payment.handledBy.firstName} ${payment.handledBy.lastName}` : '-'}</span>
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
