import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase, Shop } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ShopCard from '@/components/ShopCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchIcon, FilterIcon } from 'lucide-react';

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAgeVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to age verification if user is not age verified
    if (user && !isAgeVerified) {
      router.push('/age-verification');
      return;
    }

    fetchShops();
  }, [user, isAgeVerified, router]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      setShops(data as Shop[]);
    } catch (err: any) {
      console.error('Error fetching shops:', err);
      setError('Failed to load shops. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Skeleton loader for shops
  const ShopSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );

  return (
    <>
      <Head>
        <title>Browse Shops - VapeRush</title>
        <meta name="description" content="Browse local CBD and vape shops for delivery" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Browse Shops</h1>
            <p className="text-muted-foreground">
              Find local CBD and vape shops that deliver to your area
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shops by name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ShopSkeleton key={i} />
              ))}
            </div>
          ) : filteredShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No shops found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? `No shops match "${searchQuery}". Try a different search term.` 
                  : "There are no shops available at the moment."}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}