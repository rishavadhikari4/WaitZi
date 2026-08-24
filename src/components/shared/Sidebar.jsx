import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo-dark.svg';
import useAuth from '../../hooks/useAuth';

const manageRoles = ['admin', 'manager'];
const adminOnly = ['admin'];

// Items with no `roles` are visible to every staff role — matches the route
// tiers in routes/index.jsx, so the sidebar never links somewhere a role
// would just get bounced from.
const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'mdi:view-dashboard-outline' },
      { label: 'Live Board', path: '/dashboard/live', icon: 'mdi:television-play' },
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
    roles: manageRoles,
    items: [
      { label: 'Menu Items', path: '/menu', icon: 'mdi:silverware-fork-knife' },
      { label: 'Categories', path: '/categories', icon: 'mdi:grid' },
    ],
  },
  {
    label: 'Tables',
    items: [
      { label: 'All Tables', path: '/tables', icon: 'mdi:grid' },
      { label: 'QR Codes', path: '/tables/qr', icon: 'mdi:qrcode', roles: manageRoles },
    ],
  },
  {
    label: 'Payments',
    roles: manageRoles,
    items: [
      { label: 'All Payments', path: '/payments', icon: 'mdi:credit-card-outline' },
      { label: 'Daily Sales', path: '/payments/daily-sales', icon: 'mdi:chart-bar' },
    ],
  },
  {
    label: 'Management',
    roles: adminOnly,
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

export default function Sidebar({ isOpen, onClose, railCollapsed, onToggleRail }) {
  const { user } = useAuth();
  const role = user?.role?.name;

  const visibleGroups = navGroups
    .filter((group) => !group.roles || group.roles.includes(role))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  const [groupCollapsed, setGroupCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebar-collapsed') || '{}');
    } catch { return {}; }
  });

  const toggleGroup = (label) => {
    const next = { ...groupCollapsed, [label]: !groupCollapsed[label] };
    setGroupCollapsed(next);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(next));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar flex flex-col transition-[transform,width] duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${railCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 shrink-0 border-b border-white/[0.06] px-4">
          <div className={`flex items-center gap-2.5 min-w-0 ${railCollapsed ? 'lg:w-full lg:justify-center' : ''}`}>
            <img src={logo} alt="WaitZi" className="w-8 h-8 shrink-0" />
            <span className={`text-[15px] font-semibold tracking-tight text-gray-50 whitespace-nowrap ${railCollapsed ? 'lg:hidden' : ''}`}>
              WaitZi
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
          >
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {visibleGroups.map((group) => {
            const isGroupCollapsed = groupCollapsed[group.label];
            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`flex items-center gap-2 w-full mb-1 px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.12em] hover:text-gray-300 transition-colors focus:outline-none ${
                    railCollapsed ? 'lg:hidden' : ''
                  }`}
                >
                  <span className="shrink-0">{group.label}</span>
                  <span className="flex-1 border-b border-dotted border-white/10" />
                  <Icon
                    icon="mdi:chevron-down"
                    className={`w-3 h-3 shrink-0 transition-transform ${isGroupCollapsed ? '-rotate-90' : ''}`}
                  />
                </button>

                {(!isGroupCollapsed || railCollapsed) && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <div key={item.path} className="relative group/item">
                        <NavLink
                          to={item.path}
                          end
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg border-l-2 pl-2.5 pr-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 ${
                              railCollapsed ? 'lg:justify-center lg:pl-0 lg:pr-0 lg:border-l-0' : ''
                            } ${
                              isActive
                                ? 'border-blue-400 bg-white/[0.06] text-gray-50 font-medium'
                                : 'border-transparent text-gray-400 hover:bg-white/[0.04] hover:text-gray-100'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon
                                icon={item.icon}
                                className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-blue-400' : ''}`}
                              />
                              <span className={railCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                            </>
                          )}
                        </NavLink>
                        <span
                          className={`pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-gray-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover/item:opacity-100 z-50 hidden ${
                            railCollapsed ? 'lg:block' : ''
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button
          onClick={onToggleRail}
          aria-label={railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex items-center justify-center absolute top-8 -right-3 w-6 h-6 rounded-full bg-sidebar border border-white/10 text-gray-400 hover:text-gray-50 hover:border-white/20 shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
        >
          <Icon icon="mdi:chevron-left" className={`w-3.5 h-3.5 transition-transform ${railCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>
    </>
  );
}
