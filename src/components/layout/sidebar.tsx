"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bike,
  Bot,
  ClipboardList,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Wheat,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/sales", label: "Ventas", icon: ShoppingCart },
  { href: "/cash", label: "Caja", icon: Wallet },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/dealers", label: "Repartidores", icon: Bike },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/supplies", label: "Insumos", icon: Wheat },
  { href: "/assistant", label: "Asistente IA", icon: Bot },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r bg-card p-3">
      <div className="mb-4 flex items-center gap-2 px-2 py-3">
        <span className="text-2xl">🌽</span>
        <div>
          <p className="text-sm font-bold leading-tight">Tierra del Campo</p>
          <p className="text-xs text-muted-foreground">Sistema POS</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
