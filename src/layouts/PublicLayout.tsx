import { Outlet } from 'react-router-dom';
import logo from '../assets/logo.svg';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-app">
      <div className="h-1 bg-blue-500" />
      <header className="sticky top-1 z-30 bg-white/90 backdrop-blur-sm border-b border-dashed border-gray-300 px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <img src={logo} alt="WaitZi" className="w-8 h-8" />
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">WaitZi</h1>
        </div>
      </header>
      <main className="max-w-lg sm:max-w-2xl lg:max-w-3xl mx-auto px-4 py-5">
        <Outlet />
      </main>
    </div>
  );
}
