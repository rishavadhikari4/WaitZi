import { Outlet } from 'react-router-dom';
import logo from '../assets/logo.svg';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
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
