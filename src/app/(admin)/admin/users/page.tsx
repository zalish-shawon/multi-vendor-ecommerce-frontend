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
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Edit, UserPlus, Store } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Edit State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('');

  // Create Form Hook
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: CREATE USER ---
  const onCreateUser = async (data: any) => {
    if(!data.role) return toast.error("Please select a role");
    
    try {
      await api.post('/admin/users', data);
      toast.success(`${data.role} profile created successfully!`);
      setIsCreateOpen(false);
      reset(); 
      fetchUsers(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  // --- HANDLER: UPDATE ROLE ---
  const handleUpdateRole = async () => {
    try {
      await api.put('/admin/users/role', {
        userId: selectedUser._id,
        role: newRole
      });
      toast.success("User role updated successfully");
      setIsEditOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if(!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'DELIVERY': return 'bg-orange-100 text-orange-700 border-orange-200';
      // Vendor case removed as they are no longer Users
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) return <div className="p-10 text-center">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
           <p className="text-slate-500 text-sm">Manage Customers, Admins, and Delivery staff.</p>
        </div>
        
        <div className="flex gap-2">
            {/* Link to Separate Vendor Management Page */}
            <Link href="/admin/vendors">
                <Button variant="outline" className="gap-2">
                    <Store className="h-4 w-4" /> Manage Vendors
                </Button>
            </Link>

            {/* --- CREATE USER BUTTON --- */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <UserPlus className="h-4 w-4" /> Create User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4 py-2">
                    
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input {...register('name', { required: true })} placeholder="e.g. John Doe" />
                    </div>

                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input type="email" {...register('email', { required: true })} placeholder="user@nexus.com" />
                    </div>

                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" {...register('password', { required: true })} placeholder="••••••" />
                    </div>

                    <div className="space-y-2">
                        <Label>Assign Role</Label>
                        <Select onValueChange={(val) => setValue('role', val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="DELIVERY">Delivery Man</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            {/* ❌ VENDOR Removed: Create vendors in Vendor Management instead */}
                        </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full mt-4">Create User</Button>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="flex items-center gap-3 font-medium">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImg} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadge(user.role)} variant="outline">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* EDIT ROLE */}
                    <Dialog open={isEditOpen && selectedUser?._id === user._id} onOpenChange={(open) => {
                        setIsEditOpen(open);
                        if(open) { setSelectedUser(user); setNewRole(user.role); }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Change Role</DialogTitle></DialogHeader>
                        <div className="py-4 space-y-4">
                           <Select value={newRole} onValueChange={setNewRole}>
                             <SelectTrigger><SelectValue /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="CUSTOMER">Customer</SelectItem>
                               <SelectItem value="DELIVERY">Delivery</SelectItem>
                               <SelectItem value="ADMIN">Admin</SelectItem>
                               {/* ❌ VENDOR Removed */}
                             </SelectContent>
                           </Select>
                           <Button onClick={handleUpdateRole} className="w-full">Save Changes</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* DELETE */}
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteUser(user._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}