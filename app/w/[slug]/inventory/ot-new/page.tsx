"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Check, ChevronsUpDown, Plus, Trash2, AlertTriangle } from "lucide-react";

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
import { getSurgeons, Surgeon } from "@/lib/surgeons";
import { createOTEntry } from "@/lib/transactions";
import { useRouter, usePathname } from "next/navigation";
import RequirePermission from "@/components/auth/RequirePermission";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

const otEntrySchema = z.object({
    referenceNumber: z.string().min(1, "OT Number is required"),
    date: z.date(),
    surgeonId: z.string().min(1, "Surgeon is required"),
    surgeonName: z.string(),
    items: z.array(z.object({
        productId: z.string().min(1, "Product is required"),
        productName: z.string(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number(),
        currentStock: z.number(),
    })).min(1, "At least one product is required"),
});

type OTEntryFormValues = z.infer<typeof otEntrySchema>;

function OTEntryContent({ slug }: { slug: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [surgeons, setSurgeons] = useState<Surgeon[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingData, setPendingData] = useState<OTEntryFormValues | null>(null);

    const form = useForm<OTEntryFormValues>({
        resolver: zodResolver(otEntrySchema),
        defaultValues: {
            referenceNumber: "",
            date: new Date(),
            surgeonId: "",
            surgeonName: "",
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, surgeonsData] = await Promise.all([
                    getProducts(slug),
                    getSurgeons(slug)
                ]);
                setProducts(productsData);
                setSurgeons(surgeonsData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data");
            } finally {
                setLoadingData(false);
            }
        };
        if (slug) fetchData();
    }, [slug]);

    const handleConfirmSubmit = async () => {
        if (!user || !pendingData) return;
        setSubmitting(true);
        try {
            const totalAmount = pendingData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            // Remove currentStock from items before sending to backend
            const itemsToSubmit = pendingData.items.map(({ currentStock, ...rest }) => rest);

            await createOTEntry(slug, {
                referenceNumber: pendingData.referenceNumber,
                date: pendingData.date,
                surgeonId: pendingData.surgeonId,
                surgeonName: pendingData.surgeonName,
                items: itemsToSubmit,
                totalAmount,
                createdBy: user.uid,
            });

            toast.success("OT Entry created successfully");
            router.push(`/w/${slug}/products`);
            router.refresh();
        } catch (error: any) {
            console.error("Error creating OT Entry:", error);
            if (error.message && error.message.includes("already exists")) {
                form.setError("referenceNumber", {
                    type: "manual",
                    message: "This OT Number already exists.",
                });
                toast.error("This OT Number already exists.");
            } else {
                toast.error(error.message || "Failed to create OT Entry");
            }
        } finally {
            setSubmitting(false);
            setConfirmOpen(false);
            setPendingData(null);
        }
    };

    const onSubmit = (data: OTEntryFormValues) => {
        // Client-side validation for stock
        for (const item of data.items) {
            if (item.quantity > item.currentStock) {
                form.setError(`items`, {
                    type: "manual",
                    message: `Insufficient stock for ${item.productName}. Available: ${item.currentStock}`,
                });
                return;
            }
        }
        setPendingData(data);
        setConfirmOpen(true);
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
            <h2 className="text-lg font-semibold mb-6">New OT Entry (Stock-Out)</h2>

            <Alert className="mb-6 border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100 dark:border-amber-500/30">
                <AlertTriangle className="h-4 w-4 stroke-amber-600 dark:stroke-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-300">Important</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                    Please verify all details before submitting. To maintain inventory integrity, OT Entries cannot be edited or deleted once created.
                </AlertDescription>
            </Alert>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="referenceNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>OT Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter OT Number" {...field} />
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

                        <FormField
                            control={form.control}
                            name="surgeonId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Surgeon</FormLabel>
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
                                                        ? surgeons.find((surgeon) => surgeon.id === field.value)?.name
                                                        : "Select surgeon"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search surgeon..." />
                                                <CommandList>
                                                    <CommandEmpty>No surgeon found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {surgeons.map((surgeon) => (
                                                            <CommandItem
                                                                value={surgeon.name}
                                                                key={surgeon.id}
                                                                onSelect={() => {
                                                                    form.setValue("surgeonId", surgeon.id);
                                                                    form.setValue("surgeonName", surgeon.name);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        surgeon.id === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{surgeon.name}</span>
                                                                    {surgeon.hospitalAffiliation && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {surgeon.hospitalAffiliation}
                                                                        </span>
                                                                    )}
                                                                </div>
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
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => {
                                    const currentItem = form.watch(`items.${index}`);
                                    const isStockLow = currentItem.currentStock < currentItem.quantity;

                                    return (
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
                                                                                            form.setValue(`items.${index}.currentStock`, product.stock);
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
                                                                                            (Stock: {product.stock})
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
                                                <Badge variant="secondary">
                                                    {currentItem.currentStock}
                                                </Badge>
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
                                                                    className={cn(isStockLow && "border-destructive focus-visible:ring-destructive")}
                                                                />
                                                            </FormControl>
                                                            {isStockLow && (
                                                                <span className="text-[10px] text-destructive font-medium">
                                                                    Exceeds Stock
                                                                </span>
                                                            )}
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-32 p-2 text-sm">
                                                    {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(currentItem.unitPrice)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-32 p-2 text-sm font-medium">
                                                    {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(currentItem.quantity * currentItem.unitPrice)}
                                                </div>
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
                                    );
                                })}
                                {fields.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                        onClick={() => append({ productId: "", productName: "", quantity: 1, unitPrice: 0, currentStock: 0 })}
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
                                Total Bill: {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(totalValue)}
                            </div>
                            <Button type="submit" size="lg" disabled={submitting || loadingData}>
                                {submitting && <Spinner className="mr-2 h-4 w-4" />}
                                Submit OT Entry
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure this data is correct? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSubmit} disabled={submitting}>
                            {submitting && <Spinner className="mr-2 h-4 w-4" />}
                            Confirm Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function OTEntryPage() {
    const pathname = usePathname();
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const wIndex = segments.indexOf("w");
    const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

    if (!slug) return null;

    return (
        <RequirePermission workspaceSlug={slug} permission="stockOut">
            <OTEntryContent slug={slug} />
        </RequirePermission>
    );
}
