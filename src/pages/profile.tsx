import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Profile() {
  const { user, profile, loading, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user && !loading) {
      router.push('/login');
    }
    
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      
      // Fetch verification status
      fetchVerificationStatus();
    }
  }, [user, profile, loading, router]);

  const fetchVerificationStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('age_verifications')
        .select('status, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching verification status:', error);
        return;
      }
      
      if (data) {
        setVerificationStatus(data.status);
      }
    } catch (err) {
      console.error('Error fetching verification status:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      setError('You must be logged in to update your profile');
      return;
    }
    
    setUpdating(true);
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setUpdating(false);
    }
  };

  const getVerificationBadge = () => {
    if (profile?.is_age_verified) {
      return <Badge className="bg-green-500">Verified</Badge>;
    }
    
    if (verificationStatus === 'pending') {
      return <Badge className="bg-yellow-500">Pending</Badge>;
    }
    
    if (verificationStatus === 'rejected') {
      return <Badge className="bg-red-500">Rejected</Badge>;
    }
    
    return <Badge variant="outline">Not Verified</Badge>;
  };

  if (!user || loading) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile - VapeRush</title>
        <meta name="description" content="Manage your VapeRush profile" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="verification">Age Verification</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main St, City, State, ZIP"
                      />
                    </div>
                    
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    
                    <Button type="submit" disabled={updating}>
                      {updating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <Button variant="destructive" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <CardTitle>Age Verification Status</CardTitle>
                  <CardDescription>
                    Your current verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      <div>{getVerificationBadge()}</div>
                    </div>
                    
                    <Separator />
                    
                    {profile?.is_age_verified ? (
                      <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md">
                        <p className="text-green-700 dark:text-green-300">
                          Your age has been verified. You can now place orders for delivery.
                        </p>
                      </div>
                    ) : verificationStatus === 'pending' ? (
                      <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-md">
                        <p className="text-yellow-700 dark:text-yellow-300">
                          Your verification is currently being processed. This typically takes up to 24 hours.
                        </p>
                      </div>
                    ) : verificationStatus === 'rejected' ? (
                      <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md space-y-4">
                        <p className="text-red-700 dark:text-red-300">
                          Your verification was rejected. Please submit a new ID that clearly shows your face and date of birth.
                        </p>
                        <Button onClick={() => router.push('/age-verification')}>
                          Submit New ID
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          You need to verify your age before you can place orders. Please submit a government-issued ID showing you are 21+.
                        </p>
                        <Button onClick={() => router.push('/age-verification')}>
                          Verify Your Age
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    View your past orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}