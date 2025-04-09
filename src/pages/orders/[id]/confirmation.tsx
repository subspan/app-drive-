import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
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
          <title>Order Confirmation - VapeRush</title>
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
                  <h2 className="text-2xl font-medium mb-2">Order Not Found</h2>
                  <p className="text-muted-foreground mb-6">
                    {error || 'We couldn\'t find the order you\'re looking for.'}
                  </p>
                  <Button onClick={() => router.push('/shops')}>
                    Continue Shopping
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
        <title>Order Confirmation - VapeRush</title>
        <meta name="description" content="Your order has been confirmed" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold">Order Confirmed!</h1>
              <p className="text-muted-foreground">
                Thank you for your order. Your payment has been received.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Order Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="font-medium">{order.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-2">Delivery Address</h2>
                  <p>{order.delivery_address}</p>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-2">Order Items</h2>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div 
                          className="w-12 h-12 rounded-md bg-cover bg-center mr-3" 
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
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>${(order.total - order.delivery_fee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Delivery Fee</span>
                    <span>${order.delivery_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => router.push('/shops')} className="mr-4">
                Continue Shopping
              </Button>
              <Button variant="outline" onClick={() => router.push('/orders')}>
                View All Orders
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </>
  );
}