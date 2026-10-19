import { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { PhoneFrame, BrowserFrame } from './Mockups';
import { ease, useTick } from './motion';
import PayLogo from './PayLogo';

const STEP_MS = 5500;

const STEPS = [
  { title: 'Scan the table QR', text: 'Guests point their camera at the QR on the table. No app to install.', icon: 'mdi:qrcode-scan' },
  { title: 'Browse & add to cart', text: 'A beautiful menu with photos, prices and categories. Tap to add.', icon: 'mdi:silverware-fork-knife' },
  { title: 'Place the order', text: 'Guests review their cart and send it with one tap.', icon: 'mdi:cart-check' },
  { title: 'Kitchen gets it instantly', text: 'The ticket appears on the kitchen screen in real time, with no paper KOT.', icon: 'mdi:chef-hat' },
  { title: 'Track & pay', text: 'Guests watch their food progress, then pay with Khalti, Fonepay or NepalPay.', icon: 'mdi:credit-card-check-outline' },
];

const MENU: Record<string, { id: string; name: string; price: number; icon: string }[]> = {
  Momo: [
    { id: 'cm', name: 'Chicken Momo', price: 250, icon: 'mdi:food-drumstick' },
    { id: 'jm', name: 'Jhol Momo', price: 280, icon: 'mdi:bowl-mix' },
    { id: 'vm', name: 'Veg Momo', price: 200, icon: 'mdi:leaf' },
  ],
  Mains: [
    { id: 'ts', name: 'Thakali Set', price: 450, icon: 'mdi:rice' },
    { id: 'sk', name: 'Sekuwa', price: 380, icon: 'mdi:grill' },
    { id: 'ch', name: 'Chowmein', price: 180, icon: 'mdi:noodles' },
  ],
  Drinks: [
    { id: 'mt', name: 'Masala Tea', price: 60, icon: 'mdi:tea' },
    { id: 'ls', name: 'Lassi', price: 120, icon: 'mdi:cup' },
    { id: 'lm', name: 'Lemon Soda', price: 90, icon: 'mdi:glass-cocktail' },
  ],
};
const ALL = Object.values(MENU).flat();

type Cart = Record<string, number>;
type AddFn = (id: string, d: number) => void;

/* ---------- Phone screens ---------- */

function ScanScreen() {
  return (
    <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#44403c,#0c0a09_70%)]" />
      <div className="relative w-44 h-44">
        {['top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl'].map((c) => (
          <Motion.i key={c} className={`absolute w-10 h-10 border-orange-500 ${c}`} animate={{ scale: [1, 0.92, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
        ))}
        <div className="absolute inset-6 bg-white rounded-lg p-2"><Icon icon="mdi:qrcode" className="w-full h-full text-stone-900" /></div>
        <Motion.div className="absolute left-2 right-2 h-0.5 bg-orange-500 shadow-[0_0_16px_4px_rgba(234,88,12,0.7)]" animate={{ top: ['10%', '90%', '10%'] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="relative mt-8 rounded-full bg-white text-stone-900 text-xs font-semibold px-4 py-2 flex items-center gap-1.5">
        <Icon icon="mdi:check-circle" className="text-green-600 w-4 h-4" /> Table 5 · Himalayan Kitchen
      </Motion.div>
      <p className="relative mt-3 text-[11px] text-stone-400">Point your camera at the table QR</p>
    </div>
  );
}

function MenuScreen({ cart, add, onCart }: { cart: Cart; add: AddFn; onCart: () => void }) {
  const [cat, setCat] = useState('Momo');
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = ALL.reduce((s, i) => s + (cart[i.id] || 0) * i.price, 0);
  return (
    <div className="px-4 pt-3 h-full">
      <p className="text-[10px] text-stone-500">Table 5 · Himalayan Kitchen</p>
      <p className="font-display font-bold text-lg text-stone-900 leading-tight">What are you craving?</p>
      <div className="mt-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white p-3 text-[11px]">
        <b className="block text-sm">Momo Monday 🥟</b>15% off all momo today
      </div>
      <div className="flex gap-1.5 mt-3 text-[11px]">
        {Object.keys(MENU).map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className="relative px-3 py-1 rounded-full">
            {cat === c && <Motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-stone-900" />}
            <span className={`relative ${cat === c ? 'text-white' : 'text-stone-600'}`}>{c}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <Motion.div key={cat} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="mt-3 space-y-2">
          {MENU[cat].map((i) => (
            <div key={i.id} className="flex items-center gap-2.5 rounded-xl ring-1 ring-stone-100 p-2">
              <span className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center"><Icon icon={i.icon} className="w-6 h-6 text-orange-600" /></span>
              <span className="flex-1 text-[11px]"><b className="block text-stone-900">{i.name}</b><span className="text-stone-500">Rs {i.price}</span></span>
              <Motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => add(i.id, 1)} aria-label={`Add ${i.name}`} className="relative w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center">
                <Icon icon="mdi:plus" className="w-4 h-4" />
                <AnimatePresence>
                  {cart[i.id] > 0 && (
                    <Motion.span key={cart[i.id]} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-stone-900 text-[9px] flex items-center justify-center">{cart[i.id]}</Motion.span>
                  )}
                </AnimatePresence>
              </Motion.button>
            </div>
          ))}
        </Motion.div>
      </AnimatePresence>
      <Motion.button
        type="button"
        onClick={onCart}
        animate={{ y: count ? 0 : 90 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="absolute left-3 right-3 bottom-4 rounded-2xl bg-stone-900 text-white px-4 py-3 flex items-center text-xs"
      >
        <Motion.span key={count} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center font-bold mr-2">{count}</Motion.span>
        View cart <span className="ml-auto font-semibold">Rs {total}</span>
      </Motion.button>
    </div>
  );
}

function CartScreen({ cart, add, onPlace }: { cart: Cart; add: AddFn; onPlace: () => void }) {
  const lines = ALL.filter((i) => cart[i.id]);
  const sub = lines.reduce((s, i) => s + cart[i.id] * i.price, 0);
  const vat = Math.round(sub * 0.13);
  return (
    <div className="px-4 pt-3 h-full flex flex-col">
      <p className="font-display font-bold text-lg text-stone-900">Your order</p>
      <p className="text-[10px] text-stone-500 mb-3">Table 5 · Dine in</p>
      <div className="space-y-2 flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {lines.map((i) => (
            <Motion.div key={i.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 text-[11px]">
              <span className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center"><Icon icon={i.icon} className="w-5 h-5 text-orange-600" /></span>
              <span className="flex-1"><b className="block text-stone-900">{i.name}</b><span className="text-stone-500">Rs {i.price * cart[i.id]}</span></span>
              <span className="flex items-center gap-1.5 rounded-full ring-1 ring-stone-200 px-1.5 py-0.5">
                <button type="button" onClick={() => add(i.id, -1)} aria-label="Less"><Icon icon="mdi:minus" /></button>
                <Motion.b key={cart[i.id]} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{cart[i.id]}</Motion.b>
                <button type="button" onClick={() => add(i.id, 1)} aria-label="More"><Icon icon="mdi:plus" /></button>
              </span>
            </Motion.div>
          ))}
        </AnimatePresence>
        {!lines.length && <p className="text-center text-xs text-stone-400 pt-10">Your cart is empty</p>}
      </div>
      <div className="text-[11px] space-y-1 border-t border-dashed border-stone-200 pt-2 mb-20">
        <p className="flex justify-between text-stone-500">Subtotal<span>Rs {sub}</span></p>
        <p className="flex justify-between text-stone-500">VAT 13%<span>Rs {vat}</span></p>
        <p className="flex justify-between font-bold text-stone-900 text-sm">Total<span>Rs {sub + vat}</span></p>
      </div>
      <Motion.button
        type="button"
        onClick={onPlace}
        disabled={!lines.length}
        animate={{ boxShadow: ['0 0 0 0 rgba(234,88,12,0.5)', '0 0 0 12px rgba(234,88,12,0)'] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="absolute left-3 right-3 bottom-4 rounded-2xl bg-orange-600 text-white font-semibold py-3 text-sm disabled:opacity-40"
      >
        Place order · Rs {sub + vat}
      </Motion.button>
    </div>
  );
}

function SentScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <Motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
        <svg viewBox="0 0 52 52" className="w-14 h-14">
          <Motion.path d="M14 27 l8 8 l16 -18" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
        </svg>
      </Motion.div>
      {[...Array(10)].map((_, i) => (
        <Motion.i
          key={i}
          className={`absolute top-1/3 w-2 h-2 rounded-sm ${['bg-orange-500', 'bg-amber-400', 'bg-green-500'][i % 3]}`}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: Math.cos(i * 0.63) * 110, y: Math.sin(i * 0.63) * 110 + 40, opacity: 0, rotate: 180 }}
          transition={{ duration: 1.1, delay: 0.25, ease: 'easeOut' }}
        />
      ))}
      <Motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-5 font-display font-bold text-xl text-stone-900">Order sent!</Motion.p>
      <Motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-xs text-stone-500 mt-1">Order #1046 is with the kitchen.<br />Estimated time: 15–20 min</Motion.p>
    </div>
  );
}

function TrackPayScreen({ total, paid, setPaid }: { total: number; paid: string | null; setPaid: (m: string) => void }) {
  const tick = useTick(900);
  const stage = Math.min(3, tick);
  const stages = ['Received', 'Cooking', 'Ready', 'Served'];
  return (
    <div className="px-4 pt-3 h-full">
      <p className="font-display font-bold text-lg text-stone-900">Order #1046</p>
      <p className="text-[10px] text-stone-500 mb-4">Table 5 · live status</p>
      <div className="relative pl-6 space-y-4">
        <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-stone-200" />
        <Motion.div className="absolute left-[9px] top-1 w-0.5 bg-orange-600 origin-top" animate={{ height: `${(stage / 3) * 92}%` }} transition={{ duration: 0.6, ease }} />
        {stages.map((s, i) => (
          <div key={s} className="relative flex items-center gap-3 text-xs">
            <Motion.span animate={{ backgroundColor: i <= stage ? '#ea580c' : '#e7e5e4', scale: i === stage ? [1, 1.3, 1] : 1 }} className="absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-white">
              {i <= stage && <Icon icon="mdi:check" className="w-3 h-3" />}
            </Motion.span>
            <span className={i <= stage ? 'font-semibold text-stone-900' : 'text-stone-400'}>{s}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-stone-50 ring-1 ring-stone-200 p-3">
        <p className="text-[11px] text-stone-500">Amount due</p>
        <p className="font-display font-bold text-xl text-stone-900">Rs {total}</p>
        <div className="grid grid-cols-3 gap-1.5 mt-3 text-[10px] font-semibold">
          {['Khalti', 'Fonepay', 'NepalPay'].map((m) => (
            <Motion.button key={m} type="button" whileTap={{ scale: 0.9 }} onClick={() => setPaid(m)} aria-label={`Pay with ${m}`} className={`rounded-lg h-10 px-1.5 bg-white ring-1 flex items-center justify-center transition ${paid === m ? 'ring-2 ring-green-500' : 'ring-stone-200'} ${paid && paid !== m ? 'opacity-30' : ''}`}>
              <PayLogo name={m} className="h-5" />
            </Motion.button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {paid && (
          <Motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="absolute left-3 right-3 bottom-4 rounded-2xl bg-green-600 text-white px-4 py-3 text-xs flex items-center gap-2">
            <Icon icon="mdi:check-decagram" className="w-5 h-5" /> Paid via {paid} · Thank you!
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Staff-side panel that reacts to the guest ---------- */

function StaffPanel({ step, cart, total, paid }: { step: number; cart: Cart; total: number; paid: string | null }) {
  const lines = ALL.filter((i) => cart[i.id]);
  const view = step === 3 ? 'kitchen' : step === 4 ? 'pay' : 'floor';
  return (
    <BrowserFrame title={view === 'kitchen' ? 'Kitchen display' : 'Waiter dashboard'}>
      <div className="h-[300px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'floor' && (
            <Motion.div key="floor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
              <p className="text-xs font-semibold text-stone-900 mb-3">Floor · Ground</p>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }, (_, t) => (
                  <Motion.div
                    key={t}
                    animate={t === 4 ? { scale: [1, 1.06, 1] } : {}}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className={`rounded-xl p-2 text-center ring-1 ${t === 4 ? 'bg-orange-50 ring-orange-400' : t % 3 === 0 ? 'bg-stone-100 ring-stone-200' : 'bg-white ring-stone-200'}`}
                  >
                    <p className="font-display font-bold">T{t + 1}</p>
                    <p className="text-[9px] text-stone-500">{t === 4 ? (step === 0 ? 'Scanning…' : step === 1 ? 'Browsing' : 'Ordering') : t % 3 === 0 ? 'Eating' : 'Free'}</p>
                  </Motion.div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-stone-50 ring-1 ring-stone-200 p-3 text-[11px]">
                <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />Table 5 live cart
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {lines.map((i) => (
                      <Motion.span key={i.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="rounded-full bg-white ring-1 ring-stone-200 px-2 py-0.5">{i.name} ×{cart[i.id]}</Motion.span>
                    ))}
                  </AnimatePresence>
                  {!lines.length && <span className="text-stone-400">Waiting for guest…</span>}
                </div>
              </div>
            </Motion.div>
          )}
          {view === 'kitchen' && (
            <Motion.div key="kitchen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-stone-900 h-full grid grid-cols-3 gap-2 content-start">
              <Motion.div initial={{ x: -200, rotate: -6 }} animate={{ x: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 16 }} className="rounded-xl bg-white overflow-hidden ring-4 ring-orange-500/60">
                <div className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold flex justify-between">T5 · NEW<Icon icon="mdi:bell-ring" className="animate-bounce" /></div>
                <div className="p-2.5 text-[11px] text-stone-700 space-y-0.5">{lines.map((i) => <p key={i.id}>{i.name} ×{cart[i.id]}</p>)}</div>
              </Motion.div>
              {[['T2', 'Sekuwa ×1'], ['T8', 'Lassi ×2']].map(([t, d]) => (
                <div key={t} className="rounded-xl bg-white/90 overflow-hidden opacity-70">
                  <div className="px-3 py-1.5 bg-stone-600 text-white text-xs font-bold">{t} · Cooking</div>
                  <p className="p-2.5 text-[11px] text-stone-700">{d}</p>
                </div>
              ))}
            </Motion.div>
          )}
          {view === 'pay' && (
            <Motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
              <p className="text-xs font-semibold text-stone-900 mb-3">Payments · today</p>
              <AnimatePresence>
                {paid && (
                  <Motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} className="mb-2 rounded-xl bg-green-50 ring-1 ring-green-200 p-3 text-xs flex items-center gap-2">
                    <Icon icon="mdi:check-decagram" className="text-green-600 w-5 h-5" />
                    <span className="flex-1"><b>Table 5 · #1046</b><br /><span className="text-stone-500">via {paid}</span></span>
                    <b className="text-green-700">Rs {total}</b>
                  </Motion.div>
                )}
              </AnimatePresence>
              {[['T2 · #1043', 'Cash', 640], ['T9 · #1041', 'Fonepay', 1333], ['T1 · #1039', 'Khalti', 420]].map(([t, m, a]) => (
                <div key={t} className="mb-2 rounded-xl ring-1 ring-stone-200 p-3 text-xs flex items-center gap-2">
                  <Icon icon="mdi:receipt-text-outline" className="text-stone-400 w-5 h-5" />
                  <span className="flex-1"><b>{t}</b><br /><span className="text-stone-500">via {m}</span></span>
                  <b>Rs {a}</b>
                </div>
              ))}
              {!paid && <p className="text-[11px] text-stone-400 text-center">Tap a payment option on the phone →</p>}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </BrowserFrame>
  );
}

export default function OrderFlowDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [cart, setCart] = useState<Cart>({ cm: 2, mt: 1 });
  const [paid, setPaid] = useState<string | null>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => { setPaid(null); setStep((s) => (s + 1) % STEPS.length); }, STEP_MS);
    return () => clearTimeout(id);
  }, [step, playing]);

  const go = (s: number) => { setPlaying(false); setPaid(null); setStep(s); };
  const add: AddFn = (id, d) => {
    setPlaying(false);
    setCart((c) => {
      const n = { ...c, [id]: Math.max(0, (c[id] || 0) + d) };
      if (!n[id]) delete n[id];
      return n;
    });
  };
  const sub = ALL.reduce((s, i) => s + (cart[i.id] || 0) * i.price, 0);
  const total = sub + Math.round(sub * 0.13);

  const screens = [
    <ScanScreen key="0" />,
    <MenuScreen key="1" cart={cart} add={add} onCart={() => go(2)} />,
    <CartScreen key="2" cart={cart} add={add} onPlace={() => go(3)} />,
    <SentScreen key="3" />,
    <TrackPayScreen key="4" total={total} paid={paid} setPaid={(m) => { setPlaying(false); setPaid(m); }} />,
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_auto_1.1fr] gap-8 lg:gap-10 items-center">
      {/* Steps */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => go(i)}
            className={`snap-start shrink-0 w-64 lg:w-auto text-left rounded-2xl p-4 transition-colors relative overflow-hidden ${step === i ? 'bg-white shadow-lg shadow-orange-900/5 ring-1 ring-orange-200' : 'hover:bg-white/60'}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${step === i ? 'bg-orange-600 text-white' : 'bg-stone-200/70 text-stone-500'}`}>
                <Icon icon={s.icon} className="w-5 h-5" />
              </span>
              <span className={`font-semibold ${step === i ? 'text-stone-900' : 'text-stone-500'}`}>{s.title}</span>
            </div>
            <AnimatePresence initial={false}>
              {step === i && (
                <Motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="text-sm text-stone-600 pl-[52px] overflow-hidden">
                  <span className="block pt-1">{s.text}</span>
                </Motion.p>
              )}
            </AnimatePresence>
            {step === i && playing && (
              <Motion.span key={`p${step}`} className="absolute left-0 bottom-0 h-0.5 bg-orange-600" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: STEP_MS / 1000, ease: 'linear' }} />
            )}
          </button>
        ))}
        {!playing && (
          <button type="button" onClick={() => setPlaying(true)} className="shrink-0 self-start lg:self-auto inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 px-4 py-2">
            <Icon icon="mdi:play-circle" className="w-5 h-5" /> Resume tour
          </button>
        )}
      </div>

      {/* Phone */}
      <div className="flex justify-center">
        <PhoneFrame>
          <div className="absolute inset-0 top-7">
            <AnimatePresence mode="wait">
              <Motion.div
                key={step}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease }}
              >
                {screens[step]}
              </Motion.div>
            </AnimatePresence>
          </div>
        </PhoneFrame>
      </div>

      {/* Staff side */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Meanwhile, on your staff screen
        </p>
        <StaffPanel step={step} cart={cart} total={total} paid={paid} />
        <p className="mt-3 text-xs text-stone-500 flex items-center gap-1.5"><Icon icon="mdi:gesture-tap" className="w-4 h-4 text-orange-600" /> Try it: tap the menu, change quantities and pay on the phone.</p>
      </div>
    </div>
  );
}
