# ProyectoSPA — Sistema de Gestión para Taller Automotriz

Aplicación web SPA desarrollada en **Angular 21** para la administración integral de un taller automotriz. Incluye gestión de clientes, vehículos, órdenes de trabajo, inventario, finanzas, precios y más.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Framework | Angular 21 (standalone components) |
| Estilos | Tailwind CSS v4 |
| Componentes UI | Spartan NG (Helm + Brain) |
| Iconos | ng-icons / Lucide |
| Exportación PDF | jsPDF + jsPDF-AutoTable |
| Exportación Excel | SheetJS (xlsx) |
| Backend | Laravel (carpeta `ProyectoSPABackend`) |

---

## Módulos

| Ruta | Módulo | Roles |
|---|---|---|
| `/app/dashboard` | Dashboard con tarjetas de acceso rápido | Todos |
| `/app/clientes-vehiculos` | Clientes y vehículos, detalle por cliente | Todos |
| `/app/ordenes-trabajo` | Órdenes de trabajo, detalle y exportación PDF/Excel | Todos |
| `/app/inventario` | Gestión de inventario y refacciones | admin, técnico |
| `/app/lista-precios` | Catálogo de precios y cotizador con descarga PDF | admin |
| `/app/finanzas-reportes` | Caja diaria, cuentas por cobrar/pagar, reportes PDF | admin, gerente |
| `/app/agenda-pagos` | Agenda de pagos pendientes | admin, gerente |
| `/app/contactos-proveedores` | Directorio de proveedores y contactos | admin, gerente |
| `/app/lista-actividades` | Registro de actividades del taller | Todos |
| `/app/kpis` | Dashboard de indicadores de rendimiento | admin, gerente |
| `/app/settings` | Configuración de cuenta y sistema | Todos |
| `/portal/:token` | Portal de cliente (acceso externo sin login) | Público |

---

## Instalación y desarrollo

### Requisitos
- Node.js 20+
- npm 11+

### Pasos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start
# → http://localhost:4200

# Build de producción
npm run build
```

### Backend (Laravel)

```bash
cd ProyectoSPABackend

# Instalar dependencias PHP
composer install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Migraciones
php artisan migrate

# Servidor
php artisan serve
# → http://localhost:8000
```

El frontend usa un proxy configurado en `proxy.conf.json` que redirige las llamadas `/api/*` al backend Laravel.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/              # Servicios globales (auth, PDF, notificaciones)
│   ├── features/          # Módulos por funcionalidad
│   │   ├── dashboard/
│   │   ├── clients-vehicles/
│   │   ├── work-orders/
│   │   ├── inventory/
│   │   ├── prices/
│   │   ├── finanzas/
│   │   ├── payments-agenda/
│   │   ├── contacts/
│   │   ├── activities/
│   │   ├── kpis/
│   │   ├── settings/
│   │   └── portal/
│   ├── layouts/           # Main layout y Auth layout
│   └── components/ui/     # Componentes Spartan/Helm reutilizables
└── styles.css
```

---

## Roles de usuario

- **admin** — acceso completo
- **gerente** — finanzas, KPIs, agenda, contactos
- **tecnico** — órdenes de trabajo e inventario
