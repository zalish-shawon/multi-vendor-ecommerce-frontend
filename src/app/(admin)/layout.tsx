/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  LogOut, 
  Menu,
  ShieldCheck, 
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Sidebar = ({ onLogout, pathname }: any) => {
  const links = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'All Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Settings', href: '/admin/profile', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <ShieldCheck className="text-blue-500" />
        <div>
           <h2 className="text-lg font-bold tracking-wider">NEXUS<span className="text-blue-500">ADMIN</span></h2>
           <p className="text-[10px] text-slate-400">SUPER USER ACCESS</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
          <LogOut size={20} /> Logout
        </Button>
      </div>
    </div>
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    // Security Check: Only allow ADMIN role
    if (!currentUser || currentUser.role !== 'ADMIN') {
      router.push('/login'); 
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <Sidebar onLogout={() => AuthService.logout()} pathname={pathname} />
      </aside>

      {/* Mobile Header & Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu /></Button></SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-none">
                <Sidebar onLogout={() => AuthService.logout()} pathname={pathname} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Administrator</span>
            <Avatar>
              <AvatarImage src={user.profileImg} />
              <AvatarFallback className="bg-blue-100 text-blue-700">AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}