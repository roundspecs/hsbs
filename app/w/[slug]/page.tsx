"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/lib/useAuth";
import { getDashboardStats, DashboardStats } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, AlertTriangle, Package } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats(slug);
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchStats();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(stats.inventoryValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(stats.monthlySales)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.lowStockItems.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lowStockItems.length > 0 ? "text-destructive" : ""}`}>
              {stats.lowStockItems.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalProducts}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="col-span-4 min-w-0">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference #</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentActivity.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {transaction.date ? format(transaction.date.toDate(), "dd MMM yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === "LC" ? "default" : "secondary"}
                          className={transaction.type === "LC" ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600 text-white"}
                        >
                          {transaction.type === "LC" ? "Stock In" : "Stock Out"}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.referenceNumber}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(transaction.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {stats.recentActivity.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No recent activity.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 overflow-x-auto">
              {stats.lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 opacity-50" />
                  <p>Stock levels are healthy.</p>
                </div>
              ) : (
                stats.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.productNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {item.stock} left
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}