import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function OrderConfirmation() {
  const { tableNumber } = useParams();

  return (
    <div className="text-center py-10 space-y-6">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <div>
        <h2 className="text-2xl font-bold">Order Placed!</h2>
        <p className="text-gray-500 mt-2">Your order has been sent to the kitchen.</p>
      </div>
      <div className="space-y-3">
        <Link to={`/order/table/${tableNumber}/track`}>
          <Button className="w-full">Track Your Order</Button>
        </Link>
        <Link to={`/order/table/${tableNumber}`}>
          <Button variant="secondary" className="w-full mt-2">Order More</Button>
        </Link>
      </div>
    </div>
  );
}
