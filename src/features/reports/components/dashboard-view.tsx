"use client";

import { CalendarDays, ClipboardList, Coins, ShoppingCart } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { CenteredSpinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import {
  useMonthlyIncome,
  useTodaySummary,
  useTopCustomers,
  useTopProducts,
} from "../hooks";

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const today = useTodaySummary();
  const monthly = useMonthlyIncome();
  const topProducts = useTopProducts();
  const topCustomers = useTopCustomers();

  return (
    <>
      <PageHeader title="Inicio" description="Resumen del negocio" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Ingresos de hoy"
          value={formatCurrency(today.data?.income_total ?? 0)}
          icon={Coins}
        />
        <StatCard
          title="Ventas de hoy"
          value={String(today.data?.sales_count ?? 0)}
          icon={ShoppingCart}
        />
        <StatCard
          title="Pedidos pendientes"
          value={String(today.data?.orders_pending_count ?? 0)}
          icon={ClipboardList}
        />
        <StatCard
          title="Ingresos del mes"
          value={formatCurrency(monthly.data?.income_total ?? 0)}
          icon={CalendarDays}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <CenteredSpinner />
                    </TableCell>
                  </TableRow>
                ) : !topProducts.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Sin datos
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.data.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">
                        {product.quantity.toLocaleString("es-MX")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mejores clientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <CenteredSpinner />
                    </TableCell>
                  </TableRow>
                ) : !topCustomers.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Sin datos
                    </TableCell>
                  </TableRow>
                ) : (
                  topCustomers.data.map((customer) => (
                    <TableRow key={customer.customer_name}>
                      <TableCell>{customer.customer_name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
