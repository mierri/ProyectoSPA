import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NotificationService } from '../../../../core';
import { type InventoryItemCondition } from '../../models';
import { InventoryService } from '../../services';

@Component({
	selector: 'spartan-sale-parts-section',
	standalone: true,
	imports: [CommonModule, HlmCardImports, HlmTableImports, HlmBadgeImports, HlmInputImports, HlmButtonImports, HlmSelectImports],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './sale-parts-section.html',
	styleUrl: './sale-parts-section.css',
})
export class SalePartsSectionComponent {
	private readonly _service = inject(InventoryService);
	private readonly _notification = inject(NotificationService);

	public readonly query = input<string>('');
	protected readonly conditions: InventoryItemCondition[] = ['Bueno', 'Regular', 'Danado'];
	protected readonly items = computed(() => {
		const term = this.query().trim().toLowerCase();
		const current = this._service.saleItems();
		if (!term) return current;
		return current.filter((item) => `${item.nombre} ${item.descripcion} ${item.responsable}`.toLowerCase().includes(term));
	});
	protected readonly selectedItemId = signal('');
	protected readonly selectedItem = computed(() => this.items().find((item) => item.id === this.selectedItemId()));
	protected readonly movements = computed(() => (this.selectedItemId() ? this._service.getItemMovements(this.selectedItemId()) : []));
	protected readonly qtyEdit = signal(1);
	protected readonly reasonEdit = signal('Venta mostrador');
	protected readonly showCreateForm = signal(false);
	protected readonly createNombre = signal('');
	protected readonly createDescripcion = signal('');
	protected readonly createEstado = signal<InventoryItemCondition>('Bueno');
	protected readonly createResponsable = signal('Almacen');
	protected readonly createStockActual = signal(0);
	protected readonly createStockMinimo = signal(0);
	protected readonly createPrecio = signal(0);
	protected readonly createLinkedPartId = signal('');
	protected readonly createPhoto = signal('');

	protected selectItem(itemId: string): void {
		this.selectedItemId.set(itemId);
		this.qtyEdit.set(1);
		this.reasonEdit.set('Venta mostrador');
	}

	protected registerEntry(): void {
		const item = this.selectedItem();
		if (!item) return;
		const ok = this._service.recordEntry(item.id, Math.max(1, this.qtyEdit()), this.reasonEdit(), 'Administrador');
		if (ok) {
			this._notification.success('Entrada de parte registrada.');
		}
	}

	protected registerManualAdjust(): void {
		const item = this.selectedItem();
		if (!item) return;
		const ok = this._service.recordManualAdjustment(item.id, this.qtyEdit(), this.reasonEdit(), 'Administrador');
		if (ok) {
			this._notification.info('Ajuste de parte registrado.');
		}
	}

	protected onCreateConditionChange(value: string): void {
		if (value === 'Bueno' || value === 'Regular' || value === 'Danado') {
			this.createEstado.set(value);
		}
	}

	protected onPhotoSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => this.createPhoto.set((reader.result as string) || '');
		reader.readAsDataURL(file);
	}

	protected createSaleItem(): void {
		if (!this.createNombre().trim()) return;
		this._service.createInventoryItem({
			nombre: this.createNombre(),
			tipo: 'Parte en venta',
			fotoUrl: this.createPhoto(),
			descripcion: this.createDescripcion(),
			estado: this.createEstado(),
			responsable: this.createResponsable(),
			stockActual: this.createStockActual(),
			stockMinimo: this.createStockMinimo(),
			precioVenta: this.createPrecio(),
			linkedPartId: this.createLinkedPartId().trim() || undefined,
		});
		this._notification.success('Parte en venta agregada.');
		this.showCreateForm.set(false);
		this.createNombre.set('');
		this.createDescripcion.set('');
		this.createPhoto.set('');
		this.createPrecio.set(0);
	}

	protected stockClass(actual: number, min: number): string {
		return actual <= min ? 'stock-low' : 'stock-ok';
	}
}
