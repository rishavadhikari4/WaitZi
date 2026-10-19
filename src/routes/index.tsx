import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicLayout from '../layouts/PublicLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';

// Public ordering pages
import OrderPage from '../pages/public/OrderPage';
import CartPage from '../pages/public/CartPage';
import OrderConfirmation from '../pages/public/OrderConfirmation';
import OrderTracking from '../pages/public/OrderTracking';
import PaymentResult from '../pages/public/PaymentResult';
import LegacyTableRedirect from '../pages/public/LegacyTableRedirect';
import LandingPage from '../pages/public/LandingPage';

// Dashboard pages
import DashboardRouter from '../pages/dashboard/DashboardRouter';
import RealTimePage from '../pages/dashboard/RealTimePage';

// Order pages
import OrderListPage from '../pages/orders/OrderListPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';
import KitchenQueuePage from '../pages/orders/KitchenQueuePage';

// Menu pages
import MenuListPage from '../pages/menu/MenuListPage';
import MenuFormPage from '../pages/menu/MenuFormPage';
import CategoryListPage from '../pages/menu/CategoryListPage';
import CategoryFormPage from '../pages/menu/CategoryFormPage';

// Table pages
import TableListPage from '../pages/tables/TableListPage';
import TableFormPage from '../pages/tables/TableFormPage';
import QRManagementPage from '../pages/tables/QRManagementPage';

// Payment pages
import PaymentListPage from '../pages/payments/PaymentListPage';
import PaymentDetailPage from '../pages/payments/PaymentDetailPage';
import ProcessPaymentPage from '../pages/payments/ProcessPaymentPage';
import DailySalesPage from '../pages/payments/DailySalesPage';

// User pages
import UserListPage from '../pages/users/UserListPage';
import UserDetailPage from '../pages/users/UserDetailPage';
import UserFormPage from '../pages/users/UserFormPage';
import ProfilePage from '../pages/users/ProfilePage';
import RoleManagementPage from '../pages/users/RoleManagementPage';

// Error pages
import NotFoundPage from '../pages/errors/NotFoundPage';
import UnauthorizedPage from '../pages/errors/UnauthorizedPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<Navigate to="/" replace />} />

      {/* Auth routes */}
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Guest ordering: every page is keyed by the table's QR token */}
      <Route element={<PublicLayout />}>
        <Route path="/t/:qrToken" element={<OrderPage />} />
        <Route path="/t/:qrToken/cart" element={<CartPage />} />
        <Route path="/t/:qrToken/confirm" element={<OrderConfirmation />} />
        <Route path="/t/:qrToken/track" element={<OrderTracking />} />
        <Route path="/t/:qrToken/payment-result" element={<PaymentResult />} />
        <Route path="/order/payment-result" element={<PaymentResult />} />
        {/* Old links and printed stickers (/order/table/<n>?tableId=<id>) */}
        <Route path="/order/table/:tableNumber/*" element={<LegacyTableRedirect />} />
      </Route>

      {/* Dashboard shell, mounted once for any signed-in staff member. Routes
          below add the permission the server needs for that screen, so the
          sidebar and socket in DashboardLayout don't remount between them. */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/dashboard/live" element={<RealTimePage />} />

        {/* Orders */}
        <Route path="/orders" element={<ProtectedRoute perms={['order.view']}><OrderListPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute perms={['order.view']}><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/kitchen" element={<ProtectedRoute perms={['kot.view']}><KitchenQueuePage /></ProtectedRoute>} />

        {/* Floor */}
        <Route path="/tables" element={<ProtectedRoute perms={['table.view']}><TableListPage /></ProtectedRoute>} />
        <Route path="/tables/new" element={<ProtectedRoute perms={['table.manage']}><TableFormPage /></ProtectedRoute>} />
        <Route path="/tables/:id/edit" element={<ProtectedRoute perms={['table.manage']}><TableFormPage /></ProtectedRoute>} />
        <Route path="/tables/qr" element={<ProtectedRoute perms={['table.manage']}><QRManagementPage /></ProtectedRoute>} />

        {/* Account */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Menu */}
        <Route path="/menu" element={<ProtectedRoute perms={['menu.manage', 'menu.86']}><MenuListPage /></ProtectedRoute>} />
        <Route path="/menu/new" element={<ProtectedRoute perms={['menu.manage']}><MenuFormPage /></ProtectedRoute>} />
        <Route path="/menu/:id/edit" element={<ProtectedRoute perms={['menu.manage']}><MenuFormPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute perms={['menu.manage']}><CategoryListPage /></ProtectedRoute>} />
        <Route path="/categories/new" element={<ProtectedRoute perms={['menu.manage']}><CategoryFormPage /></ProtectedRoute>} />
        <Route path="/categories/:id/edit" element={<ProtectedRoute perms={['menu.manage']}><CategoryFormPage /></ProtectedRoute>} />

        {/* Money */}
        <Route path="/payments/process/:orderId" element={<ProtectedRoute perms={['payment.create']}><ProcessPaymentPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute perms={['payment.view']}><PaymentListPage /></ProtectedRoute>} />
        <Route path="/payments/daily-sales" element={<ProtectedRoute perms={['report.view']}><DailySalesPage /></ProtectedRoute>} />
        <Route path="/payments/:id" element={<ProtectedRoute perms={['payment.view']}><PaymentDetailPage /></ProtectedRoute>} />

        {/* Staff and roles */}
        <Route path="/users" element={<ProtectedRoute perms={['staff.view']}><UserListPage /></ProtectedRoute>} />
        <Route path="/users/new" element={<ProtectedRoute perms={['staff.manage']}><UserFormPage /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute perms={['staff.view']}><UserDetailPage /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute perms={['role.manage']}><RoleManagementPage /></ProtectedRoute>} />
      </Route>

      {/* Error routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
