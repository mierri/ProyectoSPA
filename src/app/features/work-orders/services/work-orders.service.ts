import { Injectable, computed, inject, signal } from '@angular/core';
import { InventoryService } from '../../inventory/services';
import { workOrdersMock } from '../mocks/work-orders.mock';
import type {
	AssignedPartItem,
	AssignedServiceItem,
	ChecklistItem,
	ClientData,
	CreateWorkOrderInput,
	VehicleData,
	WorkOrder,
	WorkOrderNote,
	WorkOrderPriority,
	WorkOrderStatus,
} from '../models/work-orders.models';

@Injectable({ providedIn: 'root' })
export class WorkOrdersService {
	private readonly _inventoryService = inject(InventoryService);
	private readonly _workOrders = signal<WorkOrder[]>(structuredClone(workOrdersMock));
	private readonly _manualClients = signal<string[]>([]);

	public readonly workOrders = this._workOrders.asReadonly();
	public readonly technicians = computed(() => [...new Set(this._workOrders().map((order) => order.tecnico))]);
	public readonly clients = computed(() => [...new Set(this._workOrders().map((order) => order.cliente))]);
	public readonly allClients = computed(() => {
		const ordered = [...this._manualClients(), ...this.clients()];
		return [...new Set(ordered)].sort((a, b) => a.localeCompare(b));
	});

	public getById(id: string): WorkOrder | undefined {
		return this._workOrders().find((order) => order.id === id);
	}

	public createWorkOrder(input?: CreateWorkOrderInput): WorkOrder {
		const nextId = this.buildNextOrderId();
		const nowDate = this.todayDate();
		const defaultInput: CreateWorkOrderInput = {
			cliente: 'Nuevo cliente',
			telefono: '',
			correo: '',
			tecnico: 'Sin asignar',
			fechaProgramada: nowDate,
			priority: 'Media',
			vehicle: {
				marca: 'Pendiente',
				modelo: 'Pendiente',
				anio: 2026,
				placas: 'PEND-000',
				vin: 'PENDIENTE',
				kilometraje: 0,
			},
			problema: 'Pendiente de captura',
			diagnostico: 'Pendiente de diagnostico tecnico',
		};

		const payload = { ...defaultInput, ...input };
		const newOrder: WorkOrder = {
			id: nextId,
			cliente: payload.cliente,
			tecnico: payload.tecnico,
			fechaIngreso: nowDate,
			fechaProgramada: payload.fechaProgramada || nowDate,
			status: 'Agendado',
			priority: payload.priority,
			vehicle: { ...payload.vehicle },
			problema: payload.problema,
			diagnostico: payload.diagnostico,
			fotosIngreso: [],
			checklistInicial: [],
			checklistTrabajo: [],
			timeline: [this.createTimeline('OT creada', 'Recepcion')],
			catalogoRefacciones: [],
			refaccionesAsignadas: [],
			catalogoServicios: [],
			serviciosAsignados: [],
			cargoCuentasPorCobrarGenerado: false,
			notasInternas: [],
			notasCliente: [],
			clientData: {
				nombre: payload.cliente,
				telefono: payload.telefono,
				correo: payload.correo,
			},
		};

		this._workOrders.update((orders) => [newOrder, ...orders]);
		return newOrder;
	}

	public addClient(clientName: string): void {
		const trimmed = clientName.trim();
		if (!trimmed) {
			return;
		}
		this._manualClients.update((current) => (current.includes(trimmed) ? current : [trimmed, ...current]));
	}

	public removeManualClient(clientName: string): void {
		const trimmed = clientName.trim();
		if (!trimmed) {
			return;
		}
		this._manualClients.update((current) => current.filter((name) => name !== trimmed));
	}

	public replaceManualClient(previousName: string, nextName: string): void {
		const previous = previousName.trim();
		const next = nextName.trim();
		if (!previous || !next) {
			return;
		}
		this._manualClients.update((current) => {
			const withoutPrevious = current.filter((name) => name !== previous);
			return withoutPrevious.includes(next) ? withoutPrevious : [next, ...withoutPrevious];
		});
	}

	public updateClientNameAcrossOrders(previousName: string, nextClientData: ClientData, usuario = 'Asesor'): void {
		const previous = previousName.trim().toLowerCase();
		const nextName = nextClientData.nombre.trim();
		if (!previous || !nextName) {
			return;
		}

		this._workOrders.update((orders) =>
			orders.map((order) =>
				order.cliente.trim().toLowerCase() === previous
					? {
							...order,
							cliente: nextName,
							clientData: {
								nombre: nextName,
								telefono: nextClientData.telefono.trim(),
								correo: nextClientData.correo.trim(),
							},
							timeline: [this.createTimeline('Datos de cliente actualizados', usuario), ...order.timeline],
						}
					: order,
			),
		);
	}

