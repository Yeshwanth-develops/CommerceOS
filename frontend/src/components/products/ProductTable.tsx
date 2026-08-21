import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type Product = {
    id: number;
    title: string;
    description?: string;
    price: number;
    stock: number;
    inventory_status?: string;
    merchant_id?: number;
    category_id?: number | null;
};

export default function ProductTable({
    products,
}: {
    products: Product[];
}) {
    const getStatusBadge = (status?: string) => {
        if (!status) return null;

        const styles: Record<string, string> = {
            "Available": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
            "Low Stock": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
            "Out of Stock": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
        };

        const currentStyle =
            styles[status] ||
            "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
            >
                {status}
            </span>
        );
    };

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-zinc-50 dark:bg-zinc-800/50">
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Inventory Status</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center py-8 text-zinc-500"
                            >
                                No products found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-mono text-xs text-zinc-500">
                                    #{product.id}
                                </TableCell>
                                <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                                    <div>{product.title}</div>
                                    {product.description && (
                                        <div className="text-xs text-zinc-500 truncate max-w-xs">
                                            {product.description}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    ₹{product.price.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="text-zinc-700 dark:text-zinc-300">
                                    {product.stock}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(product.inventory_status)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}