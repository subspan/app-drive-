import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';

export default function VerificationPending() {
  const { user, isAgeVerified, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already age verified, redirect to home
    if (isAgeVerified) {
      router.push('/');
    }
    
    // If no user is logged in, redirect to login
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, isAgeVerified, router, loading]);

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <>
      <Head>
        <title>Verification Pending - VapeRush</title>
        <meta name="description" content="Your age verification is pending" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Verification Pending</CardTitle>
              <CardDescription>
                Your ID has been submitted for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">We're reviewing your ID</h3>
                <p className="text-muted-foreground">
                  Your age verification is currently being processed. This typically takes up to 24 hours.
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md text-left mb-6">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc pl-5">
                  <li>Our team will review your submitted ID</li>
                  <li>You'll receive an email notification once verified</li>
                  <li>After verification, you'll have full access to order</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => router.push('/')}>
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </>
  );
}