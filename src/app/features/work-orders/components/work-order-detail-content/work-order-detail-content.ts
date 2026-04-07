import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { NotificationService } from '../../../../core';
import { workOrderPriorityVariant, workOrderStatusVariant, type WorkOrderPriority, type WorkOrderStatus } from '../../models';
import { WorkOrdersService } from '../../services';
import {
	WorkOrderChecklistSectionComponent,
	WorkOrderDetailsSectionComponent,
	WorkOrderGallerySectionComponent,
	WorkOrderNotesSectionComponent,
	WorkOrderQuotationsSectionComponent,
	WorkOrderTimelineSectionComponent,
} from './sections';

@Component({
	selector: 'spartan-work-order-detail-content',
	imports: [
		CommonModule,
		HlmBadgeImports,
		HlmButtonImports,
		HlmTabsImports,
		HlmAlertDialogImports,
		WorkOrderDetailsSectionComponent,
		WorkOrderChecklistSectionComponent,
		WorkOrderGallerySectionComponent,
		WorkOrderTimelineSectionComponent,
		WorkOrderNotesSectionComponent,
		WorkOrderQuotationsSectionComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './work-order-detail-content.html',
	styleUrl: './work-order-detail-content.css',
})
export class WorkOrderDetailContentComponent {
	private readonly _route = inject(ActivatedRoute);
	private readonly _router = inject(Router);
	private readonly _service = inject(WorkOrdersService);
	private readonly _notification = inject(NotificationService);
	private readonly _params = toSignal(this._route.paramMap, { initialValue: this._route.snapshot.paramMap });

	protected readonly statusVariant = workOrderStatusVariant;
	protected readonly priorityVariant = workOrderPriorityVariant;
	protected readonly orderId = computed(() => this._params().get('id') ?? '');
	protected readonly order = computed(() => this._service.getById(this.orderId()));

	protected goBack(): void {
		void this._router.navigate(['/app/ordenes-trabajo']);
	}

	protected cerrarOrden(): void {
		const order = this.order();
		if (!order) return;
		this._service.updateStatus(order.id, 'Terminado', 'Supervisor');
		this._notification.success('OT cerrada. Cargo enviado a finanzas.');
	}

	protected statusChipClass(status: WorkOrderStatus): string {
		switch (status) {
			case 'Agendado':
				return 'wo-chip-status-agendado';
			case 'En Espera':
				return 'wo-chip-status-espera';
			case 'En Proceso':
				return 'wo-chip-status-proceso';
			case 'Terminado':
				return 'wo-chip-status-terminado';
			case 'En Garantia':
				return 'wo-chip-status-garantia';
			case 'Rezagado':
				return 'wo-chip-status-rezagado';
			case 'Entregado':
				return 'wo-chip-status-entregado';
			default:
				return '';
		}
	}

	protected priorityChipClass(priority: WorkOrderPriority): string {
		switch (priority) {
			case 'Alta':
				return 'wo-chip-priority-alta';
			case 'Media':
				return 'wo-chip-priority-media';
			case 'Baja':
				return 'wo-chip-priority-baja';
			default:
				return '';
		}
	}
}
