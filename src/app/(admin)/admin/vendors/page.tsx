/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Trash2, Plus, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/admin/vendors');
      setVendors(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onCreateVendor = async (data: any) => {
    try {
      // Format address to match schema structure
      const payload = {
        ...data,
        address: {
            details: data.address_details,
            city: data.city,
            postalCode: data.postalCode
        }
      };

      await api.post('/admin/vendors', payload);
      toast.success("Vendor account created successfully!");
      setIsCreateOpen(false);
      reset();
      fetchVendors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create vendor");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure? This will delete the vendor and their products.")) return;
    try {
      await api.delete(`/admin/vendors/${id}`);
      toast.success("Vendor deleted");
      setVendors(prev => prev.filter(v => v._id !== id));
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading vendors...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Store className="h-6 w-6 text-blue-600" /> Vendor Management
           </h1>
           <p className="text-slate-500 text-sm">Manage separate vendor accounts.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="h-4 w-4" /> Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Register New Vendor</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onCreateVendor)} className="space-y-4 py-2">
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Store Name</Label>
                     <Input {...register('store_name', { required: true })} placeholder="e.g. Tech World" />
                   </div>
                   <div className="space-y-2">
                     <Label>Phone</Label>
                     <Input {...register('phone', { required: true })} placeholder="017..." />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label>Email</Label>
                   <Input type="email" {...register('email', { required: true })} placeholder="vendor@nexus.com" />
                </div>

                <div className="space-y-2">
                   <Label>Password</Label>
                   <Input type="password" {...register('password', { required: true })} />
                </div>

                <div className="space-y-2 border-t pt-2 mt-2">
                   <Label className="text-xs font-bold text-slate-500 uppercase">Address Info</Label>
                   <Input {...register('address_details')} placeholder="Street Address" className="mb-2" />
                   <div className="grid grid-cols-2 gap-4">
                      <Input {...register('city')} placeholder="City" />
                      <Input {...register('postalCode')} placeholder="Postal Code" />
                   </div>
                </div>

                <Button type="submit" className="w-full mt-4">Create Account</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Store Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">No vendors found.</TableCell>
                </TableRow>
            ) : (
                vendors.map((vendor) => (
                <TableRow key={vendor._id}>
                    <TableCell className="font-medium text-slate-900">
                        {vendor.store_name}
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col text-sm">
                            <span>{vendor.email}</span>
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                <Phone size={10} /> {vendor.phone || 'N/A'}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin size={12} />
                            {vendor.addresses?.[0]?.city || 'N/A'}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Verified
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(vendor._id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}