import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, Search, MapPin, UtensilsCrossed } from 'lucide-react';
import { getOrderingPageData, getOrderingPageByNumber } from '../../api/qr';
import useCart from '../../hooks/useCart';
import Spinner from '../../components/ui/Spinner';
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-400">Loading menu...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Could not load menu</p>
        <p className="text-sm text-slate-400 mt-1">Please scan the QR code again.</p>
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
      <div className="bg-indigo-600 -mx-4 -mt-4 px-4 pt-8 pb-6 mb-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <UtensilsCrossed className="w-5 h-5 text-indigo-200" />
          <h1 className="text-white font-bold text-lg tracking-wide">
            {data.restaurant?.name || 'Our Menu'}
          </h1>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mt-1">
          <MapPin className="w-3.5 h-3.5" />
          Table {tableNumber}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all flex-shrink-0 ${
            activeCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          All
        </button>
        {(data.categories || []).map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all flex-shrink-0 ${
              activeCategory === cat._id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No items found</p>
          <p className="text-slate-400 text-sm mt-1">Try a different category or search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const qty = getCartQty(item._id);
            return (
              <div
                key={item._id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm transition-all ${
                  qty > 0
                    ? 'ring-2 ring-indigo-500 shadow-indigo-100'
                    : 'border border-slate-200 hover:border-slate-300 hover:shadow'
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
                    <div className="w-24 h-24 sm:w-full sm:h-40 bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl sm:text-4xl">🍽️</span>
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2.5 gap-2">
                      <p className="font-bold text-indigo-600 text-base">
                        {formatCurrency(item.price)}
                      </p>

                      {qty === 0 ? (
                        <button
                          onClick={() => cart.addItem(item)}
                          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex-shrink-0"
                        >
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => cart.updateQuantity(item._id, qty - 1)}
                            className="w-7 h-7 rounded-lg border-2 border-slate-200 text-indigo-600 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold text-indigo-700 w-5 text-center tabular-nums">
                            {qty}
                          </span>
                          <button
                            onClick={() => cart.updateQuantity(item._id, qty + 1)}
                            className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                          >
                            <Plus className="w-3 h-3" />
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
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-10 bg-gradient-to-t from-slate-100 via-slate-100/95 to-transparent pointer-events-none">
          <button
            onClick={() => navigate(`/order/table/${tableNumber}/cart`)}
            className="w-full max-w-lg mx-auto flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-semibold shadow-xl shadow-indigo-300/50 transition-all pointer-events-auto"
          >
            <span className="flex items-center gap-2">
              <span className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2.5 bg-white text-indigo-600 text-[10px] font-bold rounded-full flex items-center justify-center leading-none w-4 h-4">
                  {cart.itemCount}
                </span>
              </span>
              <span className="ml-1">View Cart</span>
            </span>
            <span className="font-bold">{formatCurrency(cart.total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
