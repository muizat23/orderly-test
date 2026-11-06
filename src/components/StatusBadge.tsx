import type { OrderStatus } from '../types';
import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: OrderStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case 'Pending':
        return 'pending';
      case 'Shipped':
        return 'shipped';
      case 'Delivered':
        return 'delivered';
      case 'Cancelled':
        return 'cancelled';
      case 'VIP':
        return 'vip';
      case 'Low':
        return 'low';
      case 'Near':
        return 'pending';
      case 'OK':
        return 'delivered';
      case 'Admin':
        return 'shipped';
      case 'Staff':
        return 'delivered';
      case 'Viewer':
        return 'pending';
      default:
        return 'outline';
    }
  };

  return (
    <Badge
      variant={getVariant()}
      className={size === 'sm' ? 'px-2 py-0.5 text-[10px]' : undefined}
    >
      {status}
    </Badge>
  );
};
