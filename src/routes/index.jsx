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
import OverviewPage from '../pages/dashboard/OverviewPage';
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

const allStaff = ['admin', 'manager', 'waiter', 'chef', 'kitchen_staff'];
const adminManager = ['admin', 'manager'];
const kitchenRoles = ['admin', 'manager', 'chef', 'kitchen_staff'];

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

      {/* Dashboard routes (protected) */}
      <Route element={<ProtectedRoute allowedRoles={allStaff}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute allowedRoles={adminManager}><OverviewPage /></ProtectedRoute>} />
        <Route path="/dashboard/real-time" element={<RealTimePage />} />

        {/* Orders */}
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/kitchen" element={<ProtectedRoute allowedRoles={kitchenRoles}><KitchenQueuePage /></ProtectedRoute>} />

        {/* Menu */}
        <Route path="/menu" element={<ProtectedRoute allowedRoles={adminManager}><MenuListPage /></ProtectedRoute>} />
        <Route path="/menu/new" element={<ProtectedRoute allowedRoles={adminManager}><MenuFormPage /></ProtectedRoute>} />
        <Route path="/menu/:id/edit" element={<ProtectedRoute allowedRoles={adminManager}><MenuFormPage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute allowedRoles={adminManager}><CategoryListPage /></ProtectedRoute>} />
        <Route path="/categories/new" element={<ProtectedRoute allowedRoles={adminManager}><CategoryFormPage /></ProtectedRoute>} />
        <Route path="/categories/:id/edit" element={<ProtectedRoute allowedRoles={adminManager}><CategoryFormPage /></ProtectedRoute>} />

        {/* Tables */}
        <Route path="/tables" element={<TableListPage />} />
        <Route path="/tables/new" element={<ProtectedRoute allowedRoles={adminManager}><TableFormPage /></ProtectedRoute>} />
        <Route path="/tables/:id/edit" element={<ProtectedRoute allowedRoles={adminManager}><TableFormPage /></ProtectedRoute>} />
        <Route path="/tables/qr" element={<QRManagementPage />} />

        {/* Payments */}
        <Route path="/payments" element={<PaymentListPage />} />
        <Route path="/payments/daily-sales" element={<ProtectedRoute allowedRoles={adminManager}><DailySalesPage /></ProtectedRoute>} />
        <Route path="/payments/process/:orderId" element={<ProcessPaymentPage />} />
        <Route path="/payments/:id" element={<PaymentDetailPage />} />

        {/* Users */}
        <Route path="/users" element={<ProtectedRoute allowedRoles={adminManager}><UserListPage /></ProtectedRoute>} />
        <Route path="/users/new" element={<ProtectedRoute allowedRoles={['admin']}><UserFormPage /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute allowedRoles={adminManager}><UserDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/roles" element={<ProtectedRoute allowedRoles={['admin']}><RoleManagementPage /></ProtectedRoute>} />

        {/* Password */}
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Error routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
