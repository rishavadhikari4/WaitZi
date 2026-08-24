import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const resultConfig = {
  success: {
    icon: 'mdi:check-circle',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Payment Successful!',
    description: 'Your payment has been processed. Thank you for dining with us!',
  },
  failed: {
    icon: 'mdi:close-circle',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    title: 'Payment Failed',
    description: 'Your payment could not be processed. Please try again or pay with cash.',
  },
  error: {
    icon: 'mdi:alert',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Something Went Wrong',
    description: 'We could not verify your payment. Please contact a staff member.',
  },
};

export default function PaymentResult() {
  const { tableNumber } = useParams();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'error';
  const message = searchParams.get('message');

  const config = resultConfig[status] || resultConfig.error;

  return (
    <div className="text-center py-10 space-y-6">
      <div className="relative inline-block">
        <div className={`w-24 h-24 ${config.iconBg} rounded-full flex items-center justify-center mx-auto`}>
          <Icon icon={config.icon} className={`w-14 h-14 ${config.iconColor}`} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800">{config.title}</h2>
        <p className="text-gray-500 mt-2">{message || config.description}</p>
        {tableNumber && (
          <div className="inline-flex items-center gap-1.5 bg-sidebar text-gray-100 px-4 py-1.5 rounded-full text-sm font-mono font-medium mt-3">
            <Icon icon="mdi:map-marker-outline" className="w-3.5 h-3.5 text-blue-400" /> TABLE {tableNumber}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 border-t-0 rounded-2xl p-5 shadow-sm space-y-3 max-w-xs mx-auto relative">
        <div className="absolute -top-px left-3 right-3 border-t-2 border-dashed border-gray-200" />
        {status === 'success' ? (
          <>
            <p className="text-xs text-gray-400 pt-1">Your order has been paid.</p>
            {tableNumber && (
              <Link to={`/order/table/${tableNumber}`}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <Icon icon="mdi:silverware-fork-knife" className="w-4.5 h-4.5" />
                  Order Again
                </button>
              </Link>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400 pt-1">What would you like to do?</p>
            {tableNumber && (
              <>
                <Link to={`/order/table/${tableNumber}/track`}>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Icon icon="mdi:clipboard-list-outline" className="w-4.5 h-4.5" />
                    Back to Order
                  </button>
                </Link>
                <Link to={`/order/table/${tableNumber}`}>
                  <button className="w-full mt-2 bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                    <Icon icon="mdi:silverware-fork-knife" className="w-4.5 h-4.5" />
                    Order More
                  </button>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
