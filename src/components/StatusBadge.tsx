
import { ItemStatus } from '@/types';
import { cn } from '@/lib/utils';
import {
  Check,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface StatusBadgeProps {
  status: ItemStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case ItemStatus.AVAILABLE:
        return {
          color: 'bg-status-available text-green-800 border-green-300',
          icon: <Check className="h-3 w-3" />,
          label: 'Disponível'
        };
      case ItemStatus.BORROWED:
        return {
          color: 'bg-status-borrowed text-amber-800 border-amber-300',
          icon: <Clock className="h-3 w-3" />,
          label: 'Emprestado'
        };
      case ItemStatus.DAMAGED:
        return {
          color: 'bg-status-damaged text-white border-red-500',
          icon: <AlertTriangle className="h-3 w-3" />,
          label: 'Danificado'
        };
      case ItemStatus.MAINTENANCE:
        return {
          color: 'bg-status-maintenance text-gray-100 border-gray-500',
          icon: <Clock className="h-3 w-3" />,
          label: 'Em manutenção'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: null,
          label: status
        };
    }
  };

  const { color, icon, label } = getStatusConfig();

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
      color,
      className
    )}>
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </span>
  );
};

export default StatusBadge;
