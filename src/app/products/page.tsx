export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading products...</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}