'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw } from 'lucide-react';

export default function PaymentFailPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 px-4">
      <Card className="max-w-md w-full shadow-xl border-0 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 bg-red-100 p-4 rounded-full">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-700">Payment Failed</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            We couldn&apos;t process your payment. This might be due to a network issue or a cancelled transaction.
          </p>
          <p className="text-sm text-slate-500">
            No money has been deducted from your account.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full bg-red-600 hover:bg-red-700 h-12" asChild>
            <Link href="/checkout">
              <RefreshCw className="ml-2 h-4 w-4" /> Try Again
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/contact">
              Contact Support
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}