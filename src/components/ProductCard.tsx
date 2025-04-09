import React from 'react';
import { useRouter } from 'next/router';
import { Product, Shop } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Store } from 'lucide-react';

type ProductCardProps = {
  product: Product;
  shop?: Shop;
  showShopInfo?: boolean;
};

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  shop, 
  showShopInfo = false 
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  const navigateToShop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (shop) {
      router.push(`/shops/${shop.id}`);
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <div 
        className="h-48 w-full bg-cover bg-center relative cursor-pointer" 
        style={{ 
          backgroundImage: product.image_url 
            ? `url(${product.image_url})` 
            : 'url(/images/rect.png)' 
        }}
        onClick={() => router.push(`/shops/${product.shop_id}?product=${product.id}`)}
      >
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2"
        >
          {product.category}
        </Badge>
      </div>
      
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <h3 
            className="font-bold text-lg cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => router.push(`/shops/${product.shop_id}?product=${product.id}`)}
          >
            {product.name}
          </h3>
          <span className="text-blue-500 font-medium">${product.price.toFixed(2)}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {product.description}
        </p>
        
        {showShopInfo && shop && (
          <div 
            className="flex items-center mt-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={navigateToShop}
          >
            <Store className="h-3.5 w-3.5 mr-1" />
            <span>{shop.name}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          className="w-full"
          onClick={handleAddToCart}
          disabled={!product.is_available}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.is_available ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;