/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import { AuthService } from '@/services/auth.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Forms
  const { register: registerInfo, handleSubmit: submitInfo } = useForm();
  const { register: registerPass, handleSubmit: submitPass, reset: resetPass } = useForm();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // --- HANDLER: UPDATE INFO ---
  const onUpdateInfo = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.put('/admin/profile', {
        name: data.name || user.name,
        profileImg: data.profileImg || user.profileImg
      });
      
      // Update local storage so the sidebar updates instantly
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Profile updated successfully");
      window.location.reload(); // Quick reload to update header avatars
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: UPDATE PASSWORD ---
  const onUpdatePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setLoading(true);
    try {
      await api.put('/admin/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success("Password changed successfully");
      resetPass();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500 text-sm">Manage your admin profile and security preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        
        {/* --- LEFT: PROFILE DETAILS --- */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="text-blue-600" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your public display name and avatar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitInfo(onUpdateInfo)} className="space-y-4">
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24 border-4 border-slate-100">
                  <AvatarImage src={user.profileImg} />
                  <AvatarFallback className="text-2xl bg-slate-200 text-slate-500">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  defaultValue={user.name} 
                  {...registerInfo('name')} 
                  placeholder="Admin Name" 
                />
              </div>

              <div className="space-y-2">
                <Label>Email (Read Only)</Label>
                <Input value={user.email} disabled className="bg-slate-50 text-slate-500" />
              </div>

              <div className="space-y-2">
                <Label>Avatar URL</Label>
                <Input 
                  defaultValue={user.profileImg} 
                  {...registerInfo('profileImg')} 
                  placeholder="https://..." 
                />
                <p className="text-[10px] text-slate-400">Paste a direct image link.</p>
              </div>

              <Button type="submit" className="w-full bg-slate-900" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --- RIGHT: SECURITY (PASSWORD) --- */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="text-red-500" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Ensure your account stays secure with a strong password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitPass(onUpdatePassword)} className="space-y-4">
              
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input 
                  type="password" 
                  {...registerPass('currentPassword', { required: true })} 
                  placeholder="••••••" 
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password" 
                  {...registerPass('newPassword', { required: true, minLength: 6 })} 
                  placeholder="••••••" 
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input 
                  type="password" 
                  {...registerPass('confirmPassword', { required: true })} 
                  placeholder="••••••" 
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="destructive" className="w-full" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}