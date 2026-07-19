import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { createPublicOrder } from '../../api/orders';
import { initiateKhaltiPayment } from '../../api/payments';
import useCart from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';

export default function CartPage() {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [payNow, setPayNow] = useState(false);

  const handlePlaceOrder = async () => {
    const name = cart.customerName.trim();
    if (!name) { toast.error('Please enter your name'); return; }
    if (name.length < 2) { toast.error('Name must be at least 2 characters'); return; }
    if (!/^[a-zA-Z\s]+$/.test(name)) { toast.error('Name must contain only letters'); return; }
    if (!cart.items.length) { toast.error('Your cart is empty'); return; }
    setIsLoading(true);
    try {
      const orderData = {
        tableId: cart.tableId,
        customerName: cart.customerName,
        items: cart.items.map((item) => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          notes: item.notes || undefined,
        })),
      };
      const orderRes = await createPublicOrder(orderData);
      const newOrderId = orderRes.data?._id;
      cart.clearCart();

      if (payNow && newOrderId) {
        try {
          const payRes = await initiateKhaltiPayment(newOrderId);
          const paymentUrl = payRes.data?.payment_url;
          if (paymentUrl) {
            window.location.href = paymentUrl;
            return;
          }
          toast.error('Could not start Khalti payment, you can pay after your order is served instead.');
        } catch (payErr) {
          toast.error(payErr.message || 'Could not start Khalti payment, you can pay after your order is served instead.');
        }
      }

      navigate(`/order/table/${tableNumber}/confirm`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-6">
      <Link
        to={`/order/table/${tableNumber}`}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-5 transition-colors"
      >
        <Icon icon="mdi:arrow-left" className="w-4 h-4" /> Continue browsing
      </Link>

      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon icon="mdi:shopping-outline" className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
          <p className="text-xs text-gray-400">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-14">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="mdi:shopping-outline" className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-400">Your cart is empty</p>
          <Link to={`/order/table/${tableNumber}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
            Browse menu
          </Link>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {cart.items.map((item) => (
            <div key={item.menuItem._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-800">{item.menuItem.name}</h3>
                  <p className="text-xs text-blue-500 font-medium mt-0.5">{formatCurrency(item.menuItem.price)} each</p>
                </div>
                <button
                  onClick={() => cart.removeItem(item.menuItem._id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => cart.updateQuantity(item.menuItem._id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 text-blue-600 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Icon icon="mdi:minus" className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-blue-700 w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.menuItem._id, Math.min(item.quantity + 1, 20))}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Icon icon="mdi:plus" className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-bold text-gray-800">{formatCurrency(item.menuItem.price * item.quantity)}</p>
              </div>
              <div className="relative mt-3">
                <Icon icon="mdi:note-text-outline" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => cart.updateNotes(item.menuItem._id, e.target.value)}
                  placeholder="Add note (e.g. no onions)"
                  maxLength={200}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Total</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(cart.total)}</span>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Your Name</label>
            <input
              type="text"
              value={cart.customerName}
              onChange={(e) => cart.setCustomerName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">When would you like to pay?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayNow(false)}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 text-sm font-semibold transition-colors ${
                  !payNow ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon icon="mdi:cash" className="w-4 h-4" />
                Pay at Table
              </button>
              <button
                type="button"
                onClick={() => setPayNow(true)}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 text-sm font-semibold transition-colors ${
                  payNow ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon icon="mdi:wallet-outline" className="w-4 h-4" />
                Pay Now (Khalti)
              </button>
            </div>
            {payNow && (
              <p className="text-xs text-gray-400 pt-0.5">You'll be redirected to Khalti to complete payment right after placing your order.</p>
            )}
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || !cart.items.length}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-lg font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Placing Order...
              </span>
            ) : (
              `Place Order - ${formatCurrency(cart.total)}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
