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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
            date: new Date(),
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
            router.push(`/w/${slug}/products`);
            router.refresh();
        } catch (error: any) {
            console.error("Error creating LC Entry:", error);
            if (error.message && error.message.includes("already exists")) {
                form.setError("referenceNumber", {
                    type: "manual",
                    message: "This LC Number already exists.",
                });
                toast.error("This LC Number already exists.");
            } else {
                toast.error(error.message || "Failed to create LC Entry");
            }
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
        <div className="max-w-6xl w-full">
            <h2 className="text-lg font-semibold mb-6">New LC Entry (Stock-In)</h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        <FormField
                            control={form.control}
                            name="referenceNumber"
                            render={({ field }) => (
                                <FormItem className="flex-1">
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
                                <FormItem className="flex flex-col flex-1">
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

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.productId`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        className={cn(
                                                                            "w-full min-w-[250px] justify-between",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        <span className="truncate">
                                                                            {field.value
                                                                                ? products.find(
                                                                                    (product) => product.id === field.value
                                                                                )?.name
                                                                                : "Select product"}
                                                                        </span>
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[400px] p-0" align="start">
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
                                                                                    <span className="ml-2 text-muted-foreground text-xs">
                                                                                        ({new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(product.unitPrice)})
                                                                                    </span>
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
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem className="w-24">
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
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.unitPrice`}
                                                render={({ field }) => (
                                                    <FormItem className="w-32">
                                                        <FormControl>
                                                            <Input type="number" {...field} readOnly className="bg-muted" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {fields.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No products added. Click "Add Product" to start.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => append({ productId: "", productName: "", quantity: 1, unitPrice: 0 })}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>

                    {form.formState.errors.items && (
                        <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.items.message}
                        </p>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                        <div className="flex flex-col items-end gap-4">
                            <div className="text-2xl font-bold bg-slate-100 p-4 rounded-lg">
                                Total Value: {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(totalValue)}
                            </div>
                            <Button type="submit" size="lg" disabled={submitting || loadingProducts}>
                                {submitting && <Spinner className="mr-2 h-4 w-4" />}
                                Submit LC Entry
                            </Button>
                        </div>
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
