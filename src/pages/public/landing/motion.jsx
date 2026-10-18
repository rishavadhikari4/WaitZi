/* eslint-disable react-refresh/only-export-components -- shared animation helpers live beside their components */
import { useEffect, useRef, useState } from 'react';
import { motion, animate, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';
import Lenis from 'lenis';

export const ease = [0.22, 1, 0.36, 1];

// Buttery scroll for the landing page only; skipped for reduced-motion users.
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.1, anchors: { offset: -80 } });
    let id;
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);
}

export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </M>
  );
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
export const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function CountUp({ to, prefix = '', suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration, ease, onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

export function Marquee({ children, reverse = false, speed = 30 }) {
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <div
        className="flex w-max gap-6 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

// 3D tilt that follows the pointer.
export function Tilt({ children, className = '', max = 8 }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const sx = useSpring(x, { stiffness: 120, damping: 18 });
  const sy = useSpring(y, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width);
        y.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { x.set(0.5); y.set(0.5); }}
    >
      {children}
    </motion.div>
  );
}

// Card with a soft orange light that follows the cursor.
export function Spotlight({ children, className = '' }) {
  const ref = useRef(null);
  return (
    <motion.div
      ref={ref}
      variants={item}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onPointerMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
        ref.current.style.setProperty('--my', `${e.clientY - r.top}px`);
      }}
      className={`group relative overflow-hidden ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(400px_circle_at_var(--mx)_var(--my),rgba(234,88,12,0.12),transparent_60%)]" />
      {children}
    </motion.div>
  );
}

// Re-renders every `ms` with an incrementing tick; drives looping mockups.
export function useTick(ms, active = true) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms, active]);
  return tick;
}
