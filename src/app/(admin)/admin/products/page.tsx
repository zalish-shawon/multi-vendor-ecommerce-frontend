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
import { Trash2, Edit, Plus, Loader2, X, Upload, PlusCircle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Dialog States
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Images State
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Specifications State
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      const productList = res.data.products ? res.data.products : res.data;
      setProducts(Array.isArray(productList) ? productList : []);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category || 'Uncategorized')));

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // --- FILE HANDLERS ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setNewFiles((prev) => [...prev, ...fileArray]);
    const newPreviewUrls = fileArray.map(file => URL.createObjectURL(file));
    setNewPreviews((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- SPECS HANDLERS ---
  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const updateSpec = (index: number, field: 'key' | 'value', text: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = text;
    setSpecs(newSpecs);
  };

  // --- SUBMIT HANDLER ---
  const onSubmit = async (data: any) => {
    try {
      if (existingImages.length === 0 && newFiles.length === 0) {
        return toast.error("Please add at least one image");
      }

      setIsUploading(true);
      
      const uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'nexus_preset'); 
          const res = await fetch('https://api.cloudinary.com/v1_1/dr9ebtvd6/image/upload', {
            method: 'POST', body: formData
          });
          const cloudData = await res.json();
          return cloudData.secure_url;
        });
        const results = await Promise.all(uploadPromises);
        uploadedUrls.push(...results);
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      const specsObject = specs.reduce((acc: any, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {});

      const payload = { ...data, images: finalImages, specifications: specsObject };

      if (isEditing && currentId) {
        await api.put(`/admin/products/${currentId}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post('/admin/products', payload);
        toast.success("Product created successfully");
      }
      
      closeDialog();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (product: any) => {
    setIsEditing(true);
    setCurrentId(product._id);
    setValue('name', product.name);
    setValue('price', product.price);
    setValue('category', product.category);
    setValue('stock', product.stock);
    setValue('description', product.description);
    setExistingImages(product.images || []);
    setNewFiles([]); 
    setNewPreviews([]);

    if (product.specifications) {
      const specsData = product.specifications instanceof Map 
         ? Object.fromEntries(product.specifications) 
         : product.specifications;
      const loadedSpecs = Object.entries(specsData || {}).map(([key, value]) => ({
        key, value: String(value)
      }));
      setSpecs(loadedSpecs);
    } else {
      setSpecs([]);
    }
    setIsOpen(true);
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentId(null);
    reset();
    setExistingImages([]);
    setNewFiles([]);
    setNewPreviews([]);
    setSpecs([]);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setNewFiles([]);
    setNewPreviews([]);
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

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          {/* <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-slate-900 hover:bg-slate-800 gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger> */}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
               {/* FORM CONTENT (Same as before) */}
               <div className="space-y-2">
                  <Label>Product Images</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition">
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" id="img-upload" disabled={isUploading} />
                    <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center gap-2">
                       <Upload className="h-6 w-6 text-slate-400" />
                       <span className="text-sm text-slate-600">Click to Select Images</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                     {existingImages.map((url, index) => (
                       <div key={`old-${index}`} className="relative h-16 w-16 border border-blue-200 rounded overflow-hidden group">
                          <img src={url} className="h-full w-full object-cover" />
                          <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition"><X className="h-3 w-3" /></button>
                       </div>
                     ))}
                     {newPreviews.map((url, index) => (
                       <div key={`new-${index}`} className="relative h-16 w-16 border border-green-300 rounded overflow-hidden group">
                          <div className="absolute top-0 left-0 bg-green-500 text-[8px] text-white px-1">New</div>
                          <img src={url} className="h-full w-full object-cover opacity-80" />
                          <button type="button" onClick={() => removeNewFile(index)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition"><X className="h-3 w-3" /></button>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Product Name</Label><Input {...register('name', { required: true })} /></div>
                 <div className="space-y-2"><Label>Category</Label><Input {...register('category', { required: true })} /></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Price (৳)</Label><Input type="number" {...register('price', { required: true })} /></div>
                 <div className="space-y-2"><Label>Stock</Label><Input type="number" {...register('stock')} /></div>
               </div>
               <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                     <Label className="text-slate-700 font-bold">Technical Specifications</Label>
                     <Button type="button" size="sm" variant="outline" onClick={addSpec} className="h-7 text-xs gap-1"><PlusCircle className="h-3 w-3" /> Add Row</Button>
                  </div>
                  {specs.map((spec, index) => (
                    <div key={index} className="flex gap-2 items-center">
                       <Input placeholder="Key" value={spec.key} onChange={(e) => updateSpec(index, 'key', e.target.value)} className="h-8 text-sm" />
                       <Input placeholder="Value" value={spec.value} onChange={(e) => updateSpec(index, 'value', e.target.value)} className="h-8 text-sm" />
                       <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)} className="h-8 w-8 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
               </div>
               <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} rows={3} /></div>
               <Button type="submit" className="w-full mt-4" disabled={isUploading}>
                 {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : (isEditing ? 'Save Changes' : 'Create Product')}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 👇 FIXED: SMALLER SEARCH AND FILTER BAR */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <div className='flex flex-col md:flex-row justify-center gap-4'>
          {/* Search Input: Restricted width */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            className="flex h-10 w-full md:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        </div>
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
            {filteredProducts.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    No products found.
                 </TableCell>
               </TableRow>
            ) : (
              filteredProducts.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    {item.images?.[0] ? <img src={item.images[0]} className="h-10 w-10 object-cover rounded" /> : <div className="h-10 w-10 bg-slate-100 rounded" />}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>৳{item.price}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4 text-blue-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
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