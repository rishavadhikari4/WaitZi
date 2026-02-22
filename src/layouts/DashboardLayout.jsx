import { useState, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import Header from '../components/shared/Header';
import useSocket from '../hooks/useSocket';

// Plays a two-note "ting ting" chime using the Web Audio API (no sound file needed)
function playTing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const schedule = (freq, startAt, duration) => {
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
    setTimeout(() => ctx.close(), 1200);
  } catch { /* ignore audio context errors */ }
}

function OrderToast({ t, table, customer, items, onView }) {
  return (
    <div
      className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-start gap-3 bg-white border-l-4 border-indigo-500 rounded-xl shadow-xl px-4 py-3 w-72 cursor-pointer`}
      onClick={onView}
    >
      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <ShoppingBag className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm">New Order!</p>
        <p className="text-xs text-slate-500 truncate">
          Table {table} &middot; {customer}
        </p>
        {items > 0 && (
          <p className="text-xs text-indigo-500 font-medium mt-0.5">{items} item{items !== 1 ? 's' : ''}</p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
        className="text-slate-300 hover:text-slate-500 text-lg leading-none mt-0.5 flex-shrink-0"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Use a dedicated 'admin-alerts' room so navigating away from /dashboard
  // (which leaves the 'dashboard' room) does not kill this listener.
  const socketRooms = useMemo(() => ['admin-alerts'], []);
  const socketEvents = useMemo(() => ({
    'order:new': (data) => {
      playTing();
      const table = data?.order?.table?.tableNumber ?? data?.tableId ?? '?';
      const customer = data?.order?.customerName ?? 'Customer';
      const items = data?.order?.items?.length ?? 0;
      const orderId = data?.orderId ?? data?.order?._id;
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
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
