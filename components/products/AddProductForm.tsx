"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/use-category";
import { useCreateProduct } from "@/hooks/use-product";
import { BasicInfoTab } from "./form/BasicInfoTab";
import { PricingTab } from "./form/PricingTab";
import { StockTab } from "./form/StockTab";
import { ProductFormValues, productSchema } from "@/lib/validations/product";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const defaultValues: ProductFormValues = {
  name: "",
  sku: "",
  barcode: "",
  qrCode: "",
  batchNumber: "",
  expiryDate: "",
  unit: "pcs",
  brand: "",
  price: 0,
  lastPrice: 0,
  costPrice: 0,
  costPriceInclTax: 0, // ← new: incl. tax
  purchaseTaxRate: 0, // ← new
  taxRate: 0,
  discountRate: 0,
  categoryId: undefined,
  isActive: true,
  imageUrl: "",
  stock: {
    quantity: 0,
    lowStockAt: 10,
  },
};

export function AddProductForm() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { mutate, isPending } = useCreateProduct(() =>
    router.push("/dashboard/products"),
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues as ProductFormValues,
  });

  function onSubmit(values: ProductFormValues) {
    mutate(values);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add Product</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-sm text-muted-foreground mt-1">
            Fill in the details below. Fields marked{" "}
            <span className="text-destructive">*</span> are required.
        </p>
      </header>

      <Separator />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-5">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="flex-1">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex-1">
                Pricing
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex-1">
                Stock
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-0">
              <BasicInfoTab form={form} categories={categories} />
            </TabsContent>

            <TabsContent value="pricing" className="mt-0">
              <PricingTab form={form} />
            </TabsContent>

            <TabsContent value="stock" className="mt-0">
              <StockTab form={form} />
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/products">Cancel</Link>
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 size={15} className="mr-2 animate-spin" />}
              {isPending ? "Saving..." : "Save Product"}
            </Button>
          </div>
      </form>
    </div>
  );
}
