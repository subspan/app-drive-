import React from 'react';
import { useRouter } from 'next/router';
import { Shop } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const router = useRouter();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div 
        className="h-40 w-full bg-cover bg-center" 
        style={{ 
          backgroundImage: shop.banner_url 
            ? `url(${shop.banner_url})` 
            : 'url(/images/rect.png)' 
        }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {shop.logo_url && (
              <div 
                className="h-10 w-10 rounded-full bg-cover bg-center border border-border" 
                style={{ backgroundImage: `url(${shop.logo_url})` }}
              />
            )}
            <h3 className="font-bold text-lg">{shop.name}</h3>
          </div>
          {shop.rating && (
            <div className="flex items-center space-x-1">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{shop.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{shop.description}</p>
        <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{shop.city}, {shop.state}</span>
          {shop.delivery_time && (
            <>
              <span>•</span>
              <span>{shop.delivery_time} delivery</span>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => router.push(`/shops/${shop.id}`)}
        >
          View Shop
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShopCard;