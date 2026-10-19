import { useState, type ReactNode } from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import logo from '../../../assets/logo.svg';
import { useTick, ease } from './motion';

export function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative w-[260px] h-[540px] rounded-[2.6rem] bg-stone-900 p-2.5 shadow-2xl shadow-stone-900/30 ring-1 ring-stone-700 ${className}`}>
      <div className="absolute left-1/2 -translate-x-1/2 top-3.5 w-20 h-5 rounded-full bg-stone-900 z-20" />
      <div className="relative w-full h-full rounded-[2.1rem] bg-white overflow-hidden">
        <div className="flex justify-between px-6 pt-2.5 text-[10px] font-semibold text-stone-900">
          <span>9:41</span>
          <span className="flex gap-1"><Icon icon="mdi:signal" /><Icon icon="mdi:wifi" /><Icon icon="mdi:battery" /></span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function BrowserFrame({ children, title = 'app.waitzi.com', className = '' }: { children: ReactNode; title?: string; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white shadow-2xl shadow-orange-900/10 ring-1 ring-stone-200 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 border-b border-stone-200">
        <span className="flex gap-1.5">
          <i className="w-3 h-3 rounded-full bg-red-400" /><i className="w-3 h-3 rounded-full bg-amber-400" /><i className="w-3 h-3 rounded-full bg-green-400" />
        </span>
        <span className="mx-auto text-[11px] text-stone-500 bg-white rounded-md px-3 py-0.5 flex items-center gap-1">
          <Icon icon="mdi:lock" className="w-3 h-3" />{title}
        </span>
      </div>
      {children}
    </div>
  );
}

const DISHES = ['Chicken Momo ×2', 'Thakali Set ×1', 'Sekuwa ×1', 'Masala Tea ×3', 'Veg Chowmein ×1', 'Buff Choila ×1', 'Lassi ×2', 'Aloo Paratha ×2'];
const STAGES = [
  ['New', 'bg-amber-100 text-amber-800', 'bg-amber-400'],
  ['Cooking', 'bg-orange-100 text-orange-800', 'bg-orange-500'],
  ['Ready', 'bg-green-100 text-green-800', 'bg-green-500'],
];

// Kanban where tickets glide New → Cooking → Ready on a loop.
export function LiveBoard({ compact = false }) {
  const tick = useTick(1800);
  // Each ticket i is created at tick i and moves one stage per 2 ticks; keep the last 6.
  const tickets: { id: number; table: number; dish: string; stage: number }[] = [];
  for (let i = Math.max(0, tick - 6); i <= tick; i++) {
    const stage = Math.min(2, Math.floor((tick - i) / 2));
    tickets.push({ id: i, table: (i * 7) % 12 + 1, dish: DISHES[i % DISHES.length], stage });
  }
  return (
    <div className="bg-stone-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <img src={logo} alt="" className="w-5 h-5" />
        <span className="text-sm font-semibold text-stone-900">Live orders</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-green-600">
          <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-green-400 animate-ping" /><span className="relative w-2 h-2 rounded-full bg-green-500" /></span>
          Live
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {STAGES.map(([name, badge, dot], s) => (
          <div key={name} className="bg-white rounded-xl border border-stone-200 p-2.5 min-h-[180px]">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-semibold rounded-md px-2 py-0.5 ${badge}`}>{name}</span>
              <span className="text-[11px] text-stone-400">{tickets.filter((t) => t.stage === s).length}</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {tickets.filter((t) => t.stage === s).slice(0, compact ? 2 : 3).map((t) => (
                  <Motion.div
                    key={t.id}
                    layout
                    layoutId={`t-${t.id}`}
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    className="rounded-lg border border-stone-100 bg-stone-50 px-2.5 py-2"
                  >
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-900">
                      <i className={`w-1.5 h-1.5 rounded-full ${dot}`} />T{t.table} · #{1040 + t.id}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">{t.dish}</p>
                  </Motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TOASTS = [
  ['mdi:qrcode-scan', 'text-orange-600', 'New QR order', 'Table 5 · 3 items'],
  ['mdi:chef-hat', 'text-amber-600', 'Order ready', 'Table 2 · serve now'],
  ['mdi:check-decagram', 'text-green-600', 'Paid via Khalti', 'Rs 1,333 · Table 9'],
];

export function ToastCycle({ className = '' }) {
  const tick = useTick(2600);
  const [icon, color, title, sub] = TOASTS[tick % TOASTS.length];
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <Motion.div
          key={tick}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ duration: 0.45, ease }}
          className="flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-stone-200 px-4 py-3"
        >
          <span className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center"><Icon icon={icon} className={`w-5 h-5 ${color}`} /></span>
          <span className="text-sm leading-tight"><b className="block text-stone-900">{title}</b><span className="text-stone-500 text-xs">{sub}</span></span>
        </Motion.div>
      </AnimatePresence>
    </div>
  );
}

