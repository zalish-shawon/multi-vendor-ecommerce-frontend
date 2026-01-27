/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, Store, Lock, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vendorData, setVendorData] = useState<any>(null);

  // Forms
  const { register: registerProfile, handleSubmit: handleProfileSubmit, setValue } = useForm();
  const { register: registerPass, handleSubmit: handlePassSubmit, reset: resetPass } = useForm();

  // Image Upload State
  const [uploadingImg, setUploadingImg] = useState(false);
  const [previewImg, setPreviewImg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/vendor/profile');
      const data = res.data;
      setVendorData(data);
      
      // Pre-fill Form
      setValue('store_name', data.store_name);
      setValue('email', data.email); // Read-only
      setValue('phone', data.phone);
      setValue('description', data.description);
      
      // Handle Address (Taking the first/default address)
      if (data.addresses && data.addresses.length > 0) {
        const addr = data.addresses[0];
        setValue('details', addr.details);
        setValue('city', addr.city);
        setValue('postalCode', addr.postalCode);
      }

      setPreviewImg(data.store_logo || '');
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // --- IMAGE UPLOAD ---
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'nexus_preset'); // Your Preset
    
    try {
      // Use your Cloud Name
      const res = await fetch('https://api.cloudinary.com/v1_1/dr9ebtvd6/image/upload', {
        method: 'POST', body: formData
      });
      const data = await res.json();
      setPreviewImg(data.secure_url);
    } catch (error) {
      toast.error("Image upload failed");
    } finally {
      setUploadingImg(false);
    }
  };

  // --- SUBMIT PROFILE ---
  const onProfileUpdate = async (data: any) => {
    setSubmitting(true);
    try {
      // Structure the payload to match Backend Expectation
      const payload = {
        store_name: data.store_name,
        phone: data.phone,
        description: data.description,
        store_logo: previewImg,
        address: {
            details: data.details,
            city: data.city,
            postalCode: data.postalCode,
            isDefault: true
        }
      };

      await api.put('/vendor/profile', payload);
      toast.success("Store profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  // --- SUBMIT PASSWORD ---
  const onPasswordChange = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setSubmitting(true);
    try {
      await api.put('/vendor/profile/password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      toast.success("Password changed successfully");
      resetPass();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Store Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="profile">General Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PROFILE --- */}
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Manage your public store details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-6">
                
                {/* Logo Upload */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border bg-slate-50">
                    <AvatarImage src={previewImg} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold text-slate-400">
                        {vendorData?.store_name?.[0]?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="logo-upload" className="cursor-pointer bg-white border hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition shadow-sm">
                       {uploadingImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                       Upload Logo
                    </Label>
                    <Input id="logo-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    <p className="text-xs text-slate-500">Recommended 500x500px.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Store Name</Label>
                    <div className="relative">
                       <Store className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                       <Input className="pl-9" {...registerProfile('store_name')} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                       <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                       <Input className="pl-9" {...registerProfile('phone')} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                   <Label>Store Description</Label>
                   <Textarea {...registerProfile('description')} placeholder="Tell customers about your shop..." />
                </div>

                {/* Address Section */}
                <div className="space-y-4 border-t pt-4">
                    <Label className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" /> Store Location
                    </Label>
                    <div className="grid grid-cols-1 gap-4">
                       <Input {...registerProfile('details')} placeholder="Street Address / House No." />
                       <div className="grid grid-cols-2 gap-4">
                          <Input {...registerProfile('city')} placeholder="City" />
                          <Input {...registerProfile('postalCode')} placeholder="Postal Code" />
                       </div>
                    </div>
                </div>

                {/* Read Only Email */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-lg border">
                   <Label className="text-xs text-slate-500 uppercase">Login Email</Label>
                   <div className="font-mono text-sm">{vendorData?.email}</div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={submitting || uploadingImg} className="bg-blue-600 hover:bg-blue-700">
                    {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: SECURITY --- */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Ensure your account uses a strong password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePassSubmit(onPasswordChange)} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                     <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                     <Input type="password" className="pl-9" {...registerPass('oldPassword', { required: true })} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                     <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                     <Input type="password" className="pl-9" {...registerPass('newPassword', { required: true, minLength: 6 })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                     <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                     <Input type="password" className="pl-9" {...registerPass('confirmPassword', { required: true })} />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="destructive" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}