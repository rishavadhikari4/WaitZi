import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo-dark.svg';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'mdi:view-dashboard-outline' },
    ],
  },
  {
    label: 'Orders',
    items: [
      { label: 'All Orders', path: '/orders', icon: 'mdi:shopping-outline' },
      { label: 'Kitchen Queue', path: '/kitchen', icon: 'mdi:chef-hat' },
    ],
  },
  {
    label: 'Menu',
    items: [
      { label: 'Menu Items', path: '/menu', icon: 'mdi:silverware-fork-knife' },
      { label: 'Categories', path: '/categories', icon: 'mdi:grid' },
    ],
  },
  {
    label: 'Tables',
    items: [
      { label: 'All Tables', path: '/tables', icon: 'mdi:grid' },
      { label: 'QR Codes', path: '/tables/qr', icon: 'mdi:qrcode' },
    ],
  },
  {
    label: 'Payments',
    items: [
      { label: 'All Payments', path: '/payments', icon: 'mdi:credit-card-outline' },
      { label: 'Daily Sales', path: '/payments/daily-sales', icon: 'mdi:chart-bar' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Staff', path: '/users', icon: 'mdi:account-group-outline' },
      { label: 'Roles', path: '/roles', icon: 'mdi:shield-outline' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Profile', path: '/profile', icon: 'mdi:account-circle-outline' },
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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar transform transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="WaitZi" className="w-8 h-8" />
            <h1 className="text-lg font-semibold text-gray-50">WaitZi</h1>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 lg:hidden">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-113px)]">
          {navGroups.map((group) => {
            const isCollapsed = collapsed[group.label];
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                >
                  {group.label}
                  <Icon icon="mdi:chevron-down" className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
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
                          ? 'bg-blue-500 text-white font-medium'
                          : 'text-gray-400 hover:bg-sidebar-hover hover:text-gray-50'
                      }`
                    }
                  >
                    <Icon icon={item.icon} className="w-4 h-4" />
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
