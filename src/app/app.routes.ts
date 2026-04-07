import { Routes } from '@angular/router';
import { authGuard, loggedOutGuard } from './core/auth/auth.guards';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login',
	},
	{
		path: 'login',
		canActivate: [loggedOutGuard],
		loadComponent: () => import('./layouts/auth-layout'),
	},
	{
		path: 'settings',
		pathMatch: 'full',
		redirectTo: 'app/settings',
	},
	{
		path: 'app',
		canActivate: [authGuard],
		loadComponent: () => import('./layouts/main-layout'),
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'dashboard',
			},
			{
				path: 'dashboard',
				loadComponent: () => import('./features/dashboard').then((m) => m.DashboardComponent),
			},
			{
				path: 'clientes-vehiculos',
				loadComponent: () => import('./features/clients-vehicles').then((m) => m.ClientsVehiclesPageComponent),
			},
			{
				path: 'clientes-vehiculos/:id',
				loadComponent: () => import('./features/clients-vehicles').then((m) => m.ClientDetailPageComponent),
			},
			{
				path: 'inventario',
				loadComponent: () => import('./features/inventory').then((m) => m.InventoryPageComponent),
			},
			{
				path: 'agenda-pagos',
				loadComponent: () => import('./features/payments-agenda').then((m) => m.PaymentsAgendaPage),
			},
			{
				path: 'contactos-proveedores',
				loadComponent: () => import('./features/contacts').then((m) => m.ContactsPageComponent),
			},
			{
				path: 'lista-actividades',
				loadComponent: () => import('./features/activities').then((m) => m.ActivitiesPageComponent),
			},
			{
				path: 'lista-precios',
				loadComponent: () => import('./features/prices').then((m) => m.PricesPageComponent),
			},
			{
				path: 'kpis',
				loadComponent: () => import('./features/kpis').then((m) => m.KpisDashboardComponent),
			},
			{
				path: 'finanzas-reportes',
				loadComponent: () => import('./features/finanzas').then((m) => m.FinancesPageComponent),
			},
			{
				path: 'ordenes-trabajo',
				loadComponent: () => import('./features/work-orders').then((m) => m.WorkOrdersPageComponent),
			},
			{
				path: 'ordenes-trabajo/:id',
				loadComponent: () => import('./features/work-orders').then((m) => m.WorkOrderDetailPageComponent),
			},
			{
				path: 'settings',
				loadComponent: () => import('./features/settings').then((m) => m.SettingsPageComponent),
			},
		],
	},
	{ path: '**', redirectTo: 'login' },
];
