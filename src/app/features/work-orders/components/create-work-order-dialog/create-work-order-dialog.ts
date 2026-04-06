import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { DatePickerFieldComponent } from '../../../../shared';
import { WORK_ORDER_PRIORITIES, type CreateWorkOrderInput, type WorkOrderPriority } from '../../models/work-orders.models';

export interface CreateWorkOrderDialogContext {
	clients: string[];
	onCreate: (payload: CreateWorkOrderInput) => void;
	onCreateClient: (name: string) => void;
}

@Component({
	selector: 'spartan-create-work-order-dialog',
	imports: [CommonModule, FormsModule, HlmInputImports, HlmTextareaImports, HlmButtonImports, HlmSelectImports, HlmComboboxImports, DatePickerFieldComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './create-work-order-dialog.html',
	styleUrl: './create-work-order-dialog.css',
})
export class CreateWorkOrderDialogComponent {
	private readonly _dialogRef = inject(BrnDialogRef<unknown>);
	private readonly _context = injectBrnDialogContext<CreateWorkOrderDialogContext>();

	protected readonly priorities = WORK_ORDER_PRIORITIES;
	protected readonly clients = computed(() => this._context.clients);

	protected readonly cliente = signal('');
	protected readonly telefono = signal('');
	protected readonly correo = signal('');
	protected readonly tecnico = signal('Sin asignar');
	protected readonly fechaProgramada = signal(this.todayDate());
	protected readonly priority = signal<WorkOrderPriority>('Media');

	protected readonly marca = signal('');
	protected readonly modelo = signal('');
	protected readonly anio = signal(new Date().getFullYear());
	protected readonly placas = signal('');
	protected readonly vin = signal('');
	protected readonly kilometraje = signal(0);

	protected readonly problema = signal('');
	protected readonly diagnostico = signal('');
	protected readonly tipoVehiculo = signal<'Auto' | 'Camioneta' | 'Camión'>('Auto');

	protected readonly newClientName = signal('');

	protected readonly canCreate = computed(() =>
		this.cliente().trim().length > 0 && this.tecnico().trim().length > 0 && this.problema().trim().length > 0,
	);

	protected onPriorityChange(value: string): void {
		if (value === 'Baja' || value === 'Media' || value === 'Alta') {
			this.priority.set(value);
		}
	}

	protected onVehicleTypeChange(value: string): void {
		if (value === 'Auto' || value === 'Camioneta' || value === 'Camión') {
			this.tipoVehiculo.set(value);
		}
	}

	protected createClient(): void {
		const name = this.newClientName().trim();
		if (!name) {
			return;
		}
		this._context.onCreateClient(name);
		this.cliente.set(name);
		this.newClientName.set('');
	}

	protected submit(): void {
		if (!this.canCreate()) {
			return;
		}

		const payload: CreateWorkOrderInput = {
			cliente: this.cliente().trim(),
			telefono: this.telefono().trim(),
			correo: this.correo().trim(),
			tecnico: this.tecnico().trim(),
			fechaProgramada: this.fechaProgramada(),
			priority: this.priority(),
			vehicle: {
				marca: this.marca().trim() || 'Pendiente',
				modelo: this.modelo().trim() || 'Pendiente',
				anio: this.anio(),
				placas: this.placas().trim() || 'PEND-000',
				vin: this.vin().trim() || 'PENDIENTE',
				kilometraje: this.kilometraje(),
			},
			tipoVehiculo: this.tipoVehiculo(),
			problema: this.problema().trim(),
			diagnostico: this.diagnostico().trim() || 'Pendiente de diagnostico tecnico',
		};

		this._context.onCreate(payload);
		this._dialogRef.close();
	}

	protected cancel(): void {
		this._dialogRef.close();
	}

	private todayDate(): string {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	}
}
