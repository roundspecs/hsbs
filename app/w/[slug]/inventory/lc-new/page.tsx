"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/useAuth";
import { usePermission } from "@/lib/usePermission";
import { getProducts, Product } from "@/lib/products";
import { createLCEntry } from "@/lib/transactions";
import { useRouter, usePathname } from "next/navigation";
import RequirePermission from "@/components/auth/RequirePermission";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const lcEntrySchema = z.object({
    referenceNumber: z.string().min(1, "LC Number is required"),
    date: z.date(),
    items: z.array(z.object({
        productId: z.string().min(1, "Product is required"),
        productName: z.string(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number(),
    })).min(1, "At least one product is required"),
});

type LCEntryFormValues = z.infer<typeof lcEntrySchema>;

function LCEntryContent({ slug }: { slug: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<LCEntryFormValues>({
        resolver: zodResolver(lcEntrySchema),
        defaultValues: {
            referenceNumber: "",
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts(slug);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to load products");
            } finally {
                setLoadingProducts(false);
            }
        };
        if (slug) fetchProducts();
    }, [slug]);

    const onSubmit = async (data: LCEntryFormValues) => {
        if (!user) return;
        setSubmitting(true);
        try {
            const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            await createLCEntry(slug, {
                referenceNumber: data.referenceNumber,
                date: data.date,
                items: data.items,
                totalAmount,
                createdBy: user.uid,
            });

            toast.success("LC Entry created successfully");
            router.push(`/w/${slug}/products`); // Redirect to products or inventory list
            router.refresh();
        } catch (error: any) {
            console.error("Error creating LC Entry:", error);
            toast.error(error.message || "Failed to create LC Entry");
        } finally {
            setSubmitting(false);
        }
    };

    const watchedItems = form.watch("items");
    const selectedProductIds = watchedItems?.map(item => item.productId) || [];

    const totalValue = watchedItems?.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        return sum + (qty * price);
    }, 0) || 0;

    return (
        <div className="max-w-4xl mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">New LC Entry (Stock-In)</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="referenceNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LC Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter LC Number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Products</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ productId: "", productName: "", quantity: 1, unitPrice: 0 })}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-end border p-4 rounded-md bg-card">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.productId`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className={index !== 0 ? "sr-only" : ""}>Product</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "w-full justify-between",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? products.find(
                                                                    (product) => product.id === field.value
                                                                )?.name
                                                                : "Select product"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search product..." />
                                                        <CommandList>
                                                            <CommandEmpty>No product found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {products.map((product) => (
                                                                    <CommandItem
                                                                        value={product.name}
                                                                        key={product.id}
                                                                        onSelect={() => {
                                                                            form.setValue(`items.${index}.productId`, product.id);
                                                                            form.setValue(`items.${index}.productName`, product.name);
                                                                            form.setValue(`items.${index}.unitPrice`, product.unitPrice);
                                                                            // Clear errors if any
                                                                            form.clearErrors(`items.${index}.productId`);
                                                                        }}
                                                                        disabled={selectedProductIds.includes(product.id) && product.id !== field.value}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                product.id === field.value
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {product.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem className="w-24">
                                            <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`items.${index}.unitPrice`}
                                    render={({ field }) => (
                                        <FormItem className="w-32">
                                            <FormLabel className={index !== 0 ? "sr-only" : ""}>Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} readOnly className="bg-muted" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mb-2 text-destructive"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                                No products added. Click "Add Product" to start.
                            </div>
                        )}
                        {form.formState.errors.items && (
                            <p className="text-sm font-medium text-destructive">
                                {form.formState.errors.items.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-lg font-semibold">
                            Total Value: {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(totalValue)}
                        </div>
                        <Button type="submit" disabled={submitting || loadingProducts}>
                            {submitting && <Spinner className="mr-2 h-4 w-4" />}
                            Submit LC Entry
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default function LCEntryPage() {
    const pathname = usePathname();
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const wIndex = segments.indexOf("w");
    const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

    if (!slug) return null;

    return (
        <RequirePermission workspaceSlug={slug} permission="stockIn">
            <LCEntryContent slug={slug} />
        </RequirePermission>
    );
}
