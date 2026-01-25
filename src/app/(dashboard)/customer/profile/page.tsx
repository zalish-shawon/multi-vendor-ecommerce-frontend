/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AuthService } from '@/services/auth.service';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Lock, Save } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Form 1: Profile Info
  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile } = useForm();
  
  // Form 2: Password Change
  const { 
    register: registerPass, 
    handleSubmit: handlePassSubmit, 
    reset: resetPass, 
    watch,
    formState: { errors: passErrors } 
  } = useForm();

  // Load User Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/getProfile');
        const userData = res.data.user || res.data;
        setUser(userData);
        
        resetProfile({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address
        });
        
        // Save to local storage to keep sidebar updated
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [resetProfile]);

  // Handler: Update Profile Info
  const onUpdateProfile = async (data: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    if (data.image?.[0]) {
      formData.append('image', data.image[0]);
    }

    try {
      await api.put('/auth/profile', formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile updated successfully');
      // Reload page to show new image if changed
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Change Password
  const onChangePassword = async (data: any) => {
    setPassLoading(true);
    try {
      await api.put('/auth/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully');
      resetPass(); // Clear password fields
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Account Settings</h1>

      {/* --- CARD 1: PERSONAL INFO --- */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your photo and personal details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-slate-100 shadow-sm">
                <AvatarImage src={user?.profileImg} className="object-cover" />
                <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 w-full sm:w-auto">
                <Label htmlFor="picture" className="cursor-pointer text-blue-600 hover:underline">
                    Change Profile Photo
                </Label>
                <Input id="picture" type="file" {...registerProfile('image')} accept="image/*" className="cursor-pointer" />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...registerProfile('name')} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...registerProfile('email')} disabled className="bg-slate-100" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input {...registerProfile('phone')} placeholder="+880..." />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- CARD 2: SECURITY / PASSWORD --- */}
      <Card className="border-red-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-slate-800">
            <Lock className="h-5 w-5 text-slate-500" />
            <CardTitle>Security & Password</CardTitle>
          </div>
          <CardDescription>Ensure your account is secure by using a strong password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4 max-w-md">
            
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input 
                type="password" 
                {...registerPass('currentPassword', { required: 'Required' })} 
                placeholder="••••••••" 
              />
              {passErrors.currentPassword && <span className="text-red-500 text-xs">Required</span>}
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <Input 
                type="password" 
                {...registerPass('newPassword', { 
                   required: 'Required', 
                   minLength: { value: 6, message: 'Min 6 chars' } 
                })} 
                placeholder="••••••••" 
              />
              {passErrors.newPassword && <span className="text-red-500 text-xs">{(passErrors.newPassword as any).message}</span>}
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input 
                type="password" 
                {...registerPass('confirmPassword', { 
                   required: 'Required',
                   validate: (val: string) => {
                     if (watch('newPassword') != val) {
                       return "Passwords do not match";
                     }
                   }
                })} 
                placeholder="••••••••" 
              />
              {passErrors.confirmPassword && <span className="text-red-500 text-xs">{(passErrors.confirmPassword as any).message}</span>}
            </div>

            <Button type="submit" variant="outline" disabled={passLoading} className="w-full sm:w-auto">
              {passLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}