	public updateClientData(id: string, clientData: ClientData): void {
		this._workOrders.update((orders) =>
			orders.map((order) =>
				order.id === id
					? {
							...order,
							cliente: clientData.nombre,
							clientData,
							timeline: [this.createTimeline('Datos de cliente actualizados', 'Asesor'), ...order.timeline],
						}
					: order,
			),
		);
	}

	public updateVehicleData(id: string, vehicle: VehicleData): void {
		this._workOrders.update((orders) =>
			orders.map((order) =>
				order.id === id
					? {
							...order,
							vehicle,
							timeline: [this.createTimeline('Datos de vehiculo actualizados', 'Tecnico'), ...order.timeline],
						}
					: order,
			),
		);
	}

	public updateProblemDiagnosis(id: string, problema: string, diagnostico: string): void {
		this._workOrders.update((orders) =>
			orders.map((order) =>
				order.id === id
					? {
							...order,
							problema,
							diagnostico,
							timeline: [this.createTimeline('Problema/diagnostico actualizados', 'Tecnico'), ...order.timeline],
						}
					: order,
			),
		);
	}

	public updateAssignedTechnician(id: string, tecnico: string): void {
		const trimmed = tecnico.trim();
		if (!trimmed) {
			return;
		}
		this._workOrders.update((orders) =>
			orders.map((order) =>
				order.id === id
					? {
							...order,
							tecnico: trimmed,
							timeline: [this.createTimeline(`Tecnico asignado actualizado a ${trimmed}`, 'Supervisor'), ...order.timeline],
						}
					: order,
			),
		);
	}

	public updateScheduledDate(id: string, fechaProgramada: string, usuario = 'Asesor'): void {
		const trimmedDate = fechaProgramada.trim();
		if (!trimmedDate) {
			return;
		}

		this._workOrders.update((orders) =>
			orders.map((order) =>
				order.id === id && order.fechaProgramada !== trimmedDate
					? {
							...order,
							fechaProgramada: trimmedDate,
							timeline: [this.createTimeline(`Fecha programada actualizada a ${trimmedDate}`, usuario), ...order.timeline],
						}
					: order,
			),
		);
	}

	public updateStatus(id: string, status: WorkOrderStatus, usuario = 'Supervisor'): void {
		this._workOrders.update((orders) =>
			orders.map((order) => {
				if (order.id !== id || order.status === status) {
					return order;
				}

				const updated: WorkOrder = {
					...order,
					status,
					timeline: [this.createTimeline(`Estado actualizado a ${status}`, usuario), ...order.timeline],
				};

				if (status === 'Terminado' && !updated.cargoCuentasPorCobrarGenerado) {
					updated.cargoCuentasPorCobrarGenerado = true;
					updated.timeline = [
						this.createTimeline('Cargo generado automaticamente en cuentas por cobrar', 'Finanzas'),
						...updated.timeline,
					];
				}

				return updated;
			}),
		);
	}

	public updatePriority(id: string, priority: WorkOrderPriority, usuario = 'Supervisor'): void {
		this._workOrders.update((orders) =>
			orders.map((order) =>
				order.id === id && order.priority !== priority
					? {
							...order,
							priority,
							timeline: [this.createTimeline(`Prioridad actualizada a ${priority}`, usuario), ...order.timeline],
						}
					: order,
			),
		);
	}

	public toggleChecklist(
		id: string,
		listType: 'checklistInicial' | 'checklistTrabajo',
		itemId: string,
		usuario = 'Tecnico',
	): void {
		this._workOrders.update((orders) =>
			orders.map((order) => {
				if (order.id !== id) {
					return order;
				}

				const list = order[listType].map((item) =>
					item.id === itemId ? ({ ...item, completada: !item.completada } as ChecklistItem) : item,
				);
				const changedItem = list.find((item) => item.id === itemId);

				return {
					...order,
					[listType]: list,
					timeline: changedItem
						? [
								this.createTimeline(
									`Checklist: ${changedItem.tarea} - ${changedItem.completada ? 'completado' : 'pendiente'}`,
									usuario,
								),
								...order.timeline,
							]
						: order.timeline,
				};
			}),
		);
	}

	public addChecklistItem(
		id: string,
		listType: 'checklistInicial' | 'checklistTrabajo',
		tarea: string,
		responsable: string,
		usuario = 'Supervisor',
	): void {
		const trimmedTask = tarea.trim();
		const trimmedOwner = responsable.trim() || 'Sin asignar';
		if (!trimmedTask) {
			return;
		}

		this._workOrders.update((orders) =>
			orders.map((order) => {
				if (order.id !== id) {
					return order;
				}

				const newItem: ChecklistItem = {
					id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
					tarea: trimmedTask,
					responsable: trimmedOwner,
					completada: false,
				};
				return {
					...order,
					[listType]: [...order[listType], newItem],
					timeline: [this.createTimeline(`Checklist: tarea agregada (${trimmedTask})`, usuario), ...order.timeline],
				};
			}),
		);
	}

