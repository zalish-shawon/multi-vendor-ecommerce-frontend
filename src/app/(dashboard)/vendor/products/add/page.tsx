/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Loader2, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function AddProductPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Image State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Specification State
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' }
  ]);

  const router = useRouter();

  // --- 1. IMAGE HANDLERS (Your UI Logic) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- 2. SPECIFICATION HANDLERS ---
  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const updateSpec = (index: number, field: 'key' | 'value', text: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = text;
    setSpecs(newSpecs);
  };

  // --- 3. CLOUDINARY UPLOAD HELPER ---
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // ⚠️ IMPORTANT: Replace 'nexus_preset' with your ACTUAL Unsigned Upload Preset name
    formData.append('upload_preset', 'nexus_preset'); 

    formData.append('folder', 'multi-vendor-uploads');
    const res = await fetch('https://api.cloudinary.com/v1_1/dr9ebtvd6/image/upload', {
      method: 'POST', body: formData,
    });
    
    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();
    return data.secure_url;
  };

  // --- 4. SUBMIT FUNCTION (Fixed Logic) ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    if (selectedFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    setUploadStatus('Uploading images...');

    try {
      // Step A: Upload Images First
      const imageUrls = await Promise.all(
        selectedFiles.map((file) => uploadToCloudinary(file))
      );

      setUploadStatus('Creating product...');

      // Step B: Filter valid specs (remove empty rows)
      const validSpecs = specs.filter(s => s.key.trim() !== '' && s.value.trim() !== '');

      // Step C: Build the JSON Payload
      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        category: data.category,
        images: imageUrls,       // Send the URLs, not files
        specifications: validSpecs // Send the array
      };

      // Step D: Send to Backend (Note the route change to /vendor/products)
      await api.post('vendor/products/', payload);

      toast.success('Product created successfully!');
      router.push('/vendor/products'); 
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input {...register('name', { required: true })} placeholder="e.g. iPhone 15" />
                {errors.name && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input {...register('category', { required: true })} placeholder="e.g. Electronics" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                {...register('description', { required: true })} 
                placeholder="Describe your product..." 
                className="h-32"
              />
            </div>

            {/* Pricing & Stock */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Price (BDT)</Label>
                <Input type="number" {...register('price', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" {...register('stock', { required: true })} />
              </div>
            </div>

            {/* --- SPECIFICATIONS SECTION --- */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Specifications</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSpec} className="gap-2">
                  <Plus size={14} /> Add Row
                </Button>
              </div>
              
              <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input 
                      placeholder="Key (e.g. RAM)" 
                      value={spec.key} 
                      onChange={(e) => updateSpec(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input 
                      placeholder="Value (e.g. 16GB)" 
                      value={spec.value} 
                      onChange={(e) => updateSpec(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    {specs.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)} className="text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* --- IMAGE UPLOAD SECTION (Your Nice UI) --- */}
            <div className="space-y-2 border-t pt-4">
              <Label>Product Images</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-slate-50/50">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Upload className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    SVG, PNG, JPG or GIF (max. 5 images)
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative group aspect-square border rounded-lg overflow-hidden bg-white shadow-sm">
                      <Image src={src} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  {uploadStatus}
                </div>
              ) : (
                'Create Product'
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}