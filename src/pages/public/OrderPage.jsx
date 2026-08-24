import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getOrderingPageData, getOrderingPageByNumber } from '../../api/qr';
import useCart from '../../hooks/useCart';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/formatters';

export default function OrderPage() {
  const { tableNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');
  const cart = useCart();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = tableId
          ? await getOrderingPageData(tableId)
          : await getOrderingPageByNumber(tableNumber);
        const resData = res.data;

        // eslint-disable-next-line no-unused-vars
        const categories = (resData.menu || []).map(({ items, ...cat }) => cat);
        const menuItems = (resData.menu || []).flatMap((cat) =>
          (cat.items || []).map((item) => ({
            ...item,
            category: item.category || cat._id,
          }))
        );

        setData({ ...resData, categories, menuItems });
        cart.setTableInfo(resData.table._id || tableId, Number(tableNumber));
      } catch (err) {
        toast.error(err.message || 'Failed to load menu');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableNumber, tableId]);

  if (isLoading) {
    return (
      <div className="pb-32">
        <Skeleton className="h-32 w-full rounded-none -mx-4 -mt-4 mb-5" />
        <Skeleton className="h-10 w-full rounded-xl mb-4" />
        <div className="flex gap-2 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:map-marker-outline" className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">Could not load menu</p>
        <p className="text-sm text-gray-400 mt-1">Please scan the QR code again.</p>
      </div>
    );
  }

  const filteredItems = (data.menuItems || []).filter((item) => {
    if (item.availabilityStatus !== 'Available') return false;
    if (activeCategory !== 'all' && (item.category?._id || item.category) !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getCartQty = (menuItemId) => {
    const item = cart.items.find((i) => i.menuItem._id === menuItemId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="pb-32">
      {/* Header banner */}
      <div className="bg-sidebar -mx-4 -mt-4 px-4 pt-8 pb-7 mb-5 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-full opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Icon icon="mdi:silverware-fork-knife" className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400/80 text-[11px] font-semibold uppercase tracking-[0.2em]">Table Ordering</span>
          </div>
          <h1 className="text-gray-50 font-bold text-xl tracking-tight">
            {data.restaurant?.name || 'Our Menu'}
          </h1>
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-gray-100 px-3 py-1 rounded-full text-xs font-mono font-medium mt-2.5">
            <Icon icon="mdi:map-marker-outline" className="w-3.5 h-3.5 text-blue-400" />
            TABLE {tableNumber}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Icon icon="mdi:magnify" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder:text-gray-400 shadow-sm"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap font-semibold transition-all flex-shrink-0 border-b-2 ${
            activeCategory === 'all'
              ? 'bg-blue-50 text-blue-800 border-blue-500'
              : 'bg-white text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {(data.categories || []).map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap font-semibold transition-all flex-shrink-0 border-b-2 ${
              activeCategory === cat._id
                ? 'bg-blue-50 text-blue-800 border-blue-500'
                : 'bg-white text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon icon="mdi:magnify" className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No items found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different category or search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const qty = getCartQty(item._id);
            return (
              <div
                key={item._id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm transition-all ${
                  qty > 0
                    ? 'ring-2 ring-blue-500 shadow-blue-100'
                    : 'border border-gray-200 hover:border-gray-300 hover:shadow'
                }`}
              >
                {/* Mobile: row layout | sm+: column layout */}
                <div className="flex sm:flex-col h-full">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 sm:w-full sm:h-40 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-full sm:h-40 bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl sm:text-4xl">🍽️</span>
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2.5 gap-2">
                      <p className="font-mono font-bold text-gray-800 text-base">
                        {formatCurrency(item.price)}
                      </p>

                      {qty === 0 ? (
                        <button
                          onClick={() => cart.addItem(item)}
                          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex-shrink-0"
                        >
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => cart.updateQuantity(item._id, qty - 1)}
                            className="w-7 h-7 rounded-lg border-2 border-gray-200 text-blue-700 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
                          >
                            <Icon icon="mdi:minus" className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-mono font-bold text-blue-800 w-5 text-center tabular-nums">
                            {qty}
                          </span>
                          <button
                            onClick={() => cart.updateQuantity(item._id, qty + 1)}
                            className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                          >
                            <Icon icon="mdi:plus" className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating cart bar */}
      {cart.itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-10 bg-gradient-to-t from-app via-app/95 to-transparent pointer-events-none">
          <button
            onClick={() => navigate(`/order/table/${tableNumber}/cart`)}
            className="w-full max-w-lg sm:max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-between bg-sidebar hover:bg-gray-900 active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-semibold shadow-xl shadow-gray-900/20 transition-all pointer-events-auto"
          >
            <span className="flex items-center gap-2">
              <span className="relative">
                <Icon icon="mdi:cart-outline" className="w-5 h-5 text-blue-400" />
                <span className="absolute -top-2 -right-2.5 bg-blue-500 text-gray-900 text-[10px] font-bold rounded-full flex items-center justify-center leading-none w-4 h-4">
                  {cart.itemCount}
                </span>
              </span>
              <span className="ml-1">View Cart</span>
            </span>
            <span className="font-mono font-bold">{formatCurrency(cart.total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
