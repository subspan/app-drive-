import React from 'react';
import { useRouter } from 'next/router';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CartIcon = () => {
  const { getItemCount } = useCart();
  const router = useRouter();
  const itemCount = getItemCount();

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => router.push('/cart')}
        aria-label="Shopping cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-blue-500 text-white"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default CartIcon;