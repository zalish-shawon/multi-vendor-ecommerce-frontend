/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Trash2, Home, Star, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AddressPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Load fresh user data from API (not just localStorage) to get latest addresses
    fetchProfile();
  }, []);

  const onSetDefault = async (addressId: string) => {
    try {
      await api.put(`/auth/address/${addressId}/default`);
      toast.success('Default address updated');
      fetchProfile(); // Refresh list to show the new badge
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/getProfile');
      
      // Check if the response is wrapped in a "user" key or if it's the user object directly
      // If your backend returns { user: { name: '...' } }, we must access .user
      const userData = res.data.user || res.data; 

      setUser(userData);
      
      // Save the CLEAN user object to local storage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Force a reload so the Sidebar/Layout updates immediately with correct data
      window.dispatchEvent(new Event('storage')); 
    } catch (err) {
      console.error(err);
    }
  };

  const onAddAddress = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/auth/address', data);
      toast.success('Address added successfully');
      reset();
      setIsDialogOpen(false);
      fetchProfile(); // Refresh list
    } catch (error) {
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/auth/address/${id}`);
      toast.success('Address deleted');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        
        {/* ADD ADDRESS MODAL */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onAddAddress)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Address Details</Label>
                <Input {...register('details', { required: true })} placeholder="House 12, Road 5, Block B" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input {...register('city', { required: true })} placeholder="Dhaka" />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input {...register('postalCode', { required: true })} placeholder="1212" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Address'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ADDRESS LIST */}
      {/* ADDRESS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user?.addresses && user.addresses.length > 0 ? (
          user.addresses.map((addr: any) => (
            <Card 
              key={addr._id} 
              // Add a blue border if it's the default address
              className={`relative group border-2 transition-all ${
                addr.isDefault ? 'border-blue-600 bg-blue-50/30' : 'border-dashed border-slate-200 hover:border-blue-300'
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Home className={`h-4 w-4 ${addr.isDefault ? 'text-blue-600' : 'text-slate-400'}`} />
                  {addr.city}
                  
                  {/* Show "Default" Badge if active */}
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full ml-auto">
                      <Check className="h-3 w-3" /> Default
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-slate-600 text-sm mb-3">{addr.details}</p>
                <p className="text-slate-400 text-xs mb-4">Postal Code: {addr.postalCode}</p>
                
                <div className="flex gap-2">
                   {/* "Set Default" Button (Only show if NOT default) */}
                   {!addr.isDefault && (
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="text-xs h-8"
                       onClick={() => onSetDefault(addr._id)}
                     >
                       <Star className="mr-1 h-3 w-3" /> Set Default
                     </Button>
                   )}

                   {/* Delete Button */}
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 ml-auto"
                     onClick={() => onDeleteAddress(addr._id)}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // ... Empty State (keep existing)
          <div className="col-span-2 text-center py-10 border-2 border-dashed rounded-lg bg-slate-50">
             <MapPin className="mx-auto h-10 w-10 text-slate-300 mb-2" />
             <p className="text-slate-500">No addresses saved yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}