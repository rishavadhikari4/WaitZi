import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import useAuth from '../../hooks/useAuth';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function greetingFor(hour) {
  if (hour < 5) return 'Still open';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Still open';
}

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const now = useClock();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleName = user?.role?.name;

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-gray-200/80">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-md hover:bg-gray-100 lg:hidden shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
          >
            <Icon icon="mdi:menu" className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden md:flex items-baseline gap-2 min-w-0">
            <span className="text-sm font-medium text-gray-700 truncate">
              {greetingFor(now.getHours())}{user?.firstName ? `, ${user.firstName}` : ''}
            </span>
            <span className="text-gray-300">&middot;</span>
            <time className="text-sm text-gray-400 tabular-nums">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
        </div>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-white">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium text-gray-800">
                {user?.firstName} {user?.lastName}
              </span>
              {roleName && <span className="text-[11px] text-gray-400 capitalize">{roleName}</span>}
            </span>
            <Icon icon="mdi:chevron-down" className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-900/5 py-1.5 overflow-hidden">
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Icon icon="mdi:account-circle-outline" className="w-4 h-4 text-gray-400" /> Profile
              </button>
              <button
                onClick={() => { navigate('/change-password'); setDropdownOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Icon icon="mdi:lock-outline" className="w-4 h-4 text-gray-400" /> Change Password
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Icon icon="mdi:logout" className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
