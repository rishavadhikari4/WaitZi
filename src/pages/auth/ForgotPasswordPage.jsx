import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../api/password';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('Reset email sent');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Check Your Email</h2>
        <p className="text-gray-500">We sent a password reset link to <strong>{email}</strong></p>
        <Link to="/login" className="text-black hover:underline text-sm">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Forgot Password</h2>
      <p className="text-sm text-gray-500 text-center">Enter your email to receive a reset link</p>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@restaurant.com"
        required
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        Send Reset Link
      </Button>
      <p className="text-center text-sm">
        <Link to="/login" className="text-black hover:underline">Back to login</Link>
      </p>
    </form>
  );
}
