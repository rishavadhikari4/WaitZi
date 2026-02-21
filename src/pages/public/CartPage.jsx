import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag, StickyNote } from 'lucide-react';
import { createPublicOrder } from '../../api/orders';
import useCart from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';

export default function CartPage() {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const cart = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!cart.customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!cart.items.length) {
      toast.error('Your cart is empty');
      return;
    }
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
      await createPublicOrder(orderData);
      cart.clearCart();
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
        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Continue browsing
      </Link>

      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Your Cart</h2>
          <p className="text-xs text-slate-400">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-14">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-400">Your cart is empty</p>
          <Link to={`/order/table/${tableNumber}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block">
            Browse menu
          </Link>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {cart.items.map((item) => (
            <div key={item.menuItem._id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-slate-800">{item.menuItem.name}</h3>
                  <p className="text-xs text-indigo-500 font-medium mt-0.5">{formatCurrency(item.menuItem.price)} each</p>
                </div>
                <button
                  onClick={() => cart.removeItem(item.menuItem._id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => cart.updateQuantity(item.menuItem._id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border-2 border-slate-200 text-indigo-600 flex items-center justify-center hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-indigo-700 w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.menuItem._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-bold text-slate-800">{formatCurrency(item.menuItem.price * item.quantity)}</p>
              </div>
              <div className="relative mt-3">
                <StickyNote className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => cart.updateNotes(item.menuItem._id, e.target.value)}
                  placeholder="Add note (e.g. no onions)"
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Total</span>
            <span className="text-xl font-bold text-indigo-600">{formatCurrency(cart.total)}</span>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Your Name</label>
            <input
              type="text"
              value={cart.customerName}
              onChange={(e) => cart.setCustomerName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || !cart.items.length}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-lg font-semibold shadow-sm transition-all active:scale-[0.98]"
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
