import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { CartProvider } from '@/context/CartContext'; // <--- Import this

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NexusMarket - Premium Tech Store',
  description: 'The best place to buy electronics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider> {/* <--- WRAP HERE */}
           {children}
           <Toaster position="top-center" richColors />
        </CartProvider> {/* <--- END WRAP */}
      </body>
    </html>
  );
}