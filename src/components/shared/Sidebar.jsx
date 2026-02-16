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
  Flame,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const navGroups = [
  {
    label: 'Overview',
    items: [
      // Dashboard is accessible to ALL roles - each sees their own view
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: null },
      { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3, roles: ['admin', 'manager'] },
      { label: 'Real-Time', path: '/dashboard/real-time', icon: Activity, roles: null },
    ],
  },
  {
    label: 'Orders',
    items: [
      { label: 'All Orders', path: '/orders', icon: ShoppingBag, roles: null },
      { label: 'Kitchen Queue', path: '/kitchen', icon: ChefHat, roles: ['admin', 'manager', 'chef', 'kitchen_staff'] },
    ],
  },
  {
    label: 'Menu',
    items: [
      { label: 'Menu Items', path: '/menu', icon: UtensilsCrossed, roles: ['admin', 'manager'] },
      { label: 'Categories', path: '/categories', icon: Grid3X3, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Tables',
    items: [
      { label: 'All Tables', path: '/tables', icon: Grid3X3, roles: ['admin', 'manager', 'waiter'] },
      { label: 'QR Codes', path: '/tables/qr', icon: QrCode, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Payments',
    items: [
      { label: 'All Payments', path: '/payments', icon: CreditCard, roles: ['admin', 'manager', 'waiter'] },
      { label: 'Daily Sales', path: '/payments/daily-sales', icon: BarChart3, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Staff', path: '/users', icon: Users, roles: ['admin', 'manager'] },
      { label: 'Roles', path: '/roles', icon: Shield, roles: ['admin'] },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Profile', path: '/profile', icon: UserCircle, roles: null },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const userRole = user?.role?.name;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-[#E5E5E5] transform transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
          <h1 className="text-xl font-bold">WaitZi</h1>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role indicator */}
        <div className="px-4 py-2 border-b border-[#E5E5E5] bg-gray-50">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="text-sm font-medium capitalize">{userRole || 'Staff'}</p>
        </div>

        <nav className="p-3 space-y-4 overflow-y-auto h-[calc(100%-113px)]">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.roles || item.roles.includes(userRole)
            );
            if (!visibleItems.length) return null;
            return (
              <div key={group.label}>
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {group.label}
                </p>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
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
