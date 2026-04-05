export const data = {
	user: {
		name: 'admin',
		email: 'admin@colosio.com',
		avatar: '/assets/avatar.png',
	},
	navMainSections: [
		{
			label: 'Operacion',
			items: [
				{ title: 'Dashboard', url: '/app/dashboard', icon: 'lucideSquareTerminal', exact: true },
				{ title: 'Ordenes de trabajo', url: '/app/ordenes-trabajo', icon: 'lucideBookOpen' },
				{ title: 'Clientes y vehiculos', url: '/app/clientes-vehiculos', icon: 'lucideUsers' },
				{ title: 'Inventario', url: '/app/inventario', icon: 'lucidePackageSearch' },
				{ title: 'Lista de actividades', url: '/app/lista-actividades', icon: 'lucideMap' },
			],
		},
		{
			label: 'Gestion',
			items: [
				{ title: 'Agenda de pagos', url: '/app/agenda-pagos', icon: 'lucideReceiptText' },
				{ title: 'Contactos (proveedores)', url: '/app/contactos-proveedores', icon: 'lucideBadgeCheck' },
				{ title: 'Lista de precios', url: '/app/lista-precios', icon: 'lucideCreditCard' },
				{ title: 'KPIs', url: '/app/kpis', icon: 'lucideChartPie' },
				{ title: 'Finanzas y reportes', url: '/app/finanzas-reportes', icon: 'lucideSettings2' },
			],
		},
	],
	navSecondary: [],
};
