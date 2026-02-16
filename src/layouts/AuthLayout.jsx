import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">WaitZi</h1>
          <p className="text-gray-500 mt-1">Restaurant Management System</p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
