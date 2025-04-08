import React, { useState, useEffect } from 'react';
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

export default function AgeVerification() {
  const [frontIdFile, setFrontIdFile] = useState<File | null>(null);
  const [backIdFile, setBackIdFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAgeVerified, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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

  const handleFrontIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFrontIdFile(e.target.files[0]);
    }
  };

  const handleBackIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBackIdFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!frontIdFile) {
      setError('Front of ID is required');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to verify your age');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload front ID image
      const frontIdFileName = `${user.id}/id-front-${Date.now()}`;
      const { error: frontUploadError, data: frontData } = await supabase.storage
        .from('id-verification')
        .upload(frontIdFileName, frontIdFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (frontUploadError) {
        throw new Error(frontUploadError.message);
      }

      // Upload back ID image if provided
      let backIdUrl = null;
      if (backIdFile) {
        const backIdFileName = `${user.id}/id-back-${Date.now()}`;
        const { error: backUploadError, data: backData } = await supabase.storage
          .from('id-verification')
          .upload(backIdFileName, backIdFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (backUploadError) {
          throw new Error(backUploadError.message);
        }

        const { data: backUrlData } = supabase.storage
          .from('id-verification')
          .getPublicUrl(backData.path);
          
        backIdUrl = backUrlData.publicUrl;
      }

      // Get public URL for front ID
      const { data: frontUrlData } = supabase.storage
        .from('id-verification')
        .getPublicUrl(frontData.path);

      // Create verification record
      const { error: verificationError } = await supabase
        .from('age_verifications')
        .insert([
          {
            user_id: user.id,
            id_front_url: frontUrlData.publicUrl,
            id_back_url: backIdUrl,
            status: 'pending',
          },
        ]);

      if (verificationError) {
        throw new Error(verificationError.message);
      }

      toast({
        title: 'ID submitted successfully',
        description: 'Your ID is being verified. This may take up to 24 hours.',
      });

      router.push('/verification-pending');
    } catch (err: any) {
      setError(err.message || 'An error occurred during ID upload');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <>
      <Head>
        <title>Age Verification - VapeRush</title>
        <meta name="description" content="Verify your age to use VapeRush" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Age Verification</CardTitle>
              <CardDescription>
                Please upload a photo of your government-issued ID to verify you are 21+
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="frontId">Front of ID (Required)</Label>
                  <Input
                    id="frontId"
                    type="file"
                    accept="image/*"
                    onChange={handleFrontIdChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a clear photo of the front of your ID
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backId">Back of ID (Optional)</Label>
                  <Input
                    id="backId"
                    type="file"
                    accept="image/*"
                    onChange={handleBackIdChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    For better verification, you can also upload the back of your ID
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Privacy Notice:</strong> Your ID will only be used for age verification purposes. 
                    We take your privacy seriously and handle your data securely.
                  </p>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Submit for Verification'}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground w-full text-center">
                Verification typically takes 24 hours. You'll be notified once your ID is verified.
              </p>
            </CardFooter>
          </Card>
        </main>
      </div>
    </>
  );
}