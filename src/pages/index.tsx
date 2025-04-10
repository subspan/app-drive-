import React from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

export default function Home() {
  const { user, profile, isAgeVerified } = useAuth();
  const router = useRouter();
  
  // Sample featured shops
  const featuredShops = [
    { id: 1, name: "Green Leaf CBD", rating: 4.8, deliveryTime: "15-25 min", image: "/images/rect.png" },
    { id: 2, name: "Vapor Zone", rating: 4.6, deliveryTime: "20-30 min", image: "/images/rect.png" },
    { id: 3, name: "Cloud Nine Vapes", rating: 4.9, deliveryTime: "10-20 min", image: "/images/rect.png" },
  ];

  return (
    <>
      <Head>
        <title>VapeRush - CBD & Vape Delivery</title>
        <meta name="description" content="On-demand delivery from your favorite CBD and vape shops" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                CBD & Vape Delivery <br /> Right To Your Door
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                The fastest way to get your favorite products delivered from local shops
              </p>
              <div className="max-w-xl w-full mx-auto mb-6">
                <form 
                  className="flex" 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector('input');
                    if (input && input.value) {
                      router.push(`/search?q=${encodeURIComponent(input.value)}`);
                    } else {
                      router.push('/search');
                    }
                  }}
                >
                  <input 
                    type="text" 
                    placeholder="Search for CBD, vapes, and more..." 
                    className="flex-1 px-4 py-3 rounded-l-md border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  />
                  <Button type="submit" className="rounded-l-none bg-white text-blue-800 hover:bg-blue-50 h-[50px]">
                    Search
                  </Button>
                </form>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {user ? (
                  isAgeVerified ? (
                    <Button size="lg" className="bg-white text-blue-800 hover:bg-blue-50" onClick={() => router.push('/shops')}>
                      Order Now
                    </Button>
                  ) : (
                    <Button size="lg" className="bg-white text-blue-800 hover:bg-blue-50" onClick={() => router.push('/age-verification')}>
                      Verify Age to Order
                    </Button>
                  )
                ) : (
                  <Button size="lg" className="bg-white text-blue-800 hover:bg-blue-50" onClick={() => router.push('/signup')}>
                    Sign Up to Order
                  </Button>
                )}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-blue-800" 
                  onClick={() => router.push(user && profile?.role === 'driver' ? '/driver-dashboard' : '/become-driver')}
                >
                  {user && profile?.role === 'driver' ? 'Driver Dashboard' : 'Become a Driver'}
                </Button>
                {user && profile && (profile.role === 'customer' || profile.role === 'driver') && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-white border-white hover:bg-blue-800" 
                    onClick={() => router.push('/register-shop')}
                  >
                    Become a Shop Owner
                  </Button>
                )}
              </div>
              <div className="mt-6 text-sm text-blue-200">
                *Age verification required (21+) before ordering
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">How VapeRush Works</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-blue-800/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold mb-4">1</div>
                    <CardTitle>Verify Your Age</CardTitle>
                    <CardDescription>
                      Upload your ID to verify you're 21+ and unlock ordering capabilities
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="border-blue-800/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold mb-4">2</div>
                    <CardTitle>Browse Local Shops</CardTitle>
                    <CardDescription>
                      Explore products from CBD and vape shops in your area
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="border-blue-800/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold mb-4">3</div>
                    <CardTitle>Get Fast Delivery</CardTitle>
                    <CardDescription>
                      Our drivers will deliver your order right to your door
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* Featured Shops Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Featured Shops</h2>
                <Button variant="outline" onClick={() => router.push('/shops')}>View All</Button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {featuredShops.map((shop) => (
                  <Card key={shop.id} className="overflow-hidden">
                    <div className="h-40 bg-muted">
                      <img 
                        src={shop.image} 
                        alt={shop.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{shop.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>⭐ {shop.rating}</span>
                        <span>•</span>
                        <span>{shop.deliveryTime}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button variant="default" className="w-full" onClick={() => router.push('/shops')}>View Shop</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Driver Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">Drivers</Badge>
                  <h2 className="text-3xl font-bold mb-4">Become a VapeRush Driver</h2>
                  <p className="text-muted-foreground mb-6">
                    Make money on your own schedule. Pick and choose which deliveries you want to take and earn competitive pay for each completed delivery.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span> 
                      <span>Choose your own hours</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span> 
                      <span>Get paid weekly</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span> 
                      <span>Select which orders you want to deliver</span>
                    </li>
                  </ul>
                  <Button size="lg" onClick={() => router.push('/become-driver')}>Apply to Drive</Button>
                </div>
                <div className="bg-muted h-80 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    [Driver Image]
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Business Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">For Businesses</Badge>
                <h2 className="text-3xl font-bold mb-4">Partner with VapeRush</h2>
                <p className="text-muted-foreground">
                  Expand your customer base and increase sales by joining our platform. We handle the delivery so you can focus on your products.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reach More Customers</CardTitle>
                    <CardDescription>
                      Expand your reach beyond your physical location
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Increase Sales</CardTitle>
                    <CardDescription>
                      Boost your revenue with our on-demand delivery platform
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Easy Integration</CardTitle>
                    <CardDescription>
                      Simple setup process to get your shop online quickly
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              
              <div className="text-center mt-10">
                <Button size="lg" onClick={() => router.push('/register-shop')}>Partner With Us</Button>
              </div>
            </div>
          </section>

          {/* Age Verification Notice */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-900 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Age Verification Required</h2>
              <p className="mb-6">
                VapeRush is committed to responsible service. All users must verify they are 21+ years of age 
                before placing orders. We use secure ID verification technology to ensure compliance with regulations.
              </p>
              <Button variant="outline" className="border-white text-white hover:bg-blue-800">
                Learn More About Age Verification
              </Button>
            </div>
          </section>
        </main>
        
        {/* Footer */}
        <footer className="bg-background border-t border-border py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">VapeRush</h3>
                <p className="text-muted-foreground text-sm">
                  The fastest way to get CBD and vape products delivered from local shops.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Home</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Shops</a></li>
                  <li><a href="/become-driver" className="text-muted-foreground hover:text-foreground">Become a Driver</a></li>
                  <li><a href="/register-shop" className="text-muted-foreground hover:text-foreground">Partner With Us</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Age Verification</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Contact</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">support@vaperush.com</li>
                  <li className="text-muted-foreground">1-800-VAPE-RUSH</li>
                </ul>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} VapeRush. All rights reserved.</p>
              <p className="mt-2">You must be 21+ to use this service. Please consume responsibly.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}