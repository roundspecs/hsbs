"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/useAuth";
import { usePermission } from "@/lib/usePermission";
import { getProducts, addProduct, deleteProduct, Product } from "@/lib/products";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import RequirePermission from "@/components/auth/RequirePermission";
import { MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ProductImporter } from "@/components/products/product-importer";

function ProductsContent({ slug }: { slug: string }) {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // New product form state
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        productNumber: "",
        name: "",
        unitPrice: 0,
        stock: 0,
    });

    const { hasPermission: canCreate } = usePermission(slug, "createProduct");
    const { hasPermission: canDelete } = usePermission(slug, "deleteProduct");

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts(slug);
            setProducts(data);
        } catch (err) {
            console.error("Error loading products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (slug) {
            loadProducts();
        }
    }, [slug]);

    const handleAddProduct = async () => {
        if (!slug || !newProduct.name || !newProduct.productNumber) return;
        setIsAdding(true);
        try {
            await addProduct(slug, {
                productNumber: newProduct.productNumber,
                name: newProduct.name,
                unitPrice: Number(newProduct.unitPrice) || 0,
                stock: Number(newProduct.stock) || 0,
                category: newProduct.category || "",
            });
            setIsAddDialogOpen(false);
            setNewProduct({
                productNumber: "",
                name: "",
                unitPrice: 0,
                stock: 0,
            });
            loadProducts();
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Failed to add product");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(slug, productId);
            setProducts((prev) => prev.filter((p) => p.id !== productId));
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Failed to delete product");
        }
    };

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.productNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Products</h2>
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    {canCreate && (
                        <>
                            <ProductImporter slug={slug} />
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Product
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Product</DialogTitle>
                                        <DialogDescription>
                                            Enter the details of the new product.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <label htmlFor="productNumber" className="text-sm font-medium">
                                                Product No
                                            </label>
                                            <Input
                                                id="productNumber"
                                                value={newProduct.productNumber}
                                                onChange={(e) =>
                                                    setNewProduct({ ...newProduct, productNumber: e.target.value })
                                                }
                                                placeholder="e.g. 00-7711-004-10"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label htmlFor="name" className="text-sm font-medium">
                                                Name
                                            </label>
                                            <Input
                                                id="name"
                                                value={newProduct.name}
                                                onChange={(e) =>
                                                    setNewProduct({ ...newProduct, name: e.target.value })
                                                }
                                                placeholder="e.g. P/S TPR ST, 4 STD"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <label htmlFor="unitPrice" className="text-sm font-medium">
                                                    Unit Price (BDT)
                                                </label>
                                                <Input
                                                    id="unitPrice"
                                                    type="number"
                                                    value={newProduct.unitPrice}
                                                    onChange={(e) =>
                                                        setNewProduct({ ...newProduct, unitPrice: Number(e.target.value) })
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label htmlFor="stock" className="text-sm font-medium">
                                                    Initial Stock
                                                </label>
                                                <Input
                                                    id="stock"
                                                    type="number"
                                                    value={newProduct.stock}
                                                    onChange={(e) =>
                                                        setNewProduct({ ...newProduct, stock: Number(e.target.value) })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsAddDialogOpen(false)}
                                            disabled={isAdding}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={handleAddProduct} disabled={isAdding}>
                                            {isAdding && <Spinner className="mr-2 h-4 w-4" />}
                                            Add Product
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        {product.productNumber}
                                    </TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat("en-BD", {
                                            style: "currency",
                                            currency: "BDT",
                                        }).format(product.unitPrice)}
                                    </TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    disabled={!canDelete}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const pathname = usePathname();
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const wIndex = segments.indexOf("w");
    const slug = wIndex >= 0 ? segments[wIndex + 1] : segments[0];

    if (!slug) return null;

    return (
        <RequirePermission workspaceSlug={slug} permission="viewProducts">
            <ProductsContent slug={slug} />
        </RequirePermission>
    );
}
