import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface OrderStatusTrackerProps {
  status: string;
  className?: string;
}

export default function OrderStatusTracker({ status, className = '' }: OrderStatusTrackerProps) {
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'picked_up': return 4;
      case 'delivered': return 5;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'ready':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'picked_up':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const currentStep = getStatusStep(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Order Status</h3>
        <Badge className={getStatusBadgeColor(status)}>
          {formatStatus(status)}
        </Badge>
      </div>

      {isCancelled ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-center">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
          <p className="text-destructive font-medium">This order has been cancelled</p>
        </div>
      ) : (
        <div className="relative">
          <div className="flex justify-between mb-2">
            <div className="text-center w-1/6">
              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${currentStep >= 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
              <p className="text-xs mt-1">Placed</p>
            </div>
            <div className="text-center w-1/6">
              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
              <p className="text-xs mt-1">Accepted</p>
            </div>
            <div className="text-center w-1/6">
              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
              <p className="text-xs mt-1">Preparing</p>
            </div>
            <div className="text-center w-1/6">
              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>4</div>
              <p className="text-xs mt-1">Ready</p>
            </div>
            <div className="text-center w-1/6">
              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>5</div>
              <p className="text-xs mt-1">Picked Up</p>
            </div>
            <div className="text-center w-1/6">
              <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${currentStep >= 5 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>6</div>
              <p className="text-xs mt-1">Delivered</p>
            </div>
          </div>
          <div className="absolute top-3 left-[8.3%] right-[8.3%] h-1 bg-muted">
            <div 
              className="h-full bg-primary" 
              style={{ 
                width: `${Math.min(100, Math.max(0, currentStep * 20))}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}