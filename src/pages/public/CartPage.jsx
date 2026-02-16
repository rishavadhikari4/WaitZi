import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { createPublicOrder } from '../../api/orders';
import useCart from '../../hooks/useCart';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
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
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Continue browsing
      </Link>

      <h2 className="text-xl font-bold mb-4">Your Cart</h2>

      {cart.items.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Your cart is empty</p>
      ) : (
        <div className="space-y-3 mb-6">
          {cart.items.map((item) => (
            <div key={item.menuItem._id} className="border border-[#E5E5E5] rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.menuItem.name}</h3>
                  <p className="text-sm text-gray-500">{formatCurrency(item.menuItem.price)} each</p>
                </div>
                <button
                  onClick={() => cart.removeItem(item.menuItem._id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cart.updateQuantity(item.menuItem._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-[#E5E5E5] flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.menuItem._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-semibold text-sm">{formatCurrency(item.menuItem.price * item.quantity)}</p>
              </div>
              <input
                type="text"
                value={item.notes}
                onChange={(e) => cart.updateNotes(item.menuItem._id, e.target.value)}
                placeholder="Add note (e.g. no onions)"
                className="mt-2 w-full text-xs px-2 py-1.5 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-[#E5E5E5] pt-4 space-y-4">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatCurrency(cart.total)}</span>
        </div>
        <Input
          label="Your Name"
          value={cart.customerName}
          onChange={(e) => cart.setCustomerName(e.target.value)}
          placeholder="Enter your name"
          required
        />
        <Button
          onClick={handlePlaceOrder}
          isLoading={isLoading}
          disabled={!cart.items.length}
          className="w-full"
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}
