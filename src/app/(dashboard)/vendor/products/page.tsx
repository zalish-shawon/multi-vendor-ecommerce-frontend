/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Image as ImageIcon, Search, Filter, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // --- EDIT & UPLOAD STATE ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  // Image Management for Edit
  const [existingImages, setExistingImages] = useState<string[]>([]); // URLs already on server
  const [newFiles, setNewFiles] = useState<File[]>([]); // New files to upload
  const [newPreviews, setNewPreviews] = useState<string[]>([]); // Previews for new files

  // Specs Management for Edit
  const [editingSpecs, setEditingSpecs] = useState<{ key: string, value: string }[]>([]);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = products;
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }
    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/vendor/products');
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- CLOUDINARY HELPER ---
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'nexus_preset'); 
    formData.append('folder', 'multi-vendor-uploads');
    const res = await fetch('https://api.cloudinary.com/v1_1/dr9ebtvd6/image/upload', {
      method: 'POST', body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Upload failed');
    return data.secure_url;
  };

  // --- 1. OPEN EDIT MODAL ---
  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsEditOpen(true);
    
    // Set Basic Fields
    setValue('name', product.name);
    setValue('price', product.price);
    setValue('stock', product.stock);
    setValue('category', product.category);
    setValue('description', product.description);

    // Set Images (Split into existing URLs)
    setExistingImages(product.images || []);
    setNewFiles([]); // Reset new files
    setNewPreviews([]);

    // Set Specs
    setEditingSpecs(product.specifications && product.specifications.length > 0 
      ? product.specifications 
      : [{ key: '', value: '' }]
    );
  };

  // --- IMAGE HANDLERS (EDIT MODE) ---
  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...filesArray]);
      const urls = filesArray.map(file => URL.createObjectURL(file));
      setNewPreviews(prev => [...prev, ...urls]);
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const removeNewFile = (indexToRemove: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setNewPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // --- 2. SUBMIT UPDATE ---
  const onUpdateProduct = async (data: any) => {
    try {
      setUploading(true);

      // A. Upload NEW files to Cloudinary
      let newImageUrls: string[] = [];
      if (newFiles.length > 0) {
        newImageUrls = await Promise.all(newFiles.map(file => uploadToCloudinary(file)));
      }

      // B. Combine Existing + New
      const finalImages = [...existingImages, ...newImageUrls];

      // C. Prepare Specs
      const validSpecs = editingSpecs.filter(s => s.key.trim() !== '' && s.value.trim() !== '');

      const payload = {
        ...data,
        images: finalImages, // Send the mixed array of URLs
        specifications: validSpecs
      };

      await api.put(`/vendor/products/${editingProduct._id}`, payload);
      
      toast.success("Product Updated Successfully");
      setIsEditOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this product?")) return;
    try {
      await api.delete(`/vendor/products/${id}`);
      toast.success("Product Deleted");
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (e) { toast.error("Failed to delete"); }
  };

  const uniqueCategories = ['All', ...Array.from(new Set(products.map(p => p.category || 'Uncategorized')))];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* HEADER & SEARCH (Same as before) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-bold">My Products</h1></div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input placeholder="Search..." className="pl-9 w-full sm:w-[200px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{uniqueCategories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
          </Select>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/vendor/products/add"><Plus className="h-4 w-4 mr-2" /> Add Product</Link>
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg bg-white shadow-sm">
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
            {filteredProducts.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  {item.images?.[0] ? <img src={item.images[0]} className="h-10 w-10 object-cover rounded" /> : <ImageIcon className="h-6 w-6 text-slate-300" />}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell><span className="text-xs bg-slate-100 px-2 py-1 rounded">{item.category}</span></TableCell>
                <TableCell>৳{item.price}</TableCell>
                <TableCell><span className={item.stock < 5 ? 'text-red-500 font-bold' : ''}>{item.stock}</span></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4 text-blue-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onUpdateProduct)} className="space-y-4 py-2">
            
            <div className="grid gap-4 md:grid-cols-2">
               <div className="space-y-2"><Label>Name</Label><Input {...register('name')} /></div>
               <div className="space-y-2"><Label>Category</Label><Input {...register('category')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label>Price</Label><Input type="number" {...register('price')} /></div>
               <div className="space-y-2"><Label>Stock</Label><Input type="number" {...register('stock')} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>

            {/* --- IMAGE UPLOAD SECTION --- */}
            <div className="space-y-3 border-t pt-4">
                <Label>Images</Label>
                
                {/* 1. Existing Images */}
                {existingImages.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-slate-500">Current Images:</p>
                        <div className="flex gap-2 flex-wrap">
                            {existingImages.map((src, i) => (
                                <div key={i} className="relative group w-20 h-20 border rounded overflow-hidden">
                                    <img src={src} className="object-cover w-full h-full" alt="existing" />
                                    <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. New Uploads */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Add New Images:</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative hover:bg-slate-50">
                    <input type="file" multiple accept="image/*" onChange={handleNewFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                        <Upload className="h-5 w-5 text-slate-400" />
                        <span className="text-xs text-slate-500 mt-1">Click to upload</span>
                    </div>
                  </div>
                  
                  {/* Previews of new files */}
                  {newPreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                        {newPreviews.map((src, i) => (
                            <div key={i} className="relative group w-20 h-20 border rounded overflow-hidden">
                                <img src={src} className="object-cover w-full h-full" alt="new" />
                                <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                                <div className="absolute bottom-0 w-full bg-green-500 text-[8px] text-white text-center">NEW</div>
                            </div>
                        ))}
                    </div>
                  )}
                </div>
            </div>

            {/* --- SPECIFICATIONS SECTION --- */}
            <div className="space-y-2 border-t pt-4">
               <div className="flex justify-between items-center"><Label>Specifications</Label><Button type="button" variant="outline" size="sm" onClick={() => setEditingSpecs([...editingSpecs, { key: '', value: '' }])}>+ Row</Button></div>
               {editingSpecs.map((spec, index) => (
                 <div key={index} className="flex gap-2">
                    <Input value={spec.key} placeholder="Key" onChange={(e) => { const n = [...editingSpecs]; n[index].key = e.target.value; setEditingSpecs(n); }} />
                    <Input value={spec.value} placeholder="Value" onChange={(e) => { const n = [...editingSpecs]; n[index].value = e.target.value; setEditingSpecs(n); }} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setEditingSpecs(editingSpecs.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                 </div>
               ))}
            </div>

            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
               <Button type="submit" disabled={uploading}>
                  {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}