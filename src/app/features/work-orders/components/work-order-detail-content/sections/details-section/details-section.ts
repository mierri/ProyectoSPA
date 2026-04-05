import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NotificationService } from '../../../../../../core';
import { DatePickerFieldComponent } from '../../../../../../shared';
import { WORK_ORDER_PRIORITIES, WORK_ORDER_STATUSES, type WorkOrderPriority, type WorkOrderStatus } from '../../../../models';
import { WorkOrdersService } from '../../../../services';

@Component({
	selector: 'spartan-wo-details-section',
	imports: [
		CommonModule,
		HlmCardImports,
		HlmButtonImports,
		HlmInputImports,
		HlmTextareaImports,
		HlmSelectImports,
		HlmComboboxImports,
		DatePickerFieldComponent,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './details-section.html',
	styleUrl: './details-section.css',
})
export class WorkOrderDetailsSectionComponent {
	private readonly _route = inject(ActivatedRoute);
	private readonly _router = inject(Router);
	private readonly _service = inject(WorkOrdersService);
	private readonly _notification = inject(NotificationService);
	private readonly _params = toSignal(this._route.paramMap, { initialValue: this._route.snapshot.paramMap });

	protected readonly statuses = WORK_ORDER_STATUSES;
	protected readonly priorities = WORK_ORDER_PRIORITIES;
	protected readonly clients = this._service.allClients;

	protected readonly editClient = signal(false);
	protected readonly editVehicle = signal(false);
	protected readonly editIssue = signal(false);

	protected readonly selectedClient = signal('');
	protected readonly newClientName = signal('');
	protected readonly deleteConfirmInput = signal('');

	protected readonly clientPhone = signal('');
	protected readonly clientEmail = signal('');

	protected readonly vehicleMarca = signal('');
	protected readonly vehicleModelo = signal('');
	protected readonly vehicleAnio = signal(2026);
	protected readonly vehiclePlacas = signal('');
	protected readonly vehicleVin = signal('');
	protected readonly vehicleKm = signal(0);

	protected readonly problemaEdit = signal('');
	protected readonly diagnosticoEdit = signal('');
	protected readonly tecnicoEdit = signal('');
	protected readonly fechaProgramadaEdit = signal('');

	protected readonly orderId = computed(() => this._params().get('id') ?? '');
	protected readonly order = computed(() => this._service.getById(this.orderId()));
	protected readonly canDeleteOrder = computed(() => {
		const ot = this.order();
		return !!ot && this.deleteConfirmInput().trim() === ot.id;
	});

	constructor() {
		effect(() => {
			const ot = this.order();
			if (!ot) {
				return;
			}
			this.selectedClient.set(ot.clientData.nombre);
			this.clientPhone.set(ot.clientData.telefono);
			this.clientEmail.set(ot.clientData.correo);
			this.vehicleMarca.set(ot.vehicle.marca);
			this.vehicleModelo.set(ot.vehicle.modelo);
			this.vehicleAnio.set(ot.vehicle.anio);
			this.vehiclePlacas.set(ot.vehicle.placas);
			this.vehicleVin.set(ot.vehicle.vin);
			this.vehicleKm.set(ot.vehicle.kilometraje);
			this.problemaEdit.set(ot.problema);
			this.diagnosticoEdit.set(ot.diagnostico);
			this.tecnicoEdit.set(ot.tecnico);
			this.fechaProgramadaEdit.set(ot.fechaProgramada);
		});
	}

	protected updateStatus(value: string): void {
		const order = this.order();
		if (!order) return;
		this._service.updateStatus(order.id, value as WorkOrderStatus);
		this._notification.info('Estado actualizado.');
	}

	protected updatePriority(value: string): void {
		const order = this.order();
		if (!order) return;
		this._service.updatePriority(order.id, value as WorkOrderPriority);
		this._notification.info('Prioridad actualizada.');
	}

	protected updateScheduledDate(value: string): void {
		const order = this.order();
		if (!order) return;
		const nextDate = value.trim();
		if (!nextDate || nextDate === order.fechaProgramada) {
			return;
		}
		this.fechaProgramadaEdit.set(nextDate);
		this._service.updateScheduledDate(order.id, nextDate);
		this._notification.info('Fecha programada actualizada.');
	}

	protected createClient(): void {
		const name = this.newClientName().trim();
		if (!name) return;
		this._service.addClient(name);
		this.selectedClient.set(name);
		this.newClientName.set('');
		this._notification.success('Cliente creado.');
	}

	protected saveClientCard(): void {
		const order = this.order();
		if (!order) return;
		this._service.updateClientData(order.id, {
			nombre: this.selectedClient().trim(),
			telefono: this.clientPhone().trim(),
			correo: this.clientEmail().trim(),
		});
		this.editClient.set(false);
		this._notification.success('Datos de cliente guardados.');
	}

	protected saveVehicleCard(): void {
		const order = this.order();
		if (!order) return;
		this._service.updateVehicleData(order.id, {
			marca: this.vehicleMarca().trim(),
			modelo: this.vehicleModelo().trim(),
			anio: this.vehicleAnio(),
			placas: this.vehiclePlacas().trim(),
			vin: this.vehicleVin().trim(),
			kilometraje: this.vehicleKm(),
		});
		this.editVehicle.set(false);
		this._notification.success('Datos de vehiculo guardados.');
	}

	protected saveIssueCard(): void {
		const order = this.order();
		if (!order) return;
		this._service.updateProblemDiagnosis(order.id, this.problemaEdit(), this.diagnosticoEdit());
		this._service.updateAssignedTechnician(order.id, this.tecnicoEdit());
		this.editIssue.set(false);
		this._notification.success('Detalles tecnicos guardados.');
	}

	protected confirmDeleteOrder(): void {
		const order = this.order();
		if (!order) return;
		if (!this.canDeleteOrder()) {
			this._notification.error('Debes escribir el nombre de la OT para confirmar.');
			return;
		}

		const deleted = this._service.deleteWorkOrder(order.id);
		if (deleted) {
			this._notification.success(`OT ${order.id} eliminada.`);
			void this._router.navigate(['/app/ordenes-trabajo']);
			return;
		}
		this._notification.error('No se pudo eliminar la OT.');
	}
}
