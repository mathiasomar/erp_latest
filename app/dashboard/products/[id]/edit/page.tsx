"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EditProductForm } from "@/components/products/EditProductForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";
import { useProduct } from "@/hooks/use-product";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const { can } = usePermissions();

  if (isLoading) {
    return (
      <div className="max-w-5xl space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  if (!can("products.edit")) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          You do not have permission to edit products.
        </p>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/products/${product.id}`}>
            Back to product
          </Link>
        </Button>
      </div>
    );
  }

  return <EditProductForm product={product} />;
}
