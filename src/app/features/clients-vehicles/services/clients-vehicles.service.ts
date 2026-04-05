import { Injectable, computed, inject, signal } from '@angular/core';
import type { ClientData, WorkOrder } from '../../work-orders/models';
import { WorkOrdersService } from '../../work-orders/services';
import { clientProfilesMock } from '../mocks';
import type {
	ClientDetail,
	ClientListItem,
	ClientProfileMock,
	ClientTag,
	ClientVehicleHistoryItem,
	ClientWorkOrderHistoryItem,
	PaymentState,
	UpsertClientInput,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ClientsVehiclesService {
	private readonly _workOrdersService = inject(WorkOrdersService);
	private readonly _profiles = signal<ClientProfileMock[]>(structuredClone(clientProfilesMock));
	private readonly _deletedClientKeys = signal<string[]>([]);

	private readonly _profilesByName = computed(
		() =>
			new Map<string, ClientProfileMock>(this._profiles().map((profile) => [this.normalizeText(profile.nombre), profile])),
	);

	public readonly clients = computed<ClientListItem[]>(() => {
		const allClientNames = new Set<string>(this._workOrdersService.allClients().map((name) => this.normalizeText(name)));
		for (const profile of this._profiles()) {
			allClientNames.add(this.normalizeText(profile.nombre));
		}

		return [...allClientNames]
			.map((clientKey) => {
				const orders = this.getOrdersByClientKey(clientKey);
				const profile = this._profilesByName().get(clientKey);
				const firstOrder = orders[0];
				const vehicles = this.buildVehicleHistory(orders);
				const hasDebt = orders.some((order) => this.resolvePaymentState(profile, order.id) === 'Pendiente');
				const displayName = profile?.nombre || firstOrder?.cliente || 'Cliente';

				return {
					id: this.toId(displayName),
					nombre: displayName,
					telefono: profile?.telefono || firstOrder?.clientData.telefono || '-',
					correo: profile?.correo || firstOrder?.clientData.correo || '-',
					rfc: profile?.rfc || 'RFC pendiente',
					tag: this.resolveTag(orders.length, hasDebt),
					workOrderCount: orders.length,
					vehicleCount: vehicles.length,
					placas: [...new Set(orders.map((order) => order.vehicle.placas))],
				} satisfies ClientListItem;
			})
			.filter((client) => !this._deletedClientKeys().includes(this.normalizeText(client.nombre)))
			.sort((a, b) => a.nombre.localeCompare(b.nombre));
	});

	public createClient(payload: UpsertClientInput): string {
		const normalizedName = this.normalizeText(payload.nombre);
		if (!normalizedName) {
			return '';
		}

		const nextProfile: ClientProfileMock = {
			nombre: payload.nombre.trim(),
			telefono: payload.telefono.trim(),
			correo: payload.correo.trim(),
			rfc: payload.rfc.trim() || 'RFC pendiente',
			paymentByOtId: {},
		};

		this._profiles.update((profiles) => {
			const index = profiles.findIndex((profile) => this.normalizeText(profile.nombre) === normalizedName);
			if (index === -1) {
				return [nextProfile, ...profiles];
			}
			const next = [...profiles];
			next[index] = { ...next[index], ...nextProfile };
			return next;
		});

		this._workOrdersService.addClient(nextProfile.nombre);
		this._deletedClientKeys.update((keys) => keys.filter((key) => key !== normalizedName));
		return this.toId(nextProfile.nombre);
	}

	public updateClient(clientId: string, payload: UpsertClientInput): string {
		const current = this.getClientById(clientId);
		if (!current) {
			return clientId;
		}

		const previousName = current.nombre;
		const nextName = payload.nombre.trim() || previousName;
		const nextProfile: ClientProfileMock = {
			nombre: nextName,
			telefono: payload.telefono.trim(),
			correo: payload.correo.trim(),
			rfc: payload.rfc.trim() || 'RFC pendiente',
			paymentByOtId: this._profilesByName().get(this.normalizeText(previousName))?.paymentByOtId ?? {},
		};

		this._profiles.update((profiles) => {
			const withoutPrevious = profiles.filter((profile) => this.normalizeText(profile.nombre) !== this.normalizeText(previousName));
			const existingIndex = withoutPrevious.findIndex((profile) => this.normalizeText(profile.nombre) === this.normalizeText(nextName));
			if (existingIndex === -1) {
				return [nextProfile, ...withoutPrevious];
			}
			const next = [...withoutPrevious];
			next[existingIndex] = { ...next[existingIndex], ...nextProfile };
			return next;
		});

		const nextClientData: ClientData = {
			nombre: nextName,
			telefono: nextProfile.telefono || '',
			correo: nextProfile.correo || '',
		};

		this._workOrdersService.updateClientNameAcrossOrders(previousName, nextClientData);
		this._workOrdersService.replaceManualClient(previousName, nextName);
		this._workOrdersService.addClient(nextName);
		this._deletedClientKeys.update((keys) =>
			keys.filter((key) => key !== this.normalizeText(previousName) && key !== this.normalizeText(nextName)),
		);
		return this.toId(nextName);
	}

	public canDeleteClient(clientId: string): { canDelete: boolean; reason?: string } {
		const detail = this.getClientById(clientId);
		if (!detail) {
			return { canDelete: false, reason: 'Cliente no encontrado.' };
		}

		const hasNotTerminatedOrders = detail.workOrders.some((ot) => ot.status !== 'Terminado');
		if (hasNotTerminatedOrders) {
			return { canDelete: false, reason: 'Solo se puede eliminar si todas sus OTs estan en estado Terminado.' };
		}

		return { canDelete: true };
	}

	public deleteClient(clientId: string): { deleted: boolean; reason?: string } {
		const detail = this.getClientById(clientId);
		if (!detail) {
			return { deleted: false, reason: 'Cliente no encontrado.' };
		}

		const canDelete = this.canDeleteClient(clientId);
		if (!canDelete.canDelete) {
			return { deleted: false, reason: canDelete.reason };
		}

		const clientKey = this.normalizeText(detail.nombre);
		this._profiles.update((profiles) => profiles.filter((profile) => this.normalizeText(profile.nombre) !== clientKey));
		this._deletedClientKeys.update((keys) => (keys.includes(clientKey) ? keys : [clientKey, ...keys]));
		this._workOrdersService.removeManualClient(detail.nombre);
		return { deleted: true };
	}

	public getClientById(id: string): ClientDetail | undefined {
		const client = this.clients().find((item) => item.id === id);
		if (!client) {
			return undefined;
		}

		const clientKey = this.normalizeText(client.nombre);
		const clientOrders = this.getOrdersByClientKey(clientKey);
		const profile = this._profilesByName().get(clientKey);
		const workOrders = [...clientOrders]
			.sort((a, b) => b.fechaProgramada.localeCompare(a.fechaProgramada))
			.map((order) => this.toWorkOrderHistoryItem(order, profile));

		return {
			id: client.id,
			nombre: client.nombre,
			telefono: client.telefono,
			correo: client.correo,
			rfc: client.rfc,
			tag: client.tag,
			workOrders,
			vehicles: this.buildVehicleHistory(clientOrders),
		};
	}

	private getOrdersByClientKey(clientKey: string): WorkOrder[] {
		return this._workOrdersService.workOrders().filter((order) => this.normalizeText(order.cliente) === clientKey);
	}

	private toWorkOrderHistoryItem(order: WorkOrder, profile?: ClientProfileMock): ClientWorkOrderHistoryItem {
		return {
			id: order.id,
			status: order.status,
			priority: order.priority,
			fechaProgramada: order.fechaProgramada,
			tecnico: order.tecnico,
			vehiculo: `${order.vehicle.marca} ${order.vehicle.modelo} ${order.vehicle.anio}`,
			placas: order.vehicle.placas,
			paymentState: this.resolvePaymentState(profile, order.id),
		};
	}

	private buildVehicleHistory(orders: WorkOrder[]): ClientVehicleHistoryItem[] {
		const grouped = new Map<string, ClientVehicleHistoryItem>();

		for (const order of orders) {
			const key = `${order.vehicle.placas}::${order.vehicle.vin}`;
			const existing = grouped.get(key);
			const services = order.serviciosAsignados.length
				? order.serviciosAsignados.map((service) => service.nombre)
				: ['Diagnostico tecnico'];

			if (!existing) {
				grouped.set(key, {
					id: key,
					marca: order.vehicle.marca,
					modelo: order.vehicle.modelo,
					anio: order.vehicle.anio,
					placas: order.vehicle.placas,
					vin: order.vehicle.vin,
					services,
					workOrderIds: [order.id],
				});
				continue;
			}

			existing.workOrderIds = [...new Set([...existing.workOrderIds, order.id])];
			existing.services = [...new Set([...existing.services, ...services])];
		}

		return [...grouped.values()].sort((a, b) => a.placas.localeCompare(b.placas));
	}

	private resolvePaymentState(profile: ClientProfileMock | undefined, otId: string): PaymentState {
		const fromMock = profile?.paymentByOtId?.[otId];
		if (fromMock) {
			return fromMock;
		}
		return 'Pendiente';
	}

	private resolveTag(workOrderCount: number, hasDebt: boolean): ClientTag {
		if (hasDebt) {
			return 'Con adeudo';
		}
		if (workOrderCount >= 3) {
			return 'Frecuente';
		}
		return 'Nuevo';
	}

	private normalizeText(value: string): string {
		return value.trim().toLowerCase();
	}

	private toId(clientName: string): string {
		return this.normalizeText(clientName)
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-');
	}
}
