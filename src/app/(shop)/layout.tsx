import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import { ShoppingBag, Truck, ShieldCheck, Headphones } from 'lucide-react';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      {/* Alignment Fix: Max-width wrapper applied here too */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Professional Footer */}
     <Footer/>
    </div>
  );
}