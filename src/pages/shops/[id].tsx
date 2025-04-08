import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase, Shop, Product } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StarIcon, MapPinIcon, PhoneIcon, ClockIcon, ArrowLeftIcon } from 'lucide-react';

export default function ShopDetailPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAgeVerified } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    // Redirect to age verification if user is not age verified
    if (user && !isAgeVerified) {
      router.push('/age-verification');
      return;
    }

    if (id) {
      fetchShopAndProducts();
    }
  }, [id, user, isAgeVerified, router]);

  const fetchShopAndProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch shop details
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (shopError) {
        throw shopError;
      }

      setShop(shopData as Shop);

      // Fetch products for this shop
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', id)
        .eq('is_available', true)
        .order('name');

      if (productsError) {
        throw productsError;
      }

      const products = productsData as Product[];
      setProducts(products);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(products.map(product => product.category)));
      setCategories(uniqueCategories);
    } catch (err: any) {
      console.error('Error fetching shop details:', err);
      setError('Failed to load shop details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Skeleton loaders
  const ShopSkeleton = () => (
    <>
      <Skeleton className="h-48 w-full mb-6" />
      <div className="px-4">
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        <Skeleton className="h-10 w-full mb-6" />
      </div>
    </>
  );

  const ProductSkeleton = () => (
    <Card>
      <Skeleton className="h-40 w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/4" />
      </CardHeader>
      <CardContent className="pb-2">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <>
      <Head>
        <title>{shop ? `${shop.name} - VapeRush` : 'Shop Details - VapeRush'}</title>
        <meta name="description" content={shop?.description || 'Shop details on VapeRush'} />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {loading ? (
            <ShopSkeleton />
          ) : error ? (
            <div className="container mx-auto px-4 py-12 text-center">
              <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
                {error}
              </div>
              <Button onClick={() => router.push('/shops')}>
                Back to Shops
              </Button>
            </div>
          ) : shop ? (
            <>
              <div 
                className="h-48 w-full bg-cover bg-center relative"
                style={{ 
                  backgroundImage: shop.banner_url 
                    ? `url(${shop.banner_url})` 
                    : 'url(/images/rect.png)' 
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <Button 
                  variant="ghost" 
                  className="absolute top-4 left-4 text-white hover:bg-black/20"
                  onClick={() => router.push('/shops')}
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back
                </Button>
              </div>

              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div className="flex items-center mb-4 md:mb-0">
                    {shop.logo_url && (
                      <div 
                        className="h-16 w-16 rounded-full bg-cover bg-center border-4 border-background -mt-8 mr-4 relative z-10" 
                        style={{ backgroundImage: `url(${shop.logo_url})` }}
                      />
                    )}
                    <div>
                      <h1 className="text-3xl font-bold">{shop.name}</h1>
                      {shop.rating && (
                        <div className="flex items-center space-x-1 mt-1">
                          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{shop.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button className="w-full md:w-auto">
                    Start Order
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <MapPinIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Location</h3>
                          <p className="text-sm text-muted-foreground">
                            {shop.address}, {shop.city}, {shop.state} {shop.zip}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <PhoneIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Contact</h3>
                          <p className="text-sm text-muted-foreground">
                            {shop.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shop.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Delivery Time</h3>
                          <p className="text-sm text-muted-foreground">
                            {shop.delivery_time || 'Varies'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">Products</h2>
                  
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-6 flex flex-wrap h-auto">
                      <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
                        All
                      </TabsTrigger>
                      {categories.map(category => (
                        <TabsTrigger 
                          key={category} 
                          value={category}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    <TabsContent value={selectedCategory} className="mt-0">
                      {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredProducts.map(product => (
                            <Card key={product.id} className="overflow-hidden">
                              <div 
                                className="h-40 w-full bg-cover bg-center" 
                                style={{ 
                                  backgroundImage: product.image_url 
                                    ? `url(${product.image_url})` 
                                    : 'url(/images/rect.png)' 
                                }}
                              />
                              <CardHeader className="pb-2">
                                <h3 className="font-bold">{product.name}</h3>
                                <p className="text-blue-500 font-medium">${product.price.toFixed(2)}</p>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {product.description}
                                </p>
                              </CardContent>
                              <CardFooter>
                                <Button className="w-full">Add to Cart</Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <h3 className="text-xl font-medium mb-2">No products found</h3>
                          <p className="text-muted-foreground">
                            This shop doesn't have any products in this category yet.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </>
  );
}