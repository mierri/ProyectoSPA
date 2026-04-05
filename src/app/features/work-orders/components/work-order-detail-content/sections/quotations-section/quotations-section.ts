import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NotificationService } from '../../../../../../core';
import { type PartCatalogItem, type ServiceCatalogItem } from '../../../../models';
import { WorkOrdersService } from '../../../../services';

@Component({
	selector: 'spartan-wo-quotations-section',
	imports: [CommonModule, HlmCardImports, HlmComboboxImports, HlmButtonImports, HlmTableImports],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './quotations-section.html',
	styleUrl: './quotations-section.css',
})
export class WorkOrderQuotationsSectionComponent {
	private readonly _route = inject(ActivatedRoute);
	private readonly _service = inject(WorkOrdersService);
	private readonly _notification = inject(NotificationService);
	private readonly _params = toSignal(this._route.paramMap, { initialValue: this._route.snapshot.paramMap });

	protected readonly orderId = computed(() => this._params().get('id') ?? '');
	protected readonly order = computed(() => this._service.getById(this.orderId()));
	protected readonly selectedPart = signal<PartCatalogItem | null>(null);
	protected readonly selectedService = signal<ServiceCatalogItem | null>(null);

	protected readonly partItemToString = (item: unknown): string => {
		const part = item as PartCatalogItem | null;
		return part ? `${part.nombre} (Stock: ${part.stock})` : '';
	};

	protected readonly serviceItemToString = (item: unknown): string => {
		const service = item as ServiceCatalogItem | null;
		return service ? `${service.nombre} - $${service.precio}` : '';
	};

	protected onPartSelected(value: unknown): void {
		this.selectedPart.set((value as PartCatalogItem | null) ?? null);
	}

	protected onServiceSelected(value: unknown): void {
		this.selectedService.set((value as ServiceCatalogItem | null) ?? null);
	}

	protected assignSelectedPart(): void {
		const order = this.order();
		const part = this.selectedPart();
		if (!order || !part) return;
		this._service.assignPart(order.id, part.id);
		this.selectedPart.set(null);
		this._notification.success('Refaccion agregada a cotizacion.');
	}

	protected assignSelectedService(): void {
		const order = this.order();
		const service = this.selectedService();
		if (!order || !service) return;
		this._service.assignService(order.id, service.id);
		this.selectedService.set(null);
		this._notification.success('Servicio agregado a cotizacion.');
	}

	protected totalRefacciones(): number {
		const order = this.order();
		if (!order) return 0;
		return order.refaccionesAsignadas.reduce((sum, part) => sum + part.cantidad * part.costoUnitario, 0);
	}

	protected totalServicios(): number {
		const order = this.order();
		if (!order) return 0;
		return order.serviciosAsignados.reduce((sum, service) => sum + service.precio, 0);
	}

	protected totalCotizacion(): number {
		return this.totalRefacciones() + this.totalServicios();
	}
}