// Compact QR-menu screen used in the hero phone.
export function MenuScreen() {
  const tick = useTick(1400);
  const items = [['Chicken Momo', 250, 'mdi:food-drumstick'], ['Thakali Set', 450, 'mdi:rice'], ['Sekuwa', 380, 'mdi:grill'], ['Masala Tea', 60, 'mdi:tea']] as const;
  const added = tick % (items.length + 2);
  return (
    <div className="px-4 pt-4">
      <p className="text-[10px] text-stone-500">Table 5 · Himalayan Kitchen</p>
      <p className="font-display font-bold text-lg text-stone-900">What are you craving?</p>
      <div className="flex gap-1.5 mt-3 text-[10px]">
        {['Popular', 'Momo', 'Drinks'].map((c, i) => <span key={c} className={`px-2.5 py-1 rounded-full ${i === 0 ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'}`}>{c}</span>)}
      </div>
      <div className="mt-3 space-y-2">
        {items.map(([n, p, ic], i) => (
          <div key={n} className="flex items-center gap-2.5 rounded-xl border border-stone-100 p-2">
            <span className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center"><Icon icon={ic} className="w-5 h-5 text-orange-600" /></span>
            <span className="flex-1 text-[11px]"><b className="block text-stone-900">{n}</b><span className="text-stone-500">Rs {p}</span></span>
            <Motion.span
              animate={i < added ? { backgroundColor: '#16a34a', scale: [1, 1.25, 1] } : { backgroundColor: '#ea580c', scale: 1 }}
              className="w-6 h-6 rounded-full text-white flex items-center justify-center"
            >
              <Icon icon={i < added ? 'mdi:check' : 'mdi:plus'} className="w-4 h-4" />
            </Motion.span>
          </div>
        ))}
      </div>
      <Motion.div
        animate={{ y: added ? 0 : 80 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="absolute left-3 right-3 bottom-4 rounded-2xl bg-stone-900 text-white px-4 py-3 flex items-center text-xs"
      >
        <span className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center font-bold mr-2">{Math.min(added, items.length)}</span>
        View cart
        <span className="ml-auto font-semibold">Rs {items.slice(0, added).reduce((s, [, p]) => s + p, 0)}</span>
      </Motion.div>
    </div>
  );
}

/* ---------- Animated mini mocks for feature cards ---------- */

export function MiniMock({ type }: { type: string }) {
  const tick = useTick(1600);
  const box = 'bg-white rounded-xl shadow-sm ring-1 ring-stone-200 text-xs';
  switch (type) {
    case 'orders':
      return (
        <div className={`${box} p-3 w-44`}>
          <p className="font-semibold text-stone-900 mb-2 flex justify-between">Dine In · T4 <span className="text-orange-600">#1042</span></p>
          {['Momo ×2', 'Thakali Set ×1', 'Masala Tea ×3'].map((i, n) => (
            <Motion.p key={i} animate={{ opacity: n <= tick % 4 ? 1 : 0.25, x: n <= tick % 4 ? 0 : -6 }} className="flex justify-between text-stone-600 py-0.5">
              {i}<Icon icon="mdi:check-circle" className="text-green-500" />
            </Motion.p>
          ))}
        </div>
      );
    case 'table': {
      const states = [['Free', 'bg-green-100 text-green-700'], ['Busy', 'bg-orange-100 text-orange-700'], ['Bill', 'bg-stone-200 text-stone-700']];
      return (
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5].map((t) => {
            const [s, c] = states[(t + tick) % 3];
            return (
              <div key={t} className={`${box} p-2 text-center w-14`}>
                <p className="font-bold text-stone-900">T{t + 1}</p>
                <AnimatePresence mode="wait">
                  <Motion.span key={s} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className={`mt-1 inline-block rounded px-1 text-[10px] ${c}`}>{s}</Motion.span>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      );
    }
    case 'menu':
      return (
        <div className={`${box} p-3 w-48 space-y-2`}>
          {[['Chicken Momo', 'Rs 250'], ['Veg Chowmein', 'Rs 180'], ['Masala Tea', 'Rs 60']].map(([n, p], i) => (
            <div key={n} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100" />
              <span className="flex-1 text-stone-700">{n}</span>
              <Motion.span animate={{ color: tick % 3 === i ? '#ea580c' : '#1c1917' }} className="font-semibold">{p}</Motion.span>
            </div>
          ))}
        </div>
      );
    case 'roles':
      return (
        <div className={`${box} p-3 w-44 space-y-2`}>
          {['Admin', 'Manager', 'Waiter', 'Chef'].map((r, i) => {
            const on = (tick + i) % 4 !== 0;
            return (
              <div key={r} className="flex justify-between items-center text-stone-700">
                {r}
                <span className={`w-8 h-4.5 h-[18px] rounded-full p-0.5 flex ${on ? 'bg-orange-600 justify-end' : 'bg-stone-300 justify-start'}`}>
                  <Motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-3.5 h-3.5 rounded-full bg-white" />
                </span>
              </div>
            );
          })}
        </div>
      );
    case 'bill':
      return (
        <div className={`${box} p-3 w-44 font-mono`}>
          <p className="text-center font-bold tracking-widest text-stone-900 mb-2">INVOICE</p>
          <p className="flex justify-between text-stone-600">Subtotal<span>1,180</span></p>
          <p className="flex justify-between text-stone-600">VAT 13%<span>153</span></p>
          <p className="flex justify-between font-bold text-orange-600 border-t border-dashed border-stone-300 mt-1 pt-1">Total<span>1,333</span></p>
          <AnimatePresence>
            {tick % 2 === 1 && (
              <Motion.p initial={{ opacity: 0, scale: 2, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: -8 }} exit={{ opacity: 0 }} className="mt-2 text-center text-green-600 font-bold border-2 border-green-600 rounded">PAID</Motion.p>
            )}
          </AnimatePresence>
        </div>
      );
    case 'chart':
      return (
        <div className={`${box} p-3 w-48`}>
          <p className="text-stone-500">Today’s sales</p>
          <p className="font-bold text-stone-900 text-sm mb-2">Rs 48,520</p>
          <div className="flex items-end gap-1 h-14">
            {[40, 65, 35, 80, 55, 95, 70].map((h, i) => (
              <Motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.07, ease }}
                className={`flex-1 rounded-t ${i === 5 ? 'bg-orange-600' : 'bg-orange-200'}`}
              />
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

/* ---------- Role-based dashboards ---------- */

function OwnerScreen() {
  return (
    <div className="p-5 grid grid-cols-3 gap-3">
      {[['Today’s sales', 'Rs 48,520', '+12%'], ['Orders', '126', '+8%'], ['Avg. bill', 'Rs 385', '+3%']].map(([l, v, d], i) => (
        <Motion.div key={l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl bg-orange-50 ring-1 ring-orange-100 p-3">
          <p className="text-[11px] text-stone-500">{l}</p>
          <p className="font-display font-bold text-stone-900">{v}</p>
          <p className="text-[11px] text-green-600">{d}</p>
        </Motion.div>
      ))}
      <div className="col-span-2 rounded-xl ring-1 ring-stone-200 p-3">
        <p className="text-xs font-semibold text-stone-900 mb-2">Sales this week</p>
        <svg viewBox="0 0 200 70" preserveAspectRatio="none" className="w-full h-32">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ea580c" stopOpacity="0.3" /><stop offset="1" stopColor="#ea580c" stopOpacity="0" /></linearGradient>
          </defs>
          <Motion.path d="M0 55 L30 45 L60 50 L90 30 L120 35 L150 15 L200 20 L200 70 L0 70Z" fill="url(#g)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
          <Motion.path d="M0 55 L30 45 L60 50 L90 30 L120 35 L150 15 L200 20" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease }} />
        </svg>
      </div>
      <div className="rounded-xl ring-1 ring-stone-200 p-3 text-[11px]">
        <p className="text-xs font-semibold text-stone-900 mb-2">Payments</p>
        {[['Khalti', 38, 'bg-purple-500'], ['Cash', 32, 'bg-green-500'], ['Fonepay', 22, 'bg-red-500'], ['Card', 8, 'bg-blue-500']].map(([m, p, c], i) => (
          <div key={m} className="mb-1.5">
            <p className="flex justify-between text-stone-600">{m}<span>{p}%</span></p>
            <div className="h-1.5 rounded bg-stone-100"><Motion.div className={`h-full rounded ${c}`} initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaiterScreen() {
  const tick = useTick(1500);
  const states = [['Free', 'bg-white ring-stone-200 text-stone-500'], ['Ordering', 'bg-amber-50 ring-amber-200 text-amber-700'], ['Eating', 'bg-orange-50 ring-orange-200 text-orange-700'], ['Bill', 'bg-stone-900 ring-stone-900 text-white']];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-stone-900">Floor · Ground</p>
        <AnimatePresence mode="wait">
          <Motion.span key={tick % 4} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[11px] rounded-full bg-green-100 text-green-700 px-2 py-0.5 flex items-center gap-1">
            <Icon icon="mdi:bell-ring" /> T{(tick % 4) * 3 + 2} food is ready
          </Motion.span>
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 12 }, (_, t) => {
          const [s, c] = states[(t * 3 + tick) % 4 === 0 ? 0 : (t + Math.floor(tick / 2)) % 4];
          return (
            <Motion.div key={t} layout className={`rounded-xl ring-1 p-3 text-center transition-colors duration-500 ${c}`}>
              <p className="font-display font-bold text-lg">T{t + 1}</p>
              <p className="text-[10px]">{s}</p>
            </Motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ChefScreen() {
  const tick = useTick(1000);
  const tickets = [['T4', ['Momo ×2', 'Sekuwa ×1'], 4], ['T9', ['Thakali Set ×2'], 7], ['T1', ['Chowmein ×1', 'Lassi ×2'], 11], ['T6', ['Choila ×1'], 2]] as const;
  return (
    <div className="p-5 grid grid-cols-4 gap-3 items-start bg-stone-900 min-h-full">
      {tickets.map(([t, items, start], i) => {
        const secs = start * 60 + tick;
        const late = secs > 600;
        return (
          <Motion.div key={t} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl bg-white overflow-hidden">
            <div className={`px-3 py-1.5 flex justify-between text-xs font-bold text-white ${late ? 'bg-red-500' : 'bg-orange-600'}`}>
              {t}<span className="font-mono">{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</span>
            </div>
            <div className="p-3 space-y-1 text-[11px] text-stone-700">{items.map((x) => <p key={x}>{x}</p>)}</div>
            <button type="button" className="w-full text-[11px] font-semibold py-1.5 bg-green-50 text-green-700 border-t border-stone-100">Mark ready</button>
          </Motion.div>
        );
      })}
    </div>
  );
}

const ROLES = [
  { id: 'owner', label: 'Owner', icon: 'mdi:crown-outline', blurb: 'Sales, payments and trends at a glance.', Screen: OwnerScreen },
  { id: 'waiter', label: 'Waiter', icon: 'mdi:room-service-outline', blurb: 'Live floor map with ready-to-serve alerts.', Screen: WaiterScreen },
  { id: 'chef', label: 'Chef', icon: 'mdi:chef-hat', blurb: 'Kitchen tickets with timers, oldest first.', Screen: ChefScreen },
];

export function RoleShowcase() {
  const [role, setRole] = useState(ROLES[0]);
  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-stone-100 p-1.5">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r)}
              className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${role.id === r.id ? 'text-white' : 'text-stone-600 hover:text-stone-900'}`}
            >
              {role.id === r.id && <Motion.span layoutId="role-pill" className="absolute inset-0 rounded-xl bg-orange-600 shadow-lg shadow-orange-600/30" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <Icon icon={r.icon} className="relative w-5 h-5" />
              <span className="relative">{r.label}</span>
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <Motion.p key={role.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-stone-600 mt-4">{role.blurb}</Motion.p>
      </AnimatePresence>
      <BrowserFrame className="mt-8 max-w-4xl mx-auto">
        <div className="h-[340px] sm:h-[360px] overflow-x-auto overflow-y-hidden">
          <div className="min-w-[640px] h-full">
            <AnimatePresence mode="wait">
              <Motion.div
                key={role.id}
                className="h-full"
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                transition={{ duration: 0.45, ease }}
              >
                <role.Screen />
              </Motion.div>
            </AnimatePresence>
          </div>
        </div>
      </BrowserFrame>
    </div>
  );
}
