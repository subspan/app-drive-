import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Package, ShoppingBag, TrendingUp, Store, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Shop = {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  banner_url: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  owner_id: string;
  is_active: boolean;
  rating: number;
  delivery_time: string;
  created_at: string;
  updated_at: string;
};

type Product = {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

type Order = {
  id: string;
  user_id: string;
  shop_id: string;
  driver_id: string | null;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total: number;
  delivery_address: string;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name: string;
    phone: string;
  };
};

export default function ShopDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/shop-dashboard');
      return;
    }
    
    if (profile && profile.role !== 'shop_owner' && profile.role !== 'admin') {
      router.push('/');
      return;
    }
    
    const fetchShopOwnerData = async () => {
      try {
        // Fetch shops owned by the user
        const { data: shopsData, error: shopsError } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id);
        
        if (shopsError) {
          console.error('Error fetching shops:', shopsError);
          setError('Failed to load your shops');
        } else if (shopsData && shopsData.length > 0) {
          setShops(shopsData as Shop[]);
          setSelectedShop(shopsData[0] as Shop);
          
          // Fetch products for the first shop
          fetchProducts(shopsData[0].id);
          
          // Fetch orders for the first shop
          fetchOrders(shopsData[0].id);
        }
      } catch (error) {
        console.error('Error in fetchShopOwnerData:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopOwnerData();
  }, [user, profile, router]);
  
  const fetchProducts = async (shopId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId);
      
      if (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } else {
        setProducts(data as Product[]);
      }
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      setError('An unexpected error occurred');
    }
  };
  
  const fetchOrders = async (shopId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user_profile:profiles(full_name, phone)
        `)
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders');
      } else {
        setOrders(data as Order[]);
      }
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      setError('An unexpected error occurred');
    }
  };
  
  const handleShopChange = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      setSelectedShop(shop);
      fetchProducts(shop.id);
      fetchOrders(shop.id);
    }
  };
  
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) {
        console.error('Error updating order status:', error);
        setError('Failed to update order status');
      } else {
        // Refresh orders after update
        if (selectedShop) {
          fetchOrders(selectedShop.id);
        }
      }
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      setError('An unexpected error occurred');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300">Accepted</Badge>;
      case 'preparing':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-300">Preparing</Badge>;
      case 'ready':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Ready</Badge>;
      case 'picked_up':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-300">Picked Up</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (loading) {
    return (
      <>
        <Head>
          <title>Shop Dashboard | VapeRush</title>
        </Head>
        <div className="bg-background min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <p>Loading your shop information...</p>
            </div>
          </main>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>Shop Dashboard | VapeRush</title>
        <meta name="description" content="VapeRush shop owner dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Shop Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage your shop, products, and orders
                </p>
              </div>
              
              {shops.length > 0 && (
                <div className="mt-4 md:mt-0">
                  <select 
                    className="p-2 border rounded-md bg-background text-foreground"
                    value={selectedShop?.id}
                    onChange={(e) => handleShopChange(e.target.value)}
                  >
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {shops.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Shops Found</CardTitle>
                  <CardDescription>
                    You don't have any shops registered yet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    To start selling on VapeRush, you need to register your shop.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => router.push('/register-shop')}>Register a Shop</Button>
                </CardFooter>
              </Card>
            ) : (
              <>
                {selectedShop && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex flex-col space-y-1.5">
                          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        </div>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex flex-col space-y-1.5">
                          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        </div>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {orders.filter(order => ['pending', 'accepted', 'preparing'].includes(order.status)).length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex flex-col space-y-1.5">
                          <CardTitle className="text-sm font-medium">Shop Status</CardTitle>
                        </div>
                        <Store className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {selectedShop.is_active ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300">Inactive</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <Tabs defaultValue="orders" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="orders" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Recent Orders</h2>
                    </div>
                    
                    {orders.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-6">
                            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                            <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
                            <p className="text-muted-foreground mt-2">When customers place orders, they'll appear here.</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                                <TableCell>
                                  {formatDate(order.created_at)}
                                  <div className="text-xs text-muted-foreground">{formatTime(order.created_at)}</div>
                                </TableCell>
                                <TableCell>{order.user_profile?.full_name || 'Unknown'}</TableCell>
                                <TableCell>{formatCurrency(order.total)}</TableCell>
                                <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    {order.status === 'pending' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                                      >
                                        Accept
                                      </Button>
                                    )}
                                    {order.status === 'accepted' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                                      >
                                        Start Preparing
                                      </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => updateOrderStatus(order.id, 'ready')}
                                      >
                                        Mark Ready
                                      </Button>
                                    )}
                                    {['pending', 'accepted'].includes(order.status) && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                      >
                                        Cancel
                                      </Button>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => router.push(`/orders/${order.id}`)}
                                    >
                                      View
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="products" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Products</h2>
                      <Button onClick={() => router.push('/products/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                      </Button>
                    </div>
                    
                    {products.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-6">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                            <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
                            <p className="text-muted-foreground mt-2">Add products to your shop to start selling.</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{formatCurrency(product.price)}</TableCell>
                                <TableCell>
                                  {product.is_available ? (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Available</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300">Unavailable</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => router.push(`/products/${product.id}/edit`)}
                                    >
                                      Edit
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => router.push(`/products/${product.id}`)}
                                    >
                                      View
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}