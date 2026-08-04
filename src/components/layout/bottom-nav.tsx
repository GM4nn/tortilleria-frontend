"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bike,
  Bot,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Scale,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Wheat,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-context";
import { ADMIN_USERNAME, NON_ADMIN_ROUTES } from "@/features/auth/constants";

const NAV_ITEMS = [
  { href: "/sales", label: "Ventas", icon: ShoppingCart },
  { href: "/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/inicio", label: "Reportes", icon: LayoutDashboard },
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
  const router = useRouter();
  const { user, logout } = useAuth();

  // En el login (raíz) no se muestra la barra de navegación
  if (pathname === "/") return null;

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  // Si no es admin, solo ve ventas, pedidos y caja
  const isAdmin = user?.username === ADMIN_USERNAME;
  const items = isAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => NON_ADMIN_ROUTES.includes(item.href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card">
      <div className="flex items-stretch justify-around overflow-x-auto">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
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

        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex min-w-[64px] flex-col items-center gap-1 px-2 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Salir
        </button>
      </div>
    </nav>
  );
}
