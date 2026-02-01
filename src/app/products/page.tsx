'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation'; // 👈 IMPORT THIS
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, ShoppingCart, X, PackageOpen 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';


interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams(); // 👈 GET URL PARAMS
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products'); 
        const data = res.data.products ? res.data.products : res.data;
        setProducts(Array.isArray(data) ? data : []);
        
        // 👇 AUTO-SELECT CATEGORY FROM URL
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
          setSelectedCategories([categoryFromUrl]);
        }
      } catch (error) {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]); // Re-run if URL changes

  // ... (Rest of the file remains exactly the same: categories, filteredProducts, return...)
  // Just keeping the logic concise here.
  
  // --- DERIVED DATA ---
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]); 
  }, [products]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const price = product.price;
    const min = priceRange.min ? Number(priceRange.min) : 0;
    const max = priceRange.max ? Number(priceRange.max) : Infinity;
    const matchesPrice = price >= min && price <= max;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <div className="bg-white border-b sticky top-16 z-20 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Shop All</h1>
            <Button 
              variant="outline" size="sm" className="md:hidden gap-2"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 flex gap-8 relative">
          {/* SIDEBAR FILTER */}
          <aside className={`
            fixed inset-0 z-30 bg-white p-6 transform transition-transform duration-300 ease-in-out
            md:relative md:transform-none md:w-64 md:block md:bg-transparent md:p-0 md:h-auto
            ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
             <div className="flex justify-between items-center md:hidden mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}><X className="h-5 w-5" /></Button>
            </div>

            <div className="space-y-8 sticky top-32">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search..." className="pl-9 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Categories</Label>
                <div className="space-y-2">
                  {categories.map(([cat, count]) => (
                    <label key={cat} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`}>
                            {selectedCategories.includes(cat) && <X className="h-3 w-3 text-white" />}
                            <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                          </div>
                          <span className={`text-sm ${selectedCategories.includes(cat) ? 'font-medium text-slate-900' : 'text-slate-600'}`}>{cat}</span>
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Price Range</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="Min" className="bg-white text-sm" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} />
                  <span className="text-slate-400">-</span>
                  <Input type="number" placeholder="Max" className="bg-white text-sm" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} />
                </div>
              </div>
              
              {(searchTerm || selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
                <Button variant="outline" className="w-full text-red-500 hover:bg-red-50" onClick={() => { setSearchTerm(''); setSelectedCategories([]); setPriceRange({ min: '', max: '' }); }}>Clear Filters</Button>
              )}
            </div>
          </aside>

          {/* MAIN GRID */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => <div key={i} className="h-80 bg-slate-200 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <PackageOpen size={64} className="mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold">No products found</h3>
                  <p>Try changing your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="group bg-white rounded-xl border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
                    <Link href={`/product/${product._id}`} className="block relative aspect-[4/5] bg-slate-100 overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><PackageOpen size={48} /></div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.stock <= 0 && <Badge variant="destructive">Out of Stock</Badge>}
                        {product.stock > 0 && product.stock < 5 && <Badge className="bg-orange-500">Low Stock</Badge>}
                      </div>
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none md:pointer-events-auto">
                        <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-900 hover:text-white rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 opacity-0 group-hover:opacity-100 gap-2" onClick={(e) => handleAddToCart(e, product)} disabled={product.stock <= 0}>
                          <ShoppingCart className="h-4 w-4" /> Add to Cart
                        </Button>
                      </div>
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="text-xs text-slate-500 mb-1">{product.category}</div>
                      <Link href={`/products/${product._id}`} className="font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 mb-2">{product.name}</Link>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900">৳{product.price.toLocaleString()}</span>
                        <button onClick={(e) => handleAddToCart(e, product)} className="md:hidden p-2 rounded-full bg-slate-100 text-slate-900" disabled={product.stock <= 0}><ShoppingCart className="h-5 w-5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {showMobileFilters && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setShowMobileFilters(false)} />}
      </main>
      <Footer />
    </div>
  );
}