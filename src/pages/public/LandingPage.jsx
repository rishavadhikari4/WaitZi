import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion as Motion, AnimatePresence, MotionConfig, useScroll, useTransform, useSpring, useMotionValueEvent } from 'motion/react';
import logo from '../../assets/logo.svg';
import { PAYMENT_METHODS } from '../../utils/constants';
import { useSmoothScroll, Reveal, CountUp, Marquee, Tilt, Spotlight, stagger, item, ease, useTick } from './landing/motion';
import { BrowserFrame, PhoneFrame, LiveBoard, MenuScreen, ToastCycle, MiniMock, RoleShowcase } from './landing/Mockups';
import OrderFlowDemo from './landing/OrderFlowDemo';
import PayLogo from './landing/PayLogo';

const NAV = [
  { label: 'How it works', href: '#demo' },
  { label: 'Features', href: '#features' },
  { label: 'Roles', href: '#roles' },
  { label: 'FAQ', href: '#faq' },
];

const FEATURES = [
  { icon: 'mdi:clipboard-list-outline', title: 'Order Management', text: 'Dine-in, takeaway and QR orders land on one screen the moment they are placed.', mock: 'orders' },
  { icon: 'mdi:table-chair', title: 'Tables & Floor', text: 'See which tables are free, busy or waiting on the bill, live.', mock: 'table' },
  { icon: 'mdi:book-open-variant', title: 'Menu & Categories', text: 'Update items, prices and availability once. Every QR menu updates instantly.', mock: 'menu' },
  { icon: 'mdi:account-group-outline', title: 'Staff & Roles', text: 'Admins, managers, waiters and chefs each see exactly what they need.', mock: 'roles' },
  { icon: 'mdi:receipt-text-outline', title: 'Billing & Payments', text: 'Settle bills in seconds with cash, card, Fonepay, NepalPay or Khalti.', mock: 'bill' },
  { icon: 'mdi:chart-line', title: 'Sales & Reports', text: 'Daily sales, top items and payment splits, straight from the dashboard.', mock: 'chart' },
];

const SETUP = [
  { title: 'Create your restaurant', text: 'Sign up and invite your team in minutes. No hardware to buy, no installation.', points: ['Ready in under 5 minutes', 'Works on any phone, tablet or laptop', 'Every feature unlocked from day one'] },
  { title: 'Add your menu & tables', text: 'Add categories, items and prices, then print a QR code for each table.', points: ['Photos, prices and availability per item', 'Printable QR for every table', 'Changes go live instantly'] },
  { title: 'Start taking orders', text: 'Guests scan and order, the kitchen cooks, waiters serve and you get paid.', points: ['Orders go straight to the kitchen', 'Guests track their order live', 'Take payment from any device'] },
];

// ponytail: placeholder quotes; swap in real customer reviews before launch
const REVIEWS = [
  { name: 'Café owner', place: 'Kathmandu', text: 'Guests order from their table and the kitchen sees it instantly. Our Friday rush finally feels calm.' },
  { name: 'Restaurant manager', place: 'Pokhara', text: 'Daily sales used to take an hour with a notebook. Now I check the dashboard on my phone before closing.' },
  { name: 'Head chef', place: 'Lalitpur', text: 'The kitchen queue is clear and nothing gets lost. No more shouting order numbers across the pass.' },
  { name: 'Bar owner', place: 'Thamel', text: 'Setting up QR codes for every table took one afternoon. Guests love not waiting for a menu.' },
  { name: 'Waiter', place: 'Bhaktapur', text: 'I get a ping when food is ready, so I am not running back to the kitchen to check every five minutes.' },
  { name: 'Owner, family restaurant', place: 'Chitwan', text: 'Khalti and Fonepay payments match up with the daily report. Closing the till is so much faster.' },
];

