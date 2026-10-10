"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/validations/product";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/use-category";
import { useUpdateProduct } from "@/hooks/use-product";
import { BasicInfoTab } from "./form/BasicInfoTab";
import { PricingTab } from "./form/PricingTab";
import { StockTab } from "./form/StockTab";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const toDateInputValue = (value: Date | string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { mutate, isPending } = useUpdateProduct(product.id, () =>
    router.push(`/dashboard/products/${product.id}`),
  );

  const form = useForm<ProductFormValues, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      sku: product.sku,
      barcode: product.barcode ?? "",
      qrCode: product.qrCode ?? "",
      batchNumber: product.batchNumber ?? "",
      expiryDate: toDateInputValue(product.expiryDate),
      unit: product.unit ?? "pcs",
      brand: product.brand ?? "",
      price: product.price,
      lastPrice: product.lastPrice ?? 0,
      costPrice: product.costPrice ?? 0,
      costPriceInclTax: product.costPriceInclTax ?? 0,
      purchaseTaxRate: product.purchaseTaxRate ?? 0,
      taxRate: product.taxRate ?? 0,
      discountRate: product.discountRate ?? 0,
      categoryId: product.categoryId ?? undefined,
      isActive: product.isActive,
      imageUrl: product.imageUrl ?? "",
      stock: {
        quantity: product.stock?.quantity ?? 0,
        lowStockAt: product.stock?.lowStockAt ?? 10,
      },
    } as ProductFormValues,
  });

  // Sync form if product prop changes (e.g. navigating between products)
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? "",
        qrCode: product.qrCode ?? "",
        batchNumber: product.batchNumber ?? "",
        expiryDate: toDateInputValue(product.expiryDate),
        unit: product.unit ?? "pcs",
        brand: product.brand ?? "",
        price: product.price,
        lastPrice: product.lastPrice ?? 0,
        costPrice: product.costPrice ?? 0,
        costPriceInclTax: product.costPriceInclTax ?? 0,
        purchaseTaxRate: product.purchaseTaxRate ?? 0,
        taxRate: product.taxRate ?? 0,
        discountRate: product.discountRate ?? 0,
        categoryId: product.categoryId ?? undefined,
        isActive: product.isActive,
        imageUrl: product.imageUrl ?? "",
        stock: {
          quantity: product.stock?.quantity ?? 0,
          lowStockAt: product.stock?.lowStockAt ?? 10,
        },
      });
    }
  }, [product, form]);

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
            <BreadcrumbLink href={`/dashboard/products/${product.id}`}>
              {product.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-muted-foreground mt-1">
            Update the details for{" "}
            <span className="font-medium text-foreground">{product.name}</span>.
            Fields marked <span className="text-destructive">*</span> are
            required.
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

          {/* Dirty state indicator */}
          {form.formState.isDirty && (
            <p className="text-xs text-muted-foreground text-center">
              You have unsaved changes
            </p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/products/${product.id}`}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending || !form.formState.isDirty}
            >
              {isPending && <Loader2 size={15} className="mr-2 animate-spin" />}
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
      </form>
    </div>
  );
}
