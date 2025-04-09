import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, PackageOpen, Search, Filter, SlidersHorizontal } from 'lucide-react';

type Order = {
  id: string;
  user_id: string;
  shop_id: string;
  driver_id: string | null;
  status: string;
  total: number;
  delivery_address: string;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
};

type StatusFilter = 'all' | 'active' | 'completed' | 'cancelled';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState('newest');
  
  const { user, isAgeVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to age verification if user is not age verified
    if (user && !isAgeVerified) {
      router.push('/age-verification');
      return;
    }

    if (user) {
      fetchOrders();
    } else {
      router.push('/login?redirect=/orders');
    }
  }, [user, isAgeVerified, router]);

  useEffect(() => {
    if (orders.length > 0) {
      applyFilters();
    }
  }, [orders, searchQuery, statusFilter, sortOption]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(order => 
          ['pending', 'accepted', 'preparing', 'ready', 'picked_up'].includes(order.status)
        );
      } else if (statusFilter === 'completed') {
        result = result.filter(order => order.status === 'delivered');
      } else if (statusFilter === 'cancelled') {
        result = result.filter(order => order.status === 'cancelled');
      }
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.delivery_address.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOption === 'highest') {
      result.sort((a, b) => b.total - a.total);
    } else if (sortOption === 'lowest') {
      result.sort((a, b) => a.total - b.total);
    }

    setFilteredOrders(result);
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

  return (
    <>
      <Head>
        <title>Your Orders - VapeRush</title>
        <meta name="description" content="View your order history" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Your Orders</h1>
            <Button onClick={() => router.push('/shops')}>
              Continue Shopping
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading your orders...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <PackageOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-medium mb-2">No orders yet</h2>
                  <p className="text-muted-foreground mb-6">
                    You haven't placed any orders yet. Start shopping to place your first order!
                  </p>
                  <Button onClick={() => router.push('/shops')}>
                    Browse Shops
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Filters and Search */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest first</SelectItem>
                          <SelectItem value="oldest">Oldest first</SelectItem>
                          <SelectItem value="highest">Highest amount</SelectItem>
                          <SelectItem value="lowest">Lowest amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All orders</SelectItem>
                          <SelectItem value="active">Active orders</SelectItem>
                          <SelectItem value="completed">Completed orders</SelectItem>
                          <SelectItem value="cancelled">Cancelled orders</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <h2 className="text-xl font-medium mb-2">No matching orders</h2>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your filters or search query
                      </p>
                      <Button variant="outline" onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setSortOption('newest');
                      }}>
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 pb-2">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Order #{order.id.substring(0, 8).toUpperCase()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()} at{' '}
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <Badge className={getStatusBadgeColor(order.status)}>
                              {formatStatus(order.status)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium">Total: ${order.total.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Delivery to: {order.delivery_address}
                            </p>
                          </div>
                          <div className="flex space-x-2 mt-4 md:mt-0">
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              Track Order
                            </Button>
                            <Button
                              onClick={() => router.push(`/orders/${order.id}/confirmation`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}