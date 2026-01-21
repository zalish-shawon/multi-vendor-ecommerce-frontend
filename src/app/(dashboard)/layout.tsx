/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  LogOut, 
  Menu,
  Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- HELPER COMPONENT (Defined Outside) ---
// We pass the data it needs via props
const Sidebar = ({ user, links, pathname, onLogout }: any) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-wider">NEXUS<span className="text-blue-400">MARKET</span></h2>
        <p className="text-xs text-slate-400 mt-1">{user.role} PORTAL</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link: any) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800 gap-2"
          onClick={onLogout}
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </div>
  );
};

// --- MAIN LAYOUT COMPONENT ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!user) return null;

  // Define Links based on Role
  const adminLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/products', label: 'All Products', icon: Package },
    { href: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
  ];

  const vendorLinks = [
    { href: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vendor/products', label: 'My Products', icon: Package },
    { href: '/vendor/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/vendor/reviews', label: 'Reviews', icon: Star },
  ];

  const links = user.role === 'ADMIN' ? adminLinks : vendorLinks;
  const handleLogout = () => AuthService.logout();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <Sidebar user={user} links={links} pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* MOBILE CONTENT & HEADER */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-none">
                <Sidebar user={user} links={links} pathname={pathname} onLogout={handleLogout} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user.name}
            </span>
            <Avatar>
              <AvatarImage src={user.profileImg} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}