import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase, Product, Shop } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import SearchFilters, { FilterOptions } from '@/components/SearchFilters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { 
  SearchIcon, 
  SlidersHorizontal,
  XCircle,
  ShoppingBag
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type ProductWithShop = Product & { shop?: Shop };

export default function SearchPage() {
  const [products, setProducts] = useState<ProductWithShop[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 100],
    availability: true,
  });

  const { user, isAgeVerified } = useAuth();
  const router = useRouter();
  const { q } = router.query;

  useEffect(() => {
    // Redirect to age verification if user is not age verified
    if (user && !isAgeVerified) {
      router.push('/age-verification');
      return;
    }

    // Set search query from URL if present
    if (q && typeof q === 'string') {
      setSearchQuery(q);
    }

    fetchProductsAndShops();
  }, [user, isAgeVerified, router, q]);

  const fetchProductsAndShops = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) {
        throw productsError;
      }

      // Fetch all shops
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (shopsError) {
        throw shopsError;
      }

      const allProducts = productsData as Product[];
      const allShops = shopsData as Shop[];
      
      // Add shop data to products
      const productsWithShops = allProducts.map(product => {
        const shop = allShops.find(s => s.id === product.shop_id);
        return { ...product, shop };
      });

      setProducts(productsWithShops);
      setShops(allShops);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(allProducts.map(product => product.category)));
      setCategories(uniqueCategories);

      // Find min and max prices
      if (allProducts.length > 0) {
        const prices = allProducts.map(p => p.price);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setMinPrice(min);
        setMaxPrice(max);
        setFilters(prev => ({
          ...prev,
          priceRange: [min, max]
        }));
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search query
    router.push({
      pathname: '/search',
      query: { q: searchQuery }
    }, undefined, { shallow: true });
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [minPrice, maxPrice],
      availability: true,
    });
  };

  // Apply filters to products
  const filteredProducts = products.filter(product => {
    // Text search
    const matchesSearch = 
      searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shop?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = 
      filters.categories.length === 0 || 
      filters.categories.includes(product.category);
    
    // Price range filter
    const matchesPrice = 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1];
    
    // Availability filter
    const matchesAvailability = 
      !filters.availability || 
      product.is_available;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
  });

  // Skeleton loader for products
  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/6" />
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );

  return (
    <>
      <Head>
        <title>Search Products - VapeRush</title>
        <meta name="description" content="Search for CBD and vape products" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Search Products</h1>
            <p className="text-muted-foreground">
              Find CBD and vape products from local shops
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters - Desktop */}
            <div className="hidden lg:block">
              <SearchFilters
                allCategories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </div>

            {/* Products */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name, description, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button type="submit">Search</Button>
                
                {/* Filters - Mobile */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="py-4">
                      <SearchFilters
                        allCategories={categories}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={clearFilters}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </form>

              {/* Active filters display */}
              {(filters.categories.length > 0 || 
                filters.priceRange[0] > minPrice || 
                filters.priceRange[1] < maxPrice ||
                !filters.availability) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.categories.map(category => (
                    <Button
                      key={category}
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          categories: prev.categories.filter(c => c !== category)
                        }));
                      }}
                    >
                      {category}
                      <XCircle className="h-3 w-3 ml-1" />
                    </Button>
                  ))}
                  
                  {(filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice) && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          priceRange: [minPrice, maxPrice]
                        }));
                      }}
                    >
                      ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      <XCircle className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                  
                  {!filters.availability && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          availability: true
                        }));
                      }}
                    >
                      Include out of stock
                      <XCircle className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        shop={product.shop}
                        showShopInfo={true}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? `No products match "${searchQuery}" with the selected filters.` 
                      : "No products match the selected filters."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {searchQuery && (
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </Button>
                    )}
                    {(filters.categories.length > 0 || 
                      filters.priceRange[0] > minPrice || 
                      filters.priceRange[1] < maxPrice ||
                      !filters.availability) && (
                      <Button onClick={clearFilters}>
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}