const FAQS = [
  { q: 'What is WaitZi?', a: 'WaitZi is restaurant management software that brings QR ordering, the kitchen queue, tables, billing and sales reports into one system.' },
  { q: 'Do my guests need to install an app?', a: 'No. Guests scan the QR code on their table and order from their phone’s browser.' },
  { q: 'Which payment methods are supported?', a: `You can record payments by ${PAYMENT_METHODS.join(', ')}.` },
  { q: 'Do I need special hardware?', a: 'No. WaitZi runs in the browser on any phone, tablet, laptop or kitchen screen you already own.' },
  { q: 'Can I control what each staff member sees?', a: 'Yes. Admin, manager, waiter, chef and kitchen staff roles each get their own dashboard and permissions.' },
  { q: 'Does it update in real time?', a: 'Yes. New orders, status changes and payments show up live across every device, with no refresh needed.' },
  { q: 'Is it suitable for small cafés?', a: 'Yes. WaitZi works for a five-table café as well as a busy multi-floor restaurant.' },
  { q: 'Is my data secure?', a: 'Every account is protected by authentication and role-based access, and data travels over encrypted connections.' },
];

const WORDS = ['smarter', 'faster', 'calmer', 'paperless'];

function Check({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-stone-700">
      <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 shrink-0" />
      {children}
    </li>
  );
}

function CTA({ children = 'Start for free', className = '' }) {
  return (
    <Motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
      <Link
        to="/login"
        className={`group relative inline-flex items-center gap-2 overflow-hidden bg-orange-600 text-white font-semibold rounded-xl px-6 py-3.5 shadow-lg shadow-orange-600/30 ${className}`}
      >
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <span className="relative">{children}</span>
        <Icon icon="mdi:arrow-right" className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </Motion.span>
  );
}

function SectionHead({ eyebrow, title, text }) {
  return (
    <Reveal className="text-center max-w-2xl mx-auto">
      {eyebrow && <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider">{eyebrow}</p>}
      <h2 className="mt-2 font-display text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">{title}</h2>
      {text && <p className="mt-4 text-lg text-stone-600">{text}</p>}
    </Reveal>
  );
}

function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 20));
  return (
    <>
      <Motion.div style={{ scaleX: progress }} className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400 origin-left z-50" />
      <header className="fixed top-0 inset-x-0 z-40 px-4 pt-3">
        <Motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease }}
          className={`max-w-6xl mx-auto flex items-center gap-6 rounded-2xl px-4 py-2.5 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-stone-900/5 ring-1 ring-stone-200' : 'bg-transparent'}`}
        >
          <a href="#top" className="flex items-center gap-2">
            <Motion.img src={logo} alt="" className="w-8 h-8" whileHover={{ rotate: 12, scale: 1.1 }} />
            <span className="font-display font-bold text-xl tracking-tight">WaitZi</span>
          </a>
          <div className="hidden md:flex gap-1 text-sm text-stone-600">
            {NAV.map((n) => <a key={n.href} href={n.href} className="px-3 py-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors">{n.label}</a>)}
          </div>
          <Link to="/login" className="hidden sm:block ml-auto text-sm font-medium text-stone-700 hover:text-stone-900">Login</Link>
          <Link to="/login" className="ml-auto sm:ml-0 bg-stone-900 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors">Start for free</Link>
          <button type="button" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <Icon icon={open ? 'mdi:close' : 'mdi:menu'} className="w-6 h-6" />
          </button>
        </Motion.nav>
        <AnimatePresence>
          {open && (
            <Motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="md:hidden mt-2 rounded-2xl bg-white shadow-xl ring-1 ring-stone-200 p-2"
            >
              {[...NAV, { label: 'Login', href: '/login' }].map((n) => (
                <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-stone-700 hover:bg-orange-50">{n.label}</a>
              ))}
            </Motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const word = WORDS[useTick(2200) % WORDS.length];

  return (
    <section id="top" ref={ref} className="relative pt-32 sm:pt-40 pb-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-orange-50 via-white to-white" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)] opacity-60" />
      <Motion.div className="absolute -z-10 -top-20 left-[10%] w-96 h-96 rounded-full bg-orange-300/40 blur-3xl" animate={{ x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      <Motion.div className="absolute -z-10 top-40 right-[5%] w-80 h-80 rounded-full bg-amber-200/50 blur-3xl" animate={{ x: [0, -50, 0], y: [0, 60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="max-w-4xl mx-auto text-center">
        <Motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease }}
          className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur ring-1 ring-orange-200 pl-1 pr-3 py-1 text-xs font-medium text-stone-700 shadow-sm"
        >
          <span className="rounded-full bg-orange-600 text-white px-2 py-0.5">New</span> QR ordering for restaurants in Nepal 🇳🇵
        </Motion.span>
        <h1 className="mt-6 font-display text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] text-stone-900">
          {'Run your restaurant'.split(' ').map((w, i) => (
            <Motion.span key={w} className="inline-block mr-[0.25em]" initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease }}>
              {w}
            </Motion.span>
          ))}
          <br />
          <span className="relative inline-flex justify-center min-w-[5.5em] h-[1.15em] align-bottom">
            <AnimatePresence mode="wait">
              <Motion.span
                key={word}
                className="absolute inset-x-0 top-0 text-center"
                initial={{ y: 24, opacity: 0, filter: 'blur(8px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -24, opacity: 0, filter: 'blur(8px)' }}
                transition={{ duration: 0.4, ease }}
              >
                <span className="text-orange-600">{word}.</span>
              </Motion.span>
            </AnimatePresence>
          </span>
        </h1>
        <Motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, ease }} className="mt-6 text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
          QR ordering, kitchen display, tables, billing and live sales, all in one beautifully simple system.
        </Motion.p>
        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, ease }} className="mt-9 flex flex-wrap justify-center items-center gap-4">
          <CTA>Start your free trial</CTA>
          <a href="#demo" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-stone-800 bg-white ring-1 ring-stone-200 hover:ring-stone-300 shadow-sm">
            <Icon icon="mdi:play-circle" className="w-5 h-5 text-orange-600" /> See how it works
          </a>
        </Motion.div>
        <Motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-4 text-xs text-stone-500">No credit card · Set up in 5 minutes · Cancel anytime</Motion.p>
      </div>

      {/* Hero visual */}
      <Motion.div style={{ y }} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1, ease }} className="relative mt-16 max-w-5xl mx-auto">
        <Tilt max={5}>
          <BrowserFrame>
            <div className="overflow-x-auto"><div className="min-w-[560px]"><LiveBoard /></div></div>
          </BrowserFrame>
        </Tilt>
        <Motion.div style={{ y: phoneY }} className="hidden lg:block absolute -right-12 top-10 scale-[0.78] origin-top-right">
          <Motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <PhoneFrame><MenuScreen /></PhoneFrame>
          </Motion.div>
        </Motion.div>
        <ToastCycle className="hidden md:block absolute -left-8 -bottom-8 w-64" />
      </Motion.div>
    </section>
  );
}

