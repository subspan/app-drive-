import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user, isAgeVerified } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to age verification if user is not age verified
    if (user && !isAgeVerified) {
      router.push('/age-verification');
      return;
    }
  }, [user, isAgeVerified, router]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const shopId = item.product.shop_id;
    if (!acc[shopId]) {
      acc[shopId] = [];
    }
    acc[shopId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const cartTotal = getCartTotal();

  return (
    <>
      <Head>
        <title>Your Cart - VapeRush</title>
        <meta name="description" content="View and manage your cart items" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <h1 className="text-3xl font-bold">Your Cart</h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <ShoppingCartIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button onClick={() => router.push('/shops')}>
                Browse Shops
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {Object.entries(groupedItems).map(([shopId, shopItems]) => (
                  <Card key={shopId} className="mb-6">
                    <CardHeader className="pb-2">
                      <h2 className="text-xl font-bold">{shopItems[0].product.shop_id}</h2>
                    </CardHeader>
                    <CardContent>
                      {shopItems.map(({ product, quantity }) => (
                        <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b last:border-0">
                          <div 
                            className="w-20 h-20 rounded-md bg-cover bg-center mr-4 mb-4 sm:mb-0" 
                            style={{ 
                              backgroundImage: product.image_url 
                                ? `url(${product.image_url})` 
                                : 'url(/images/rect.png)' 
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                            <p className="text-blue-500 font-medium">${product.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center mt-4 sm:mt-0">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(product.id, quantity - 1)}
                            >
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              value={quantity} 
                              onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                              className="h-8 w-12 mx-2 text-center"
                              min="1"
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(product.id, quantity + 1)}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 ml-2 text-red-500"
                              onClick={() => removeFromCart(product.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <h2 className="text-xl font-bold">Order Summary</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>$5.00</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${(cartTotal + 5).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => router.push('/checkout')}
                      disabled={items.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </CardFooter>
                </Card>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}