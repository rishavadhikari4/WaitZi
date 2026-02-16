import useAuth from '../../hooks/useAuth';
import OverviewPage from './OverviewPage';
import WaiterDashboard from './WaiterDashboard';
import KitchenDashboard from './KitchenDashboard';

export default function DashboardRouter() {
  const { user } = useAuth();
  const role = user?.role?.name;

  switch (role) {
    case 'admin':
    case 'manager':
      return <OverviewPage />;
    case 'waiter':
      return <WaiterDashboard />;
    case 'chef':
    case 'kitchen_staff':
      return <KitchenDashboard />;
    default:
      return <WaiterDashboard />;
  }
}
