'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get('tranId');
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 px-4">
      <Card className="max-w-md w-full shadow-xl border-0 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-700">
            Payment Successful!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-slate-600">
            Thank you for your purchase.
          </p>

          <div className="bg-slate-100 p-4 rounded-lg text-sm break-all">
            <p className="text-muted-foreground mb-1">Transaction ID:</p>
            <p className="font-mono font-bold text-slate-800">
              {tranId || 'N/A'}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" asChild>
            <Link href="/orders">
              View Orders <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}