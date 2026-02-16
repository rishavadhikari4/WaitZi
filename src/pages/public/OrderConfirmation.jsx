import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ClipboardList, UtensilsCrossed } from 'lucide-react';

export default function OrderConfirmation() {
  const { tableNumber } = useParams();

  return (
    <div className="text-center py-10 space-y-6">
      {/* Success animation circle */}
      <div className="relative inline-block">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-[pulse_2s_ease-in-out_1]">
          <CheckCircle className="w-14 h-14 text-blue-600" />
        </div>
        <div className="absolute inset-0 w-24 h-24 bg-blue-200/50 rounded-full mx-auto animate-ping" style={{ animationIterationCount: 2 }} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800">Order Placed!</h2>
        <p className="text-gray-500 mt-2">Your order has been sent to the kitchen.</p>
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium mt-3">
          Table {tableNumber}
        </div>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-3 max-w-xs mx-auto">
        <p className="text-xs text-gray-400">What would you like to do next?</p>
        <Link to={`/order/table/${tableNumber}/track`}>
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-xl font-semibold shadow-md shadow-blue-300/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <ClipboardList className="w-4.5 h-4.5" />
            Track Your Order
          </button>
        </Link>
        <Link to={`/order/table/${tableNumber}`}>
          <button className="w-full mt-2 bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <UtensilsCrossed className="w-4.5 h-4.5" />
            Order More
          </button>
        </Link>
      </div>
    </div>
  );
}
