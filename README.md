# Tortillería — Frontend (Next.js)

Panel web del sistema. Next.js (App Router) + TypeScript + Tailwind + shadcn/ui,
consumiendo el backend FastAPI. Datos con TanStack Query.

## Estructura (carpeta por módulo)

```
src/
├── app/                  # rutas (App Router): una carpeta por sección
│   ├── layout.tsx        # shell + sidebar + providers
│   ├── page.tsx          # dashboard
│   ├── dealers/ customers/ products/ suppliers/
│   └── orders/ sales/ cash/ supplies/ assistant/   (en construcción)
├── components/
│   ├── ui/               # primitivos shadcn/ui (button, input, table, dialog, ...)
│   └── layout/           # sidebar, page-header, coming-soon
├── features/             # un módulo por recurso
│   └── <modulo>/
│       ├── types.ts      # tipos del dominio
│       ├── api.ts        # llamadas al backend (tipadas)
│       ├── hooks.ts      # React Query (queries + mutations)
│       └── components/   # UI del módulo (tabla, formulario)
└── lib/
    ├── api-client.ts     # fetch tipado + manejo de errores
    ├── query-client.ts
    └── utils.ts          # cn(), formato de moneda/fecha
```

Cada módulo nuevo = `types → api → hooks → components/*` + una `app/<ruta>/page.tsx`.

## Correr en local

```bash
cd frontend
npm install
copy .env.local.example .env.local   # ajusta NEXT_PUBLIC_API_URL si hace falta
npm run dev
```

- App: http://localhost:3000
- Requiere el **backend corriendo** en http://localhost:8000 (o ajusta
  `NEXT_PUBLIC_API_URL`). El backend debe permitir CORS a `http://localhost:3000`
  (variable `CORS_ORIGINS` del backend, ya viene así por defecto).

## Módulos

- ✅ **Inicio** (dashboard con KPIs + top productos/clientes)
- ✅ **Repartidores**, **Clientes**, **Productos**, **Proveedores** (CRUD completo)
- 🚧 **Pedidos** (POS), **Ventas**, **Caja**, **Insumos**, **Asistente IA** (siguiente entrega)
