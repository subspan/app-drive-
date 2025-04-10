import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Store, Upload } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Shop name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  address: z.string().min(5, {
    message: "Address is required.",
  }),
  city: z.string().min(2, {
    message: "City is required.",
  }),
  state: z.string().min(2, {
    message: "State is required.",
  }),
  zip: z.string().min(5, {
    message: "ZIP code is required.",
  }),
  phone: z.string().min(10, {
    message: "Valid phone number is required.",
  }),
  email: z.string().email({
    message: "Valid email is required.",
  }),
  delivery_time: z.string().min(1, {
    message: "Delivery time estimate is required.",
  }),
});

export default function RegisterShop() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: profile?.phone || "",
      email: user?.email || "",
      delivery_time: "30-45 minutes",
    },
  });
  
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/register-shop');
      return;
    }
  }, [user, router]);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };
  
  const uploadImage = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let logoUrl = '';
      let bannerUrl = '';
      
      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'shop-images');
      }
      
      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'shop-images');
      }
      
      // Insert shop record
      const { data, error } = await supabase
        .from('shops')
        .insert([
          {
            name: values.name,
            description: values.description,
            logo_url: logoUrl,
            banner_url: bannerUrl,
            address: values.address,
            city: values.city,
            state: values.state,
            zip: values.zip,
            phone: values.phone,
            email: values.email,
            owner_id: user.id,
            delivery_time: values.delivery_time,
          },
        ])
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update user role to shop_owner if not already
      if (profile?.role !== 'shop_owner' && profile?.role !== 'admin') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'shop_owner' })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating user role:', updateError);
        }
      }
      
      // Redirect to shop dashboard
      router.push('/shop-dashboard');
    } catch (err) {
      console.error('Error registering shop:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Register Shop | VapeRush</title>
        <meta name="description" content="Register your shop on VapeRush" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Register Your Shop</h1>
              <p className="text-muted-foreground">
                Join VapeRush as a shop owner and start selling your products
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>
                  Provide details about your shop to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shop Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Shop Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shop Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="shop@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shop Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your shop and what you sell..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="logo">Shop Logo</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="h-20 w-20 rounded-md border border-border flex items-center justify-center overflow-hidden">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                            ) : (
                              <Store className="h-10 w-10 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <Button type="button" variant="outline" onClick={() => document.getElementById('logo')?.click()}>
                              <Upload className="mr-2 h-4 w-4" /> Upload Logo
                            </Button>
                            <input
                              id="logo"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoChange}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              Recommended: 500x500px, PNG or JPG
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="banner">Shop Banner</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="h-20 w-40 rounded-md border border-border flex items-center justify-center overflow-hidden">
                            {bannerPreview ? (
                              <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
                            ) : (
                              <Store className="h-10 w-10 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <Button type="button" variant="outline" onClick={() => document.getElementById('banner')?.click()}>
                              <Upload className="mr-2 h-4 w-4" /> Upload Banner
                            </Button>
                            <input
                              id="banner"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleBannerChange}
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              Recommended: 1200x400px, PNG or JPG
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="ZIP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="delivery_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Delivery Time</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 30-45 minutes" {...field} />
                            </FormControl>
                            <FormDescription>
                              Average time for delivery in your area
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Registering...' : 'Register Shop'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}