import useAuth from '../../hooks/useAuth';
import { can } from '../../utils/permissions';
import OverviewPage from './OverviewPage';
import WaiterDashboard from './WaiterDashboard';
import KitchenDashboard from './KitchenDashboard';

/** Picks a home screen from what the role can do, so custom roles work too. */
export default function DashboardRouter() {
  const { user } = useAuth();

  if (can(user, 'report.view')) return <OverviewPage />;
  if (can(user, 'kot.update') && !can(user, 'table.view')) return <KitchenDashboard />;
  return <WaiterDashboard />;
}
