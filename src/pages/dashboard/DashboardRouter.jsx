import useAuth from '../../hooks/useAuth';
import OverviewPage from './OverviewPage';
import WaiterDashboard from './WaiterDashboard';
import KitchenDashboard from './KitchenDashboard';

const KITCHEN_ROLES = ['chef', 'kitchen_staff'];

export default function DashboardRouter() {
  const { user } = useAuth();
  const role = user?.role?.name;

  if (role === 'waiter') return <WaiterDashboard />;
  if (KITCHEN_ROLES.includes(role)) return <KitchenDashboard />;
  return <OverviewPage />;
}
