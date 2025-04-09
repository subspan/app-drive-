import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MapPin, Phone, Clock, Package, Truck, AlertCircle } from 'lucide-react';
import OrderStatusTracker from '@/components/OrderStatusTracker';

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [shop, setShop] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id && user) {
      fetchOrderDetails();
    }
  }, [id, user]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (orderError) {
        throw orderError;
      }

      setOrder(orderData);

      // Fetch order items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id (id, name, price, image_url)
        `)
        .eq('order_id', id);

      if (itemsError) {
        throw itemsError;
      }

      setOrderItems(itemsData);

      // Fetch shop details
      if (orderData.shop_id) {
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('id', orderData.shop_id)
          .single();

        if (shopError) {
          console.error('Error fetching shop details:', shopError);
        } else {
          setShop(shopData);
        }
      }

      // Fetch driver details if assigned
      if (orderData.driver_id) {
        const { data: driverData, error: driverError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', orderData.driver_id)
          .single();

        if (driverError) {
          console.error('Error fetching driver details:', driverError);
        } else {
          setDriver(driverData);
        }
      }
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <>
        <Head>
          <title>Order Details - VapeRush</title>
        </Head>
        <div className="bg-background min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-medium">Loading order details...</h2>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Head>
          <title>Order Not Found - VapeRush</title>
        </Head>
        <div className="bg-background min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h2 className="text-2xl font-medium mb-2">Order Not Found</h2>
                  <p className="text-muted-foreground mb-6">
                    {error || 'We couldn\'t find the order you\'re looking for.'}
                  </p>
                  <Button onClick={() => router.push('/orders')}>
                    Back to Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </>
    );
  }



  return (
    <>
      <Head>
        <title>Order Details - VapeRush</title>
        <meta name="description" content="View your order details" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/orders')}
              className="mr-4"
            >
              ← Back to Orders
            </Button>
            <h1 className="text-3xl font-bold">Order Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Tracker */}
              <Card>
                <CardHeader className="pb-2">
                  <h2 className="text-xl font-semibold">Order Status</h2>
                </CardHeader>
                <CardContent>
                  <OrderStatusTracker status={order.status} />
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="pb-2">
                  <h2 className="text-xl font-semibold">Order Items</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div 
                          className="w-16 h-16 rounded-md bg-cover bg-center mr-4" 
                          style={{ 
                            backgroundImage: item.product?.image_url 
                              ? `url(${item.product.image_url})` 
                              : 'url(/images/rect.png)' 
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${(order.total - order.delivery_fee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>${order.delivery_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader className="pb-2">
                  <h2 className="text-xl font-semibold">Order Information</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="font-medium">{order.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">
                        {new Date(order.created_at).toLocaleDateString()} at {' '}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium">Cryptocurrency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card>
                <CardHeader className="pb-2">
                  <h2 className="text-xl font-semibold">Delivery Information</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Address</p>
                        <p className="font-medium">{order.delivery_address}</p>
                      </div>
                    </div>

                    {driver && (
                      <div className="flex items-start">
                        <Truck className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Driver</p>
                          <p className="font-medium">{driver.full_name}</p>
                          {driver.phone && (
                            <p className="text-sm">{driver.phone}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {shop && (
                      <div className="flex items-start">
                        <Package className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Shop</p>
                          <p className="font-medium">{shop.name}</p>
                          {shop.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {shop.phone}
                            </div>
                          )}
                          {shop.delivery_time && (
                            <div className="flex items-center text-sm">
                              <Clock className="h-3 w-3 mr-1" />
                              Est. delivery time: {shop.delivery_time}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardHeader className="pb-2">
                  <h2 className="text-xl font-semibold">Need Help?</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have any questions or issues with your order, please contact customer support.
                  </p>
                  <Button className="w-full">Contact Support</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}