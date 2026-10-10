"use client";

import Link from "next/link";
import { AddProductForm } from "@/components/products/AddProductForm";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";

export default function AddProductPage() {
  const { can } = usePermissions();

  if (!can("products.create")) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          You do not have permission to add products.
        </p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  return <AddProductForm />;
}
