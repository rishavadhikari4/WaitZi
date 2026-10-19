import { useState, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import type { Toast } from 'react-hot-toast';
import Sidebar from '../components/shared/Sidebar';
import Header from '../components/shared/Header';
import useSocket from '../hooks/useSocket';
import type { OrderEventPayload } from '../types/api';

// Plays a two-note "ting ting" chime using the Web Audio API (no sound file needed)
function playTing() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const schedule = (freq: number, startAt: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
      gain.gain.setValueAtTime(0.45, ctx.currentTime + startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + duration);
    };
    schedule(880, 0, 0.5);    // first ting  — A5
    schedule(1108, 0.28, 0.6); // second ting — C#6
    setTimeout(() => void ctx.close(), 1200);
  } catch { /* ignore audio context errors */ }
}

function OrderToast({
  t,
  table,
  customer,
  items,
  onView,
}: {
  t: Toast;
  table: string | number;
  customer: string;
  items: number;
  onView: () => void;
}) {
  return (
    <div
      className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-start gap-3 bg-white border-l-4 border-blue-500 rounded-xl shadow-xl px-4 py-3 w-72 cursor-pointer`}
      onClick={onView}
    >
      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon icon="mdi:shopping-outline" className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">New Order!</p>
        <p className="text-xs text-gray-500 truncate">
          Table {table} &middot; {customer}
        </p>
        {items > 0 && (
          <p className="text-xs text-blue-500 font-medium mt-0.5">{items} item{items !== 1 ? 's' : ''}</p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
        className="text-gray-300 hover:text-gray-500 text-lg leading-none mt-0.5 flex-shrink-0"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebar-rail-collapsed') || 'false');
    } catch { return false; }
  });
  const navigate = useNavigate();

  const toggleRail = () => {
    setRailCollapsed((prev: boolean) => {
      const next = !prev;
      localStorage.setItem('sidebar-rail-collapsed', JSON.stringify(next));
      return next;
    });
  };

  // Use a dedicated 'admin-alerts' room so navigating away from /dashboard
  // (which leaves the 'dashboard' room) does not kill this listener.
  const socketRooms = useMemo(() => ['admin-alerts'], []);
  const socketEvents = useMemo(() => ({
    'order:new': (raw: unknown) => {
      const data = raw as OrderEventPayload;
      playTing();
      const table = data?.order?.table?.tableNumber ?? data?.tableId ?? '?';
      const customer = data?.order?.customerName ?? 'Customer';
      const items = data?.order?.items?.length ?? 0;
      const orderId = data?.orderId ?? data?.order?.id;
      toast.custom(
        (t) => (
          <OrderToast
            t={t}
            table={table}
            customer={customer}
            items={items}
            onView={() => {
              toast.dismiss(t.id);
              if (orderId) navigate(`/orders/${orderId}`);
              else navigate('/orders');
            }}
          />
        ),
        { duration: 8000, position: 'top-right' }
      );
    },
  }), [navigate]);

  useSocket(socketRooms, socketEvents);

  return (
    <div className="min-h-screen bg-app">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        railCollapsed={railCollapsed}
        onToggleRail={toggleRail}
      />
      <div className={`transition-[margin] duration-300 ease-in-out ${railCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
