import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <ShieldOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">You don't have permission to access this page.</p>
        <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
      </div>
    </div>
  );
}
