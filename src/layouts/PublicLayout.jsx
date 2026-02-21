import { Outlet } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-4.5 h-4.5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">WaitZi</h1>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-5">
        <Outlet />
      </main>
    </div>
  );
}
