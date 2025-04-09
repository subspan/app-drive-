import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  experience: string;
  availability: string;
  whyJoin: string;
};

const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  licenseNumber: '',
  licenseExpiry: '',
  vehicleType: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  vehicleColor: '',
  experience: '',
  availability: '',
  whyJoin: '',
};

export default function BecomeDriver() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Pre-fill form data if user is logged in
  React.useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      }));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
        setError('Please fill in all required fields');
        return false;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.licenseNumber || !formData.licenseExpiry || !formData.vehicleType) {
        setError('Please fill in all required fields');
        return false;
      }
      
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.licenseExpiry)) {
        setError('Please enter license expiry date in YYYY-MM-DD format');
        return false;
      }
      
      // Check if license is not expired
      const today = new Date();
      const expiryDate = new Date(formData.licenseExpiry);
      if (expiryDate <= today) {
        setError('Your driver\'s license appears to be expired');
        return false;
      }
    }
    
    if (step === 3) {
      if (!formData.experience || !formData.availability || !formData.whyJoin) {
        setError('Please fill in all required fields');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // If user is not logged in, create an account first
      if (!user) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + '!', // Generate a random password
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        });
        
        if (signUpError) throw signUpError;
        
        if (data.user) {
          // Create profile record
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email: formData.email,
              full_name: formData.fullName,
              phone: formData.phone,
              address: formData.address,
              is_age_verified: false,
              role: 'driver',
            },
          ]);
          
          if (profileError) throw profileError;
          
          // Create driver record
          const { error: driverError } = await supabase.from('drivers').insert([
            {
              id: data.user.id,
              license_number: formData.licenseNumber,
              license_expiry: formData.licenseExpiry,
              vehicle_type: formData.vehicleType,
              vehicle_make: formData.vehicleMake,
              vehicle_model: formData.vehicleModel,
              vehicle_year: parseInt(formData.vehicleYear) || null,
              vehicle_color: formData.vehicleColor,
              is_active: false,
              is_verified: false,
            },
          ]);
          
          if (driverError) throw driverError;
        }
      } else {
        // User is already logged in, update their role and create driver record
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'driver', phone: formData.phone, address: formData.address })
          .eq('id', user.id);
        
        if (profileError) throw profileError;
        
        // Check if driver record already exists
        const { data: existingDriver } = await supabase
          .from('drivers')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (existingDriver) {
          // Update existing driver record
          const { error: driverError } = await supabase
            .from('drivers')
            .update({
              license_number: formData.licenseNumber,
              license_expiry: formData.licenseExpiry,
              vehicle_type: formData.vehicleType,
              vehicle_make: formData.vehicleMake,
              vehicle_model: formData.vehicleModel,
              vehicle_year: parseInt(formData.vehicleYear) || null,
              vehicle_color: formData.vehicleColor,
              is_active: false,
              is_verified: false,
            })
            .eq('id', user.id);
          
          if (driverError) throw driverError;
        } else {
          // Create new driver record
          const { error: driverError } = await supabase.from('drivers').insert([
            {
              id: user.id,
              license_number: formData.licenseNumber,
              license_expiry: formData.licenseExpiry,
              vehicle_type: formData.vehicleType,
              vehicle_make: formData.vehicleMake,
              vehicle_model: formData.vehicleModel,
              vehicle_year: parseInt(formData.vehicleYear) || null,
              vehicle_color: formData.vehicleColor,
              is_active: false,
              is_verified: false,
            },
          ]);
          
          if (driverError) throw driverError;
        }
      }
      
      // Store additional information in a separate table or as metadata
      const { error: applicationError } = await supabase.from('driver_applications').insert([
        {
          user_id: user?.id || 'pending', // If user is not logged in yet, use 'pending'
          experience: formData.experience,
          availability: formData.availability,
          why_join: formData.whyJoin,
          status: 'pending',
        },
      ]);
      
      if (applicationError) throw applicationError;
      
      setSuccess(true);
      setCurrentStep(4); // Move to success step
    } catch (error: any) {
      console.error('Error submitting driver application:', error);
      setError(error.message || 'An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Become a Driver | VapeRush</title>
        <meta name="description" content="Apply to become a delivery driver for VapeRush" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Become a VapeRush Driver</h1>
              <p className="text-muted-foreground">
                Join our team of delivery drivers and earn money on your own schedule.
              </p>
            </div>
            
            {currentStep < 4 && (
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}
                      >
                        {step}
                      </div>
                      <span className="text-xs mt-2 text-muted-foreground">
                        {step === 1 ? 'Personal Info' : step === 2 ? 'Vehicle Details' : 'Experience'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relative mt-2">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                    <div 
                      className="h-1 bg-blue-600 transition-all duration-300" 
                      style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Please provide your contact details so we can get in touch with you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john.doe@example.com"
                          required
                          disabled={!!user} // Disable if user is logged in
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(123) 456-7890"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="123 Main St, City, State, ZIP"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="button" onClick={nextStep}>Next</Button>
                  </CardFooter>
                </Card>
              )}
              
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle & License Information</CardTitle>
                    <CardDescription>
                      Please provide details about your driver's license and vehicle.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">Driver's License Number *</Label>
                        <Input
                          id="licenseNumber"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          placeholder="DL12345678"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="licenseExpiry">License Expiry Date *</Label>
                        <Input
                          id="licenseExpiry"
                          name="licenseExpiry"
                          type="date"
                          value={formData.licenseExpiry}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type *</Label>
                      <Select 
                        value={formData.vehicleType} 
                        onValueChange={(value) => handleSelectChange('vehicleType', value)}
                      >
                        <SelectTrigger id="vehicleType">
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="bicycle">Bicycle</SelectItem>
                          <SelectItem value="scooter">Scooter</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleMake">Vehicle Make</Label>
                        <Input
                          id="vehicleMake"
                          name="vehicleMake"
                          value={formData.vehicleMake}
                          onChange={handleChange}
                          placeholder="Toyota"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Vehicle Model</Label>
                        <Input
                          id="vehicleModel"
                          name="vehicleModel"
                          value={formData.vehicleModel}
                          onChange={handleChange}
                          placeholder="Corolla"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleYear">Vehicle Year</Label>
                        <Input
                          id="vehicleYear"
                          name="vehicleYear"
                          type="number"
                          value={formData.vehicleYear}
                          onChange={handleChange}
                          placeholder="2020"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vehicleColor">Vehicle Color</Label>
                        <Input
                          id="vehicleColor"
                          name="vehicleColor"
                          value={formData.vehicleColor}
                          onChange={handleChange}
                          placeholder="Black"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                    <Button type="button" onClick={nextStep}>Next</Button>
                  </CardFooter>
                </Card>
              )}
              
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Experience & Availability</CardTitle>
                    <CardDescription>
                      Tell us about your delivery experience and availability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Delivery Experience *</Label>
                      <Select 
                        value={formData.experience} 
                        onValueChange={(value) => handleSelectChange('experience', value)}
                      >
                        <SelectTrigger id="experience">
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No prior experience</SelectItem>
                          <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-2">1-2 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5+">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability *</Label>
                      <Select 
                        value={formData.availability} 
                        onValueChange={(value) => handleSelectChange('availability', value)}
                      >
                        <SelectTrigger id="availability">
                          <SelectValue placeholder="Select your availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekdays">Weekdays only</SelectItem>
                          <SelectItem value="weekends">Weekends only</SelectItem>
                          <SelectItem value="evenings">Evenings only</SelectItem>
                          <SelectItem value="full-time">Full-time availability</SelectItem>
                          <SelectItem value="part-time">Part-time availability</SelectItem>
                          <SelectItem value="flexible">Flexible schedule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whyJoin">Why do you want to join VapeRush? *</Label>
                      <Textarea
                        id="whyJoin"
                        name="whyJoin"
                        value={formData.whyJoin}
                        onChange={handleChange}
                        placeholder="Tell us why you'd like to become a VapeRush driver..."
                        rows={4}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-center">Application Submitted!</CardTitle>
                    <CardDescription className="text-center">
                      Thank you for applying to be a VapeRush driver. We've received your application and will review it shortly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        <strong>What happens next?</strong><br />
                        Our team will review your application and contact you within 2-3 business days. 
                        You may be asked to provide additional documentation or attend a brief orientation session.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button onClick={() => router.push('/')}>Return to Home</Button>
                  </CardFooter>
                </Card>
              )}
            </form>
          </div>
        </main>
      </div>
    </>
  );
}