function Stats() {
  const stats = [
    { to: 5, suffix: ' min', label: 'to set up your restaurant' },
    { to: 5, suffix: '', label: 'staff roles with their own views' },
    { to: 5, suffix: '', label: 'payment methods supported' },
    { to: 0, suffix: '', label: 'apps for guests to install' },
  ];
  return (
    <section className="px-4 py-16">
      <Motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Motion.div key={s.label} variants={item} className="rounded-2xl bg-stone-50 ring-1 ring-stone-200 p-6 text-center">
            <p className="font-display text-4xl sm:text-5xl font-extrabold text-stone-900"><CountUp to={s.to} suffix={s.suffix} /></p>
            <p className="mt-1 text-sm text-stone-600">{s.label}</p>
          </Motion.div>
        ))}
      </Motion.div>
    </section>
  );
}

function Payments() {
  return (
    <section className="py-12 border-y border-stone-100 bg-white">
      <p className="text-center text-sm font-semibold text-stone-500 mb-8">Accept every way Nepal pays</p>
      <Marquee speed={25}>
        {PAYMENT_METHODS.map((m) => (
          <div key={m} className="shrink-0 flex items-center justify-center h-16 px-8 rounded-2xl bg-stone-50 ring-1 ring-stone-200 hover:ring-orange-300 hover:bg-white transition-all grayscale hover:grayscale-0">
            <PayLogo name={m} />
          </div>
        ))}
      </Marquee>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="px-4 py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <SectionHead eyebrow="Features" title="Everything your restaurant needs" text="Orders, tables, kitchen, staff and money, finally in one place." />
        <Motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <Spotlight key={f.title} className="rounded-3xl ring-1 ring-stone-200 bg-white p-6 hover:shadow-xl hover:shadow-orange-900/5 transition-shadow">
              <div className="h-44 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/40 flex items-center justify-center">
                <MiniMock type={f.mock} />
              </div>
              <h3 className="mt-5 font-display font-bold text-xl flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><Icon icon={f.icon} className="w-5 h-5 text-orange-600" /></span>
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-stone-600">{f.text}</p>
            </Spotlight>
          ))}
        </Motion.div>
      </div>
    </section>
  );
}

function Devices() {
  return (
    <section className="px-4 pb-24">
      <Reveal className="max-w-6xl mx-auto rounded-[2rem] bg-stone-900 text-white p-8 sm:p-14 grid md:grid-cols-2 gap-10 items-center overflow-hidden relative">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-orange-600/30 blur-3xl" />
        <div className="relative">
          <h3 className="font-display text-4xl sm:text-5xl font-bold">Works on <span className="text-orange-400">any device</span></h3>
          <p className="mt-4 text-stone-300 text-lg">Phones, tablets, laptops and kitchen screens. Your team uses what they already have, and everything stays in sync.</p>
          <ul className="mt-6 space-y-2 text-stone-200 text-sm">
            {['No hardware to buy', 'Real-time sync across every screen', 'Installable on your home screen'].map((t) => (
              <li key={t} className="flex items-center gap-2"><Icon icon="mdi:check-circle" className="text-orange-400 w-5 h-5" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="relative flex justify-center items-end gap-4 h-64">
          {[['mdi:cellphone', 'h-24', 0], ['mdi:tablet', 'h-36', 0.15], ['mdi:laptop', 'h-48', 0.3], ['mdi:monitor', 'h-40', 0.45]].map(([ic, h, d]) => (
            <Motion.div key={ic} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: d, duration: 0.7, ease }}>
              <Motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3 + d * 4, repeat: Infinity, ease: 'easeInOut' }}>
                <Icon icon={ic} className={`${h} w-auto text-orange-400 drop-shadow-[0_0_24px_rgba(234,88,12,0.5)]`} />
              </Motion.div>
            </Motion.div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Setup steps: small, believable product screens ---------- */

function ScreenCard({ title, meta, children, footer }) {
  return (
    <div className="rounded-xl bg-white border border-stone-200 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_-12px_rgba(28,25,23,0.12)] overflow-hidden text-[13px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <span className="font-semibold text-stone-900">{title}</span>
        {meta}
      </div>
      {children}
      {footer && <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/60">{footer}</div>}
    </div>
  );
}

const ROLE_TONE = {
  Admin: 'bg-stone-900 text-white',
  Manager: 'bg-orange-100 text-orange-800',
  Waiter: 'bg-stone-100 text-stone-700',
  Chef: 'bg-amber-100 text-amber-800',
};

function TeamScreen() {
  const people = [['Anisha Shrestha', 'Admin'], ['Bikash Gurung', 'Manager'], ['Sita Rai', 'Waiter'], ['Ramesh Thapa', 'Chef']];
  return (
    <ScreenCard
      title="Team"
      meta={<span className="rounded-md bg-orange-600 text-white text-xs font-medium px-2.5 py-1">Invite</span>}
    >
      <ul className="divide-y divide-stone-100">
        {people.map(([name, role]) => (
          <li key={name} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold flex items-center justify-center">
              {name.split(' ').map((w) => w[0]).join('')}
            </span>
            <span className="flex-1 text-stone-800">{name}</span>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${ROLE_TONE[role]}`}>{role}</span>
          </li>
        ))}
      </ul>
    </ScreenCard>
  );
}

function MenuScreen2() {
  const items = [['Chicken Momo', 'Momo', 250, true], ['Jhol Momo', 'Momo', 280, true], ['Thakali Set', 'Mains', 450, false], ['Masala Tea', 'Drinks', 60, true]];
  return (
    <ScreenCard title="Menu" meta={<span className="text-xs text-stone-500">12 items</span>}>
      <ul className="divide-y divide-stone-100">
        {items.map(([name, cat, price, on]) => (
          <li key={name} className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex-1">
              <span className="block text-stone-800">{name}</span>
              <span className="block text-[11px] text-stone-400">{cat}</span>
            </span>
            <span className="tabular-nums text-stone-700">Rs {price}</span>
            <span className={`w-7 h-4 rounded-full p-0.5 flex ${on ? 'bg-orange-600 justify-end' : 'bg-stone-300 justify-start'}`}>
              <span className="w-3 h-3 rounded-full bg-white" />
            </span>
          </li>
        ))}
      </ul>
    </ScreenCard>
  );
}

function OrderScreen() {
  const lines = [['Chicken Momo', 2, 500, 'Ready'], ['Thakali Set', 1, 450, 'Cooking'], ['Mango Lassi', 2, 240, 'New'], ['Masala Tea', 3, 180, 'Served']];
  const tone = {
    New: 'text-amber-700 bg-amber-50',
    Ready: 'text-green-700 bg-green-50',
    Cooking: 'text-orange-700 bg-orange-50',
    Served: 'text-stone-500 bg-stone-100',
  };
  return (
    <ScreenCard
      title="Table 4 · #1042"
      meta={<span className="text-xs text-stone-500">Dine in</span>}
      footer={
        <div className="flex justify-between font-semibold text-stone-900">
          <span>Total</span>
          <span className="tabular-nums">Rs 1,370</span>
        </div>
      }
    >
      <ul className="divide-y divide-stone-100">
        {lines.map(([name, qty, amount, status]) => (
          <li key={name} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-5 text-stone-400 tabular-nums">{qty}×</span>
            <span className="flex-1 text-stone-800">{name}</span>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${tone[status]}`}>{status}</span>
            <span className="w-14 text-right tabular-nums text-stone-700">Rs {amount}</span>
          </li>
        ))}
      </ul>
    </ScreenCard>
  );
}

const SETUP_SCREENS = [TeamScreen, MenuScreen2, OrderScreen];

function Setup() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] });
  const line = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <section id="setup" className="px-4 py-20 sm:py-24 bg-stone-50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <SectionHead eyebrow="Get started" title="Up and running before lunch" text="Three steps from sign-up to your first order." />
        <div ref={ref} className="relative mt-16">
          {/* Spine: grey track, orange fill that follows the scroll */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-stone-200 -translate-x-1/2" />
          <Motion.div
            style={{ scaleY: line }}
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-orange-500 origin-top -translate-x-1/2"
          />
          <ol className="space-y-16 md:space-y-28">
            {SETUP.map((s, i) => {
              const Screen = SETUP_SCREENS[i];
              const textLeft = i % 2 === 0;
              return (
                <li key={s.title} className="relative grid md:grid-cols-[1fr_5rem_1fr] md:items-center pl-12 md:pl-0">
                  {/* Node: lives in its own column, so it never covers text */}
                  <Motion.span
                    initial={{ backgroundColor: '#fafaf9', borderColor: '#d6d3d1', color: '#a8a29e' }}
                    whileInView={{ backgroundColor: '#ea580c', borderColor: '#ea580c', color: '#ffffff' }}
                    viewport={{ once: true, margin: '0px 0px -45% 0px' }}
                    transition={{ duration: 0.35 }}
                    className="absolute left-4 top-0 -translate-x-1/2 md:static md:translate-x-0 md:col-start-2 md:row-start-1 md:justify-self-center w-9 h-9 rounded-full border font-mono text-xs font-semibold flex items-center justify-center ring-4 ring-stone-50 z-10"
                  >
                    0{i + 1}
                  </Motion.span>

                  <Reveal
                    className={`md:row-start-1 ${textLeft ? 'md:col-start-1 md:pr-4' : 'md:col-start-3 md:pl-4'}`}
                  >
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">{s.title}</h3>
                    <p className="mt-2 text-stone-600 max-w-md">{s.text}</p>
                    <ul className="mt-4 space-y-1.5 text-sm text-stone-600">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-2">
                          <Icon icon="mdi:check" className="w-4 h-4 mt-0.5 shrink-0 text-orange-600" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </Reveal>

                  <Reveal
                    delay={0.1}
                    className={`mt-6 md:mt-0 md:row-start-1 w-full max-w-sm ${
                      textLeft ? 'md:col-start-3 md:justify-self-start md:pl-4' : 'md:col-start-1 md:justify-self-end md:pr-4'
                    }`}
                  >
                    <Screen />
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

const initials = (name) => name.split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

function Reviews() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const r = REVIEWS[active];
  const go = (i) => setActive((i + REVIEWS.length) % REVIEWS.length);

  useEffect(() => {
    if (paused) return undefined;
    const id = setTimeout(() => setActive((i) => (i + 1) % REVIEWS.length), 7000);
    return () => clearTimeout(id);
  }, [active, paused]);

  return (
    <section id="reviews" className="px-4 py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider">Reviews</p>
          <h2 className="mt-2 font-display text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">Loved by restaurant teams</h2>
          <p className="mt-4 text-lg text-stone-600">What owners, managers and chefs say after switching to WaitZi.</p>
        </Reveal>

        <div
          className="mt-14 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-10 lg:gap-16 [&>*]:min-w-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Featured quote */}
          <Reveal className="flex flex-col">
            <span aria-hidden className="font-display text-7xl leading-none h-12 text-orange-600 select-none">“</span>
            <div className="relative min-h-[11rem] sm:min-h-[9.5rem]">
              <AnimatePresence mode="wait">
                <Motion.figure
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <blockquote className="font-display text-2xl sm:text-3xl font-medium leading-snug text-stone-900">{r.text}</blockquote>
                  <figcaption className="mt-8 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-stone-900 text-white text-sm font-semibold flex items-center justify-center">
                      {initials(r.name)}
                    </span>
                    <span>
                      <span className="block font-semibold text-stone-900">{r.name}</span>
                      <span className="block text-sm text-stone-500">{r.place}</span>
                    </span>
                  </figcaption>
                </Motion.figure>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <button type="button" onClick={() => go(active - 1)} aria-label="Previous review" className="w-10 h-10 rounded-full border border-stone-300 text-stone-700 hover:border-stone-900 hover:text-stone-900 flex items-center justify-center transition-colors">
                <Icon icon="mdi:arrow-left" className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => go(active + 1)} aria-label="Next review" className="w-10 h-10 rounded-full border border-stone-300 text-stone-700 hover:border-stone-900 hover:text-stone-900 flex items-center justify-center transition-colors">
                <Icon icon="mdi:arrow-right" className="w-4 h-4" />
              </button>
              <span className="font-mono text-sm text-stone-500 tabular-nums">
                {String(active + 1).padStart(2, '0')} <span className="text-stone-300">/</span> {String(REVIEWS.length).padStart(2, '0')}
              </span>
              {/* Progress toward the next quote */}
              <span className="relative h-px flex-1 bg-stone-200 overflow-hidden">
                {!paused && (
                  <Motion.span
                    key={active}
                    className="absolute inset-y-0 left-0 bg-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 7, ease: 'linear' }}
                  />
                )}
              </span>
            </div>
          </Reveal>

          {/* Everyone else, one tap away */}
          <Reveal delay={0.1}>
            <ul className="border-t border-stone-200">
              {REVIEWS.map((rv, i) => (
                <li key={rv.text} className="border-b border-stone-200">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={i === active}
                    className="group w-full text-left py-4 flex gap-4 items-start"
                  >
                    <span className={`mt-0.5 w-8 h-8 shrink-0 rounded-full text-[11px] font-semibold flex items-center justify-center transition-colors ${i === active ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'}`}>
                      {initials(rv.name)}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold transition-colors ${i === active ? 'text-stone-900' : 'text-stone-700'}`}>
                        {rv.name} <span className="font-normal text-stone-400">· {rv.place}</span>
                      </span>
                      <span className={`block text-sm truncate transition-colors ${i === active ? 'text-stone-600' : 'text-stone-400 group-hover:text-stone-500'}`}>{rv.text}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="px-4 py-24 bg-stone-50 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <SectionHead eyebrow="FAQ" title="Questions? Answered." />
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04} y={16}>
              <div className={`rounded-2xl bg-white ring-1 transition-colors ${open === i ? 'ring-orange-300 shadow-lg shadow-orange-900/5' : 'ring-stone-200'}`}>
                <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left font-semibold">
                  {f.q}
                  <Motion.span animate={{ rotate: open === i ? 45 : 0 }} className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${open === i ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <Icon icon="mdi:plus" className="w-5 h-5" />
                  </Motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <Motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
                      <p className="px-6 pb-5 text-stone-600">{f.a}</p>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const icons = ['mdi:silverware-fork-knife', 'mdi:qrcode', 'mdi:chef-hat', 'mdi:receipt-text', 'mdi:coffee', 'mdi:food'];
  return (
    <section className="px-4 py-24">
      <Reveal className="relative max-w-6xl mx-auto rounded-[2rem] overflow-hidden text-white text-center px-6 py-20 sm:py-24 bg-[linear-gradient(120deg,#ea580c,#f59e0b,#c2410c,#ea580c)] bg-[length:300%_300%] animate-[gradient_10s_ease_infinite]">
        {icons.map((ic, i) => (
          <Motion.span
            key={ic}
            className="absolute text-white/20"
            style={{ left: `${8 + i * 16}%`, top: i % 2 ? '15%' : '70%' }}
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon icon={ic} className="w-12 h-12 sm:w-16 sm:h-16" />
          </Motion.span>
        ))}
        <h2 className="relative font-display text-4xl sm:text-6xl font-extrabold tracking-tight">Ready to make service smoother?</h2>
        <p className="relative mt-5 text-orange-50 text-lg max-w-xl mx-auto">Start with WaitZi today and give your team and your guests a better experience.</p>
        <Motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="relative inline-block mt-10">
          <Link to="/login" className="inline-flex items-center gap-2 bg-white text-orange-700 font-bold rounded-xl px-8 py-4 shadow-2xl">
            Get started free <Icon icon="mdi:arrow-right" className="w-5 h-5" />
          </Link>
        </Motion.span>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-4 pt-16 pb-8 bg-stone-950 text-stone-400">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 text-white">
            <img src={logo} alt="" className="w-8 h-8 bg-white rounded-lg p-0.5" />
            <span className="font-display font-bold text-xl">WaitZi</span>
          </div>
          <p className="mt-4 text-sm">Restaurant management software for orders, kitchen, tables and billing.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm">{FEATURES.map((f) => <li key={f.title}><a href="#features" className="hover:text-orange-400 transition-colors">{f.title}</a></li>)}</ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#demo" className="hover:text-orange-400">How it works</a></li>
            <li><a href="#faq" className="hover:text-orange-400">FAQ</a></li>
            <li><Link to="/login" className="hover:text-orange-400">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Get in touch</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:rishavadhikari657@gmail.com" className="flex items-center gap-2 hover:text-orange-400 break-all"><Icon icon="mdi:email-outline" className="shrink-0" />rishavadhikari657@gmail.com</a></li>
            <li className="flex items-center gap-2"><Icon icon="mdi:map-marker-outline" />Kathmandu, Nepal</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-stone-800 text-xs flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} WaitZi. All rights reserved.</span>
        <span>Made with ❤️ in Nepal</span>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  useSmoothScroll();
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-white text-stone-900 overflow-x-clip">
        <Nav />
        <Hero />
        <Stats />
        <Payments />

        <section id="demo" className="px-4 py-24 bg-gradient-to-b from-orange-50/70 to-white scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <SectionHead eyebrow="How it works" title="From table to kitchen in seconds" text="Follow a real order. Tap around: the phone is fully interactive." />
            <Reveal className="mt-16"><OrderFlowDemo /></Reveal>
          </div>
        </section>

        <Features />

        <section id="roles" className="px-4 py-24 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <SectionHead eyebrow="For every role" title="One system, a perfect view for everyone" text="Switch roles to see what each person on your team gets." />
            <Reveal className="mt-12"><RoleShowcase /></Reveal>
          </div>
        </section>

        <Devices />
        <Setup />
        <Reviews />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </MotionConfig>
  );
}
