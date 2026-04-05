import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NotificationService } from '../../../../core';
import { WorkOrdersService } from '../../../work-orders/services';
import { InventoryService } from '../../services';

@Component({
	selector: 'spartan-client-custody-section',
	standalone: true,
	imports: [CommonModule, HlmCardImports, HlmInputImports, HlmButtonImports, HlmTableImports, HlmBadgeImports, HlmComboboxImports],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './client-custody-section.html',
	styleUrl: './client-custody-section.css',
})
export class ClientCustodySectionComponent {
	private readonly _inventoryService = inject(InventoryService);
	private readonly _workOrdersService = inject(WorkOrdersService);
	private readonly _notification = inject(NotificationService);

	public readonly query = input<string>('');
	protected readonly entries = computed(() => {
		const term = this.query().trim().toLowerCase();
		const current = this._inventoryService.custody();
		if (!term) return current;
		return current.filter((entry) => `${entry.otId} ${entry.cliente} ${entry.item} ${entry.responsable}`.toLowerCase().includes(term));
	});
	protected readonly orders = this._workOrdersService.workOrders;
	protected readonly clients = this._workOrdersService.allClients;
	protected readonly otId = signal('');
	protected readonly cliente = signal('');
	protected readonly item = signal('');
	protected readonly photoPreview = signal('');
	protected readonly responsable = signal('Recepcion');
	protected readonly showCreateForm = signal(false);
	protected readonly selectedOrder = computed(() => this.orders().find((order) => order.id === this.otId()));
	protected readonly otItemToString = (value: string | null): string => value || '';
	protected readonly clientItemToString = (value: string | null): string => value || '';

	protected createEntry(): void {
		const order = this.selectedOrder();
		if (!this.item().trim() || !this.cliente().trim()) {
			return;
		}
		this._inventoryService.createCustodyEntry({
			otId: order?.id || this.otId().trim(),
			cliente: this.cliente().trim(),
			item: this.item(),
			fotoUrl: this.photoPreview(),
			responsable: this.responsable(),
		});
		this.item.set('');
		this.photoPreview.set('');
		this.showCreateForm.set(false);
		this._notification.success('Resguardo registrado.');
	}

	protected onOtChange(value: string): void {
		this.otId.set(value);
		const order = this.orders().find((candidate) => candidate.id === value);
		if (order) {
			this.cliente.set(order.cliente);
		}
	}

	protected onPhotoSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => this.photoPreview.set((reader.result as string) || '');
		reader.readAsDataURL(file);
	}

	protected markDelivered(entryId: string): void {
		this._inventoryService.markCustodyDelivered(entryId);
		this._notification.info('Resguardo marcado como entregado.');
	}

	protected stateClass(state: string): string {
		return state === 'Entregado' ? 'custody-done' : 'custody-active';
	}
}
