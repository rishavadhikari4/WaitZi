import { useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

import useCart from '../../hooks/useCart';

export default function OrderConfirmation() {
  const { qrToken = '' } = useParams();
  const { tableNumber } = useCart();

  return (
    <div className="text-center py-10 space-y-6">
      {/* Success animation circle */}
      <div className="relative inline-block">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-[pulse_2s_ease-in-out_1]">
          <Icon icon="mdi:check-circle" className="w-14 h-14 text-emerald-600" />
        </div>
        <div className="absolute inset-0 w-24 h-24 bg-emerald-200/50 rounded-full mx-auto animate-ping" style={{ animationIterationCount: 2 }} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800">Order Sent to Kitchen</h2>
        <p className="text-gray-500 mt-2">We've got it from here.</p>
        {tableNumber && (
          <div className="inline-flex items-center gap-1.5 bg-sidebar text-gray-100 px-4 py-1.5 rounded-full text-sm font-mono font-medium mt-3">
            <Icon icon="mdi:map-marker-outline" className="w-3.5 h-3.5 text-blue-400" /> TABLE {tableNumber}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 border-t-0 rounded-2xl p-5 shadow-sm space-y-3 max-w-xs mx-auto relative">
        <div className="absolute -top-px left-3 right-3 border-t-2 border-dashed border-gray-200" />
        <p className="text-xs text-gray-400 pt-1">What would you like to do next?</p>
        <Link to={`/t/${qrToken}/track`}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <Icon icon="mdi:clipboard-list-outline" className="w-4.5 h-4.5" />
            Track Your Order
          </button>
        </Link>
        <Link to={`/t/${qrToken}`}>
          <button className="w-full mt-2 bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <Icon icon="mdi:silverware-fork-knife" className="w-4.5 h-4.5" />
            Order More
          </button>
        </Link>
      </div>
    </div>
  );
}
