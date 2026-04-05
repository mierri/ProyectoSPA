import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { filter, map, startWith } from 'rxjs/operators';

type Crumb = { label: string; url?: string; current: boolean };

@Component({
	selector: 'spartan-site-header-inset',
	imports: [HlmSidebarImports, HlmSeparatorImports, HlmBreadCrumbImports, HlmButtonImports, NgIcon, RouterLink],
	providers: [provideIcons({ lucideBell })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<header class="flex h-16 shrink-0 items-center gap-2 border-b">
			<div class="flex w-full items-center gap-2 px-4">
				<button hlmSidebarTrigger></button>
				<hlm-separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
				<nav hlmBreadcrumb>
					<ol hlmBreadcrumbList>
						@for (crumb of breadcrumbs(); track crumb.label) {
							<li hlmBreadcrumbItem>
								@if (crumb.current) {
									<a hlmBreadcrumbPage>{{ crumb.label }}</a>
								} @else {
									<a hlmBreadcrumbLink [routerLink]="crumb.url">{{ crumb.label }}</a>
								}
							</li>
							@if (!crumb.current) {
								<li hlmBreadcrumbSeparator></li>
							}
						}
					</ol>
				</nav>
				<div class="ml-auto flex items-center">
					<button
						hlmBtn
						type="button"
						variant="ghost"
						size="icon"
						class="relative"
						aria-label="Abrir notificaciones"
						title="Notificaciones"
					>
						<ng-icon name="lucideBell" class="size-4" />
						<span class="bg-destructive absolute top-1 right-1 size-2 rounded-full"></span>
					</button>
				</div>
			</div>
		</header>
	`,
})
export class SiteHeader {
	private readonly _router = inject(Router);

	private readonly _currentUrl = toSignal(
		this._router.events.pipe(
			filter((event): event is NavigationEnd => event instanceof NavigationEnd),
			map((event) => event.urlAfterRedirects),
			startWith(this._router.url),
		),
		{ initialValue: this._router.url },
	);

	protected readonly breadcrumbs = computed<Crumb[]>(() => {
		const url = this._currentUrl();

		if (url.startsWith('/app/ordenes-trabajo/')) {
			const orderId = url.split('/').pop() ?? 'Detalle';
			return [
				{ label: 'Ordenes de trabajo', url: '/app/ordenes-trabajo', current: false },
				{ label: orderId, current: true },
			];
		}

		if (url.startsWith('/app/ordenes-trabajo')) {
			return [{ label: 'Ordenes de trabajo', current: true }];
		}

		if (url.startsWith('/app/clientes-vehiculos/')) {
			const clientId = url.split('/').pop() ?? 'Detalle';
			return [
				{ label: 'Clientes y vehiculos', url: '/app/clientes-vehiculos', current: false },
				{ label: clientId, current: true },
			];
		}

		if (url.startsWith('/app/clientes-vehiculos')) {
			return [{ label: 'Clientes y vehiculos', current: true }];
		}

		if (url.startsWith('/app/inventario')) {
			return [{ label: 'Inventario', current: true }];
		}

		return [{ label: 'Dashboard', current: true }];
	});
}