	public addPhoto(id: string, photo: string, usuario = 'Recepcion'): void {
		const trimmed = photo.trim();
		if (!trimmed) {
			return;
		}
		this._workOrders.update((orders) =>
			orders.map((order) =>
				order.id === id
					? {
							...order,
							fotosIngreso: [...order.fotosIngreso, trimmed],
							timeline: [this.createTimeline('Foto agregada a la galeria', usuario), ...order.timeline],
						}
					: order,
			),
		);
	}

	public assignPart(id: string, partId: string, usuario = 'Almacen'): void {
		this._workOrders.update((orders) =>
			orders.map((order) => {
				if (order.id !== id) {
					return order;
				}

				const catalog = order.catalogoRefacciones.map((part) =>
					part.id === partId && part.stock > 0 ? { ...part, stock: part.stock - 1 } : part,
				);
				const part = order.catalogoRefacciones.find((p) => p.id === partId);
				if (!part || part.stock <= 0) {
					return order;
				}

				const assigned = this.mergeAssignedPart(order.refaccionesAsignadas, part);
				this._inventoryService.consumeForWorkOrder(part.id, id, usuario);
				return {
					...order,
					catalogoRefacciones: catalog,
					refaccionesAsignadas: assigned,
					timeline: [this.createTimeline(`Refaccion asignada: ${part.nombre}`, usuario), ...order.timeline],
				};
			}),
		);
	}

	public assignService(id: string, serviceId: string, usuario = 'Asesor'): void {
		this._workOrders.update((orders) =>
			orders.map((order) => {
				if (order.id !== id) {
					return order;
				}

				const service = order.catalogoServicios.find((s) => s.id === serviceId);
				if (!service) {
					return order;
				}
				const exists = order.serviciosAsignados.some((s) => s.id === service.id);
				if (exists) {
					return order;
				}

				const assignedService: AssignedServiceItem = {
					id: service.id,
					nombre: service.nombre,
					precio: service.precio,
				};

				return {
					...order,
					serviciosAsignados: [...order.serviciosAsignados, assignedService],
					timeline: [this.createTimeline(`Servicio agregado: ${service.nombre}`, usuario), ...order.timeline],
				};
			}),
		);
	}

	public addInternalNote(id: string, texto: string, usuario = 'Personal'): void {
		this.addNote(id, 'notasInternas', texto, usuario);
	}

	public addCustomerNote(id: string, texto: string, usuario = 'Asesor'): void {
		this.addNote(id, 'notasCliente', texto, usuario);
	}

	public registerClientSignature(id: string, nombreCliente: string): void {
		const trimmed = nombreCliente.trim();
		if (!trimmed) {
			return;
		}

		this._workOrders.update((orders) =>
			orders.map((order) =>
				order.id === id
					? {
							...order,
							firmaCliente: { nombreCliente: trimmed, timestamp: this.timestampNow() },
							timeline: [this.createTimeline('Firma digital del cliente registrada', 'Recepcion'), ...order.timeline],
						}
					: order,
			),
		);
	}

	public deleteWorkOrder(id: string): boolean {
		let deleted = false;
		this._workOrders.update((orders) => {
			const filtered = orders.filter((order) => order.id !== id);
			deleted = filtered.length !== orders.length;
			return filtered;
		});
		return deleted;
	}

	private addNote(id: string, type: 'notasInternas' | 'notasCliente', texto: string, usuario: string): void {
		const trimmed = texto.trim();
		if (!trimmed) {
			return;
		}

		this._workOrders.update((orders) =>
			orders.map((order) => {
				if (order.id !== id) {
					return order;
				}

				const note: WorkOrderNote = {
					id: `${type}-${Date.now()}`,
					texto: trimmed,
					usuario,
					timestamp: this.timestampNow(),
				};

				return {
					...order,
					[type]: [note, ...order[type]],
					timeline: [
						this.createTimeline(type === 'notasInternas' ? 'Nota interna agregada' : 'Nota visible al cliente agregada', usuario),
						...order.timeline,
					],
				};
			}),
		);
	}

	private mergeAssignedPart(assigned: AssignedPartItem[], part: { id: string; nombre: string; costo: number }): AssignedPartItem[] {
		const existing = assigned.find((item) => item.id === part.id);
		if (!existing) {
			return [...assigned, { id: part.id, nombre: part.nombre, cantidad: 1, costoUnitario: part.costo }];
		}
		return assigned.map((item) => (item.id === part.id ? { ...item, cantidad: item.cantidad + 1 } : item));
	}

	private buildNextOrderId(): string {
		const maxId = this._workOrders()
			.map((order) => Number(order.id.replace('WO-', '')))
			.filter((value) => !Number.isNaN(value))
			.reduce((max, current) => (current > max ? current : max), 1000);
		return `WO-${maxId + 1}`;
	}

	private createTimeline(descripcion: string, usuario: string) {
		return {
			id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			descripcion,
			timestamp: this.timestampNow(),
			usuario,
		};
	}

	private timestampNow(): string {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
	}

	private todayDate(): string {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	}
}
