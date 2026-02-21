import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Grid3X3,
  CreditCard,
  BarChart3,
  Users,
  QrCode,
  UserCircle,
  Shield,
  X,
  ChevronDown,
} from 'lucide-react';
const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Orders',
    items: [
      { label: 'All Orders', path: '/orders', icon: ShoppingBag },
      { label: 'Kitchen Queue', path: '/kitchen', icon: ChefHat },
    ],
  },
  {
    label: 'Menu',
    items: [
      { label: 'Menu Items', path: '/menu', icon: UtensilsCrossed },
      { label: 'Categories', path: '/categories', icon: Grid3X3 },
    ],
  },
  {
    label: 'Tables',
    items: [
      { label: 'All Tables', path: '/tables', icon: Grid3X3 },
      { label: 'QR Codes', path: '/tables/qr', icon: QrCode },
    ],
  },
  {
    label: 'Payments',
    items: [
      { label: 'All Payments', path: '/payments', icon: CreditCard },
      { label: 'Daily Sales', path: '/payments/daily-sales', icon: BarChart3 },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Staff', path: '/users', icon: Users },
      { label: 'Roles', path: '/roles', icon: Shield },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Profile', path: '/profile', icon: UserCircle },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebar-collapsed') || '{}');
    } catch { return {}; }
  });

  const toggleGroup = (label) => {
    const next = { ...collapsed, [label]: !collapsed[label] };
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(next));
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-900">WaitZi</h1>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 lg:hidden">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider">Logged in as</p>
          <p className="text-sm font-medium text-slate-700 capitalize">Admin</p>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-113px)]">
          {navGroups.map((group) => {
            const isCollapsed = collapsed[group.label];
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
                >
                  {group.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
                {!isCollapsed && group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
