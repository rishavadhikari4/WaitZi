import { Outlet } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../assets/logo.svg';

const FLOATING_ICONS = [
  { icon: 'mdi:chef-hat', className: 'top-[8%] left-[10%] w-16 h-16 -rotate-12', delay: '0s' },
  { icon: 'mdi:silverware-fork-knife', className: 'top-[15%] right-[12%] w-11 h-11 rotate-12', delay: '0.6s' },
  { icon: 'mdi:pizza', className: 'top-[42%] left-[5%] w-14 h-14 rotate-6', delay: '1.2s' },
  { icon: 'mdi:coffee', className: 'bottom-[18%] left-[14%] w-12 h-12 -rotate-6', delay: '0.3s' },
  { icon: 'mdi:food-croissant', className: 'bottom-[10%] right-[16%] w-16 h-16 rotate-12', delay: '0.9s' },
  { icon: 'mdi:glass-wine', className: 'top-[10%] right-[30%] w-10 h-10 rotate-[20deg]', delay: '1.5s' },
  { icon: 'mdi:hamburger', className: 'bottom-[35%] right-[6%] w-12 h-12 -rotate-12', delay: '1.8s' },
  { icon: 'mdi:noodles', className: 'top-[55%] left-[18%] w-11 h-11 rotate-12', delay: '0.4s' },
];

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-app to-emerald-50 flex items-center justify-center px-4">
      {/* Blurred gradient blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-amber-300/20 blur-3xl" />

      {/* Decorative rotated shapes */}
      <div className="absolute top-[20%] left-[8%] w-20 h-20 border-4 border-blue-300/30 rounded-2xl rotate-12" />
      <div className="absolute bottom-[15%] right-[10%] w-24 h-24 border-4 border-emerald-300/30 rounded-full" />
      <div className="absolute top-[60%] right-[20%] w-14 h-14 bg-blue-200/30 rounded-xl rotate-45" />

      {/* Floating restaurant icons */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
        {FLOATING_ICONS.map(({ icon, className, delay }) => (
          <Icon
            key={icon}
            icon={icon}
            className={`absolute text-blue-600/15 animate-pulse ${className}`}
            style={{ animationDuration: '4s', animationDelay: delay }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="" className="w-12 h-12 flex-shrink-0" />
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">WaitZi</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Restaurant Management</p>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl shadow-blue-200/40 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500" />
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
