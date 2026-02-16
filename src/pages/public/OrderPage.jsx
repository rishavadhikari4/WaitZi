import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, Search } from 'lucide-react';
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

        // Backend returns menu as array of categories with nested items:
        // [{ _id, name, items: [menuItem, ...] }, ...]
        // Flatten into separate categories and menuItems arrays
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
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-center py-20 text-gray-500">Could not load menu data.</p>;
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
    <div className="pb-24">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">Table {tableNumber}</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu..."
          className="input pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
            activeCategory === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          All
        </button>
        {(data.categories || []).map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
              activeCategory === cat._id ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No items found</p>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const qty = getCartQty(item._id);
            return (
              <div key={item._id} className="flex gap-3 border border-[#E5E5E5] rounded-xl p-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  <p className="font-semibold text-sm mt-1">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-end flex-shrink-0">
                  {qty === 0 ? (
                    <button
                      onClick={() => cart.addItem(item)}
                      className="bg-black text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cart.updateQuantity(item._id, qty - 1)}
                        className="w-7 h-7 rounded-full border border-[#E5E5E5] flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{qty}</span>
                      <button
                        onClick={() => cart.updateQuantity(item._id, qty + 1)}
                        className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center"
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

      {cart.itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] p-4 shadow-lg">
          <button
            onClick={() => navigate(`/order/table/${tableNumber}/cart`)}
            className="w-full bg-black text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            View Cart ({cart.itemCount}) - {formatCurrency(cart.total)}
          </button>
        </div>
      )}
    </div>
  );
}
