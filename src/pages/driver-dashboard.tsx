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
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

type DriverApplication = {
  id: string;
  user_id: string;
  experience: string;
  availability: string;
  why_join: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
};

type DriverInfo = {
  license_number: string;
  license_expiry: string;
  vehicle_type: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  is_active: boolean;
  is_verified: boolean;
};

export default function DriverDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<DriverApplication | null>(null);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/driver-dashboard');
      return;
    }
    
    if (profile && profile.role !== 'driver') {
      router.push('/become-driver');
      return;
    }
    
    const fetchDriverData = async () => {
      try {
        // Fetch driver application
        const { data: applicationData, error: applicationError } = await supabase
          .from('driver_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (applicationError && applicationError.code !== 'PGRST116') {
          console.error('Error fetching driver application:', applicationError);
          setError('Failed to load your application data');
        } else if (applicationData) {
          setApplication(applicationData as DriverApplication);
        }
        
        // Fetch driver info
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (driverError && driverError.code !== 'PGRST116') {
          console.error('Error fetching driver info:', driverError);
          setError('Failed to load your driver information');
        } else if (driverData) {
          setDriverInfo(driverData as DriverInfo);
        }
      } catch (error) {
        console.error('Error in fetchDriverData:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverData();
  }, [user, profile, router]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getExperienceText = (code: string) => {
    const experienceMap: Record<string, string> = {
      'none': 'No prior experience',
      'less-than-1': 'Less than 1 year',
      '1-2': '1-2 years',
      '3-5': '3-5 years',
      '5+': '5+ years',
    };
    return experienceMap[code] || code;
  };
  
  const getAvailabilityText = (code: string) => {
    const availabilityMap: Record<string, string> = {
      'weekdays': 'Weekdays only',
      'weekends': 'Weekends only',
      'evenings': 'Evenings only',
      'full-time': 'Full-time availability',
      'part-time': 'Part-time availability',
      'flexible': 'Flexible schedule',
    };
    return availabilityMap[code] || code;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <>
        <Head>
          <title>Driver Dashboard | VapeRush</title>
        </Head>
        <div className="bg-background min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p>Loading your driver information...</p>
            </div>
          </main>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>Driver Dashboard | VapeRush</title>
        <meta name="description" content="VapeRush driver dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Driver Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your driver account and view your application status
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {application ? (
              <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>
                      Submitted on {formatDate(application.created_at)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(application.status)}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                    <div className="flex-shrink-0">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1">
                      {application.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                          <h3 className="font-medium text-yellow-800 mb-2">Your application is being reviewed</h3>
                          <p className="text-yellow-700 text-sm">
                            Our team is currently reviewing your application. This process typically takes 2-3 business days.
                            We'll notify you by email once a decision has been made.
                          </p>
                        </div>
                      )}
                      
                      {application.status === 'approved' && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                          <h3 className="font-medium text-green-800 mb-2">Your application has been approved!</h3>
                          <p className="text-green-700 text-sm">
                            Congratulations! You're now a VapeRush driver. You can start accepting delivery requests
                            once you complete the onboarding process.
                          </p>
                        </div>
                      )}
                      
                      {application.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                          <h3 className="font-medium text-red-800 mb-2">Your application was not approved</h3>
                          <p className="text-red-700 text-sm">
                            {application.rejection_reason || 
                              'Unfortunately, we cannot approve your application at this time. You may reapply after 30 days.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h3 className="font-medium mb-2">Experience</h3>
                      <p className="text-muted-foreground">{getExperienceText(application.experience)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Availability</h3>
                      <p className="text-muted-foreground">{getAvailabilityText(application.availability)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {application.status === 'rejected' && (
                    <Button onClick={() => router.push('/become-driver')}>Reapply</Button>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>No Application Found</CardTitle>
                  <CardDescription>
                    You haven't submitted a driver application yet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    To become a VapeRush driver, you need to complete the application process.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => router.push('/become-driver')}>Apply Now</Button>
                </CardFooter>
              </Card>
            )}
            
            {driverInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Driver Information</CardTitle>
                  <CardDescription>
                    Your vehicle and license details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">License Number</h3>
                      <p className="text-muted-foreground">{driverInfo.license_number}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">License Expiry</h3>
                      <p className="text-muted-foreground">{new Date(driverInfo.license_expiry).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Vehicle Type</h3>
                      <p className="text-muted-foreground">{driverInfo.vehicle_type}</p>
                    </div>
                    {driverInfo.vehicle_make && (
                      <div>
                        <h3 className="font-medium mb-2">Vehicle Make</h3>
                        <p className="text-muted-foreground">{driverInfo.vehicle_make}</p>
                      </div>
                    )}
                    {driverInfo.vehicle_model && (
                      <div>
                        <h3 className="font-medium mb-2">Vehicle Model</h3>
                        <p className="text-muted-foreground">{driverInfo.vehicle_model}</p>
                      </div>
                    )}
                    {driverInfo.vehicle_year && (
                      <div>
                        <h3 className="font-medium mb-2">Vehicle Year</h3>
                        <p className="text-muted-foreground">{driverInfo.vehicle_year}</p>
                      </div>
                    )}
                    {driverInfo.vehicle_color && (
                      <div>
                        <h3 className="font-medium mb-2">Vehicle Color</h3>
                        <p className="text-muted-foreground">{driverInfo.vehicle_color}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Verification Status</h3>
                    <div className="flex items-center gap-2">
                      {driverInfo.is_verified ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">Pending Verification</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Account Status</h3>
                    <div className="flex items-center gap-2">
                      {driverInfo.is_active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => router.push('/become-driver')}>Update Information</Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}