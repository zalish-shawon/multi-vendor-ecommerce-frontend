/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Package, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100'); // Get more items for admin view
      
      // 👇 THE FIX: Check if data has a 'products' property or if it's a direct array
      const productList = res.data.products ? res.data.products : res.data;

      if (Array.isArray(productList)) {
        setProducts(productList);
      } else {
        setProducts([]);
        console.error("Unexpected API response structure:", res.data);
      }
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Handle simple image URL for now (comma separated if multiple)
      const payload = {
        ...data,
        images: data.images ? data.images.split(',').map((s: string) => s.trim()) : []
      };

      if (isEditing && currentId) {
        await api.put(`/admin/products/${currentId}`, payload);
        toast.success("Product updated");
      } else {
        await api.post('/admin/products', payload);
        toast.success("Product created");
      }
      
      setIsOpen(false);
      reset();
      fetchProducts();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (product: any) => {
    setIsEditing(true);
    setCurrentId(product._id);
    setIsOpen(true);
    
    // Fill Form
    setValue('name', product.name);
    setValue('price', product.price);
    setValue('category', product.category);
    setValue('stock', product.stock);
    setValue('description', product.description);
    setValue('images', product.images?.join(', '));
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentId(null);
    reset();
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success("Product deleted");
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-slate-900 hover:bg-slate-800 gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Product Name</Label>
                   <Input {...register('name', { required: true })} placeholder="e.g. Wireless Mouse" />
                 </div>
                 <div className="space-y-2">
                   <Label>Category</Label>
                   <Input {...register('category', { required: true })} placeholder="e.g. Electronics" />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Price (৳)</Label>
                   <Input type="number" {...register('price', { required: true })} placeholder="1200" />
                 </div>
                 <div className="space-y-2">
                   <Label>Stock Qty</Label>
                   <Input type="number" {...register('stock')} placeholder="50" />
                 </div>
               </div>

               <div className="space-y-2">
                 <Label>Image URLs (Comma separated)</Label>
                 <Input {...register('images')} placeholder="https://..., https://..." />
                 <p className="text-[10px] text-slate-400">Paste direct image links here.</p>
               </div>

               <div className="space-y-2">
                 <Label>Description</Label>
                 <Textarea {...register('description')} placeholder="Product details..." />
               </div>

               <Button type="submit" className="w-full mt-4">
                 {isEditing ? 'Save Changes' : 'Create Product'}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt="img" className="h-10 w-10 object-cover rounded bg-slate-100" />
                  ) : (
                    <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell><span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{item.category}</span></TableCell>
                <TableCell>৳{item.price}</TableCell>
                <TableCell>
                  <span className={item.stock < 10 ? 'text-red-500 font-bold' : 'text-slate-600'}>
                    {item.stock}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
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