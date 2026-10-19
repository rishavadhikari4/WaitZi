import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-2">404</h1>
        <p className="text-gray-500 mb-6">Page not found</p>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  );
}
