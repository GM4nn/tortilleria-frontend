"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bike,
  Bot,
  ClipboardList,
  LayoutDashboard,
  Package,
  Scale,
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
  { href: "/finanzas", label: "Finanzas", icon: Scale },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/dealers", label: "Repartidores", icon: Bike },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/supplies", label: "Insumos", icon: Wheat },
  { href: "/assistant", label: "Asistente", icon: Bot },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card">
      <div className="flex items-stretch justify-around overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-1 px-2 py-2 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
