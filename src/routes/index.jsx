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

// Any authenticated staff member — waiter/chef/kitchen_staff included — can reach
// these; pages that show privileged actions (edit/delete) already gate those
// buttons internally via isAdmin/isManager checks.
const staffRoles = ['admin', 'manager', 'waiter', 'chef', 'kitchen_staff'];
// Editing menu/tables/categories and viewing financial records: no internal
// per-page gating exists on these forms, so the route itself is the boundary.
const manageRoles = ['admin', 'manager'];
// Staff accounts and role/permission management: most sensitive, admin only.
const adminOnly = ['admin'];

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth routes */}
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Public ordering routes */}
      <Route element={<PublicLayout />}>
        <Route path="/order/table/:tableNumber" element={<OrderPage />} />
        <Route path="/order/table/:tableNumber/cart" element={<CartPage />} />
        <Route path="/order/table/:tableNumber/confirm" element={<OrderConfirmation />} />
        <Route path="/order/table/:tableNumber/track" element={<OrderTracking />} />
        <Route path="/order/table/:tableNumber/payment-result" element={<PaymentResult />} />
        <Route path="/order/payment-result" element={<PaymentResult />} />
      </Route>

      {/* Dashboard shell — one instance, mounted once any staff role is in.
          Individual routes below re-check tighter roles so the sidebar/socket
          connections in DashboardLayout don't remount when crossing tiers. */}
      <Route element={<ProtectedRoute allowedRoles={staffRoles}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/dashboard/live" element={<RealTimePage />} />

        {/* Orders */}
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/kitchen" element={<KitchenQueuePage />} />

        {/* Tables (view is staff-wide; TableListPage itself hides edit/delete unless admin/manager) */}
        <Route path="/tables" element={<TableListPage />} />

        {/* Payment processing from an order — any staff can take payment */}
        <Route path="/payments/process/:orderId" element={<ProcessPaymentPage />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Menu (no internal role gating on the forms — route is the boundary) */}
        <Route path="/menu" element={<ProtectedRoute allowedRoles={manageRoles}><MenuListPage /></ProtectedRoute>} />
        <Route path="/menu/new" element={<ProtectedRoute allowedRoles={manageRoles}><MenuFormPage /></ProtectedRoute>} />
        <Route path="/menu/:id/edit" element={<ProtectedRoute allowedRoles={manageRoles}><MenuFormPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute allowedRoles={manageRoles}><CategoryListPage /></ProtectedRoute>} />
        <Route path="/categories/new" element={<ProtectedRoute allowedRoles={manageRoles}><CategoryFormPage /></ProtectedRoute>} />
        <Route path="/categories/:id/edit" element={<ProtectedRoute allowedRoles={manageRoles}><CategoryFormPage /></ProtectedRoute>} />

        {/* Tables management */}
        <Route path="/tables/new" element={<ProtectedRoute allowedRoles={manageRoles}><TableFormPage /></ProtectedRoute>} />
        <Route path="/tables/:id/edit" element={<ProtectedRoute allowedRoles={manageRoles}><TableFormPage /></ProtectedRoute>} />
        <Route path="/tables/qr" element={<ProtectedRoute allowedRoles={manageRoles}><QRManagementPage /></ProtectedRoute>} />

        {/* Payments records */}
        <Route path="/payments" element={<ProtectedRoute allowedRoles={manageRoles}><PaymentListPage /></ProtectedRoute>} />
        <Route path="/payments/daily-sales" element={<ProtectedRoute allowedRoles={manageRoles}><DailySalesPage /></ProtectedRoute>} />
        <Route path="/payments/:id" element={<ProtectedRoute allowedRoles={manageRoles}><PaymentDetailPage /></ProtectedRoute>} />

        {/* Staff accounts and role/permission management: most sensitive, admin only */}
        <Route path="/users" element={<ProtectedRoute allowedRoles={adminOnly}><UserListPage /></ProtectedRoute>} />
        <Route path="/users/new" element={<ProtectedRoute allowedRoles={adminOnly}><UserFormPage /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute allowedRoles={adminOnly}><UserDetailPage /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute allowedRoles={adminOnly}><RoleManagementPage /></ProtectedRoute>} />
      </Route>

      {/* Error routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
