import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, Search, MapPin } from 'lucide-react';
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
  }, [tableNumber, tableId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size="lg" className="text-blue-500" />
        <p className="text-sm text-blue-400">Loading menu...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-gray-500">Could not load menu data.</p>
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
    <div className="pb-28">
      {/* Table badge */}
      <div className="flex items-center justify-center mb-5">
        <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium">
          <MapPin className="w-3.5 h-3.5" />
          Table {tableNumber}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm placeholder:text-blue-300 shadow-sm"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          All
        </button>
        {(data.categories || []).map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition-all ${
              activeCategory === cat._id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-blue-300" />
          </div>
          <p className="text-gray-400 text-sm">No items found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const qty = getCartQty(item._id);
            return (
              <div
                key={item._id}
                className={`flex gap-3 bg-white rounded-2xl p-3 shadow-sm transition-all ${
                  qty > 0 ? 'border-2 border-blue-400 shadow-blue-100' : 'border border-blue-100'
                }`}
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-800">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  <p className="font-bold text-blue-600 text-sm mt-1.5">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-end flex-shrink-0">
                  {qty === 0 ? (
                    <button
                      onClick={() => cart.addItem(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-blue-200"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cart.updateQuantity(item._id, qty - 1)}
                        className="w-8 h-8 rounded-full border-2 border-blue-200 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-blue-700 w-5 text-center">{qty}</span>
                      <button
                        onClick={() => cart.updateQuantity(item._id, qty + 1)}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating cart bar */}
      {cart.itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
          <button
            onClick={() => navigate(`/order/table/${tableNumber}/cart`)}
            className="w-full max-w-lg mx-auto block bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-300/40 transition-all active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2.5">
              <span className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2.5 w-4.5 h-4.5 bg-white text-blue-600 text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {cart.itemCount}
                </span>
              </span>
              View Cart - {formatCurrency(cart.total)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
