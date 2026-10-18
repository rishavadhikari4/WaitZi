import { Icon } from '@iconify/react';
import khalti from '../../../assets/payments/khalti.svg';
import fonepay from '../../../assets/payments/fonepay.png';
import nepalpay from '../../../assets/payments/nepalpay.png';

// Official logos, fetched from each brand's own site.
const LOGOS = { Khalti: khalti, Fonepay: fonepay, NepalPay: nepalpay };

export default function PayLogo({ name, className = 'h-8' }) {
  if (name === 'Card') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <Icon icon="logos:visa" className="h-full w-auto" />
        <Icon icon="logos:mastercard" className="h-full w-auto" />
      </span>
    );
  }
  if (LOGOS[name]) return <img src={LOGOS[name]} alt={name} className={`${className} w-auto object-contain`} />;
  return (
    <span className={`inline-flex items-center gap-1.5 font-display font-bold text-green-700 text-xl ${className}`}>
      <Icon icon="mdi:cash-multiple" className="h-full w-auto" />{name}
    </span>
  );
}
