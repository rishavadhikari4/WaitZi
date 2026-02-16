import { Outlet } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3.5 shadow-md">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide">WaitZi</h1>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-5">
        <Outlet />
      </main>
    </div>
  );
}
