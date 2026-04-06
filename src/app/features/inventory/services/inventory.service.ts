import { Injectable, computed, inject, signal } from '@angular/core';
import { NotificationService } from '../../../core';
import { custodyMock, inventoryItemsMock, inventoryMovementsMock } from '../mocks';
import type {
	CreateCustodyInput,
	CreateInventoryItemInput,
	InventoryItem,
	InventoryItemCondition,
	InventoryMovement,
	InventoryMovementType,
} from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
	private readonly _notification = inject(NotificationService);
	private readonly _items = signal<InventoryItem[]>(structuredClone(inventoryItemsMock));
	private readonly _movements = signal<InventoryMovement[]>(structuredClone(inventoryMovementsMock));
	private readonly _custody = signal(structuredClone(custodyMock));

	public readonly items = this._items.asReadonly();
	public readonly movements = this._movements.asReadonly();
	public readonly custody = this._custody.asReadonly();

	public readonly operationalItems = computed(() =>
		this._items().filter((item) => item.tipo === 'Herramienta' || item.tipo === 'Consumible' || item.tipo === 'Equipo'),
	);
	public readonly saleItems = computed(() => this._items().filter((item) => item.tipo === 'Parte en venta'));
	public readonly lowStockItems = computed(() => this._items().filter((item) => item.stockActual <= item.stockMinimo));

	public createInventoryItem(payload: CreateInventoryItemInput): InventoryItem {
		const item: InventoryItem = {
			id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
			nombre: payload.nombre.trim(),
			tipo: payload.tipo,
			fotoUrl: payload.fotoUrl.trim(),
			descripcion: payload.descripcion.trim(),
			estado: payload.estado,
			responsable: payload.responsable.trim() || 'Almacen',
			stockActual: Math.max(0, payload.stockActual),
			stockMinimo: Math.max(0, payload.stockMinimo),
			precio: payload.precio,
			precioVenta: payload.precioVenta,
			linkedPartId: payload.linkedPartId,
		};
		this._items.update((items) => [item, ...items]);
		this._movements.update((movements) => [
			{
				id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
				itemId: item.id,
				type: 'Entrada',
				cantidad: item.stockActual,
				stockResultante: item.stockActual,
				motivo: 'Alta de item',
				usuario: 'Administrador',
				timestamp: this.nowTimestamp(),
			},
			...movements,
		]);
		return item;
	}

	public deleteInventoryItem(itemId: string): boolean {
		let removed = false;
		this._items.update((items) => {
			const filtered = items.filter((item) => item.id !== itemId);
			removed = filtered.length !== items.length;
			return filtered;
		});
		if (!removed) {
			return false;
		}
		this._movements.update((movements) => movements.filter((movement) => movement.itemId !== itemId));
		return true;
	}

	public updateInventoryItem(itemId: string, payload: Partial<CreateInventoryItemInput>): boolean {
		const currentItem = this._items().find((item) => item.id === itemId);
		if (!currentItem) {
			return false;
		}

		this._items.update((items) =>
			items.map((item) =>
				item.id === itemId
					? {
							...item,
							nombre: payload.nombre?.trim() || item.nombre,
							tipo: payload.tipo || item.tipo,
							fotoUrl: payload.fotoUrl?.trim() || item.fotoUrl,
							descripcion: payload.descripcion?.trim() || item.descripcion,
							estado: payload.estado || item.estado,
							responsable: payload.responsable?.trim() || item.responsable,
							stockActual: typeof payload.stockActual === 'number' ? Math.max(0, payload.stockActual) : item.stockActual,
							stockMinimo: typeof payload.stockMinimo === 'number' ? Math.max(0, payload.stockMinimo) : item.stockMinimo,
							precio: typeof payload.precio === 'number' ? payload.precio : item.precio,
							precioVenta: payload.precioVenta ?? item.precioVenta,
							linkedPartId: payload.linkedPartId ?? item.linkedPartId,
						}
					: item,
			),
		);
		return true;
	}

	public updateItemMeta(id: string, patch: { estado?: InventoryItemCondition; responsable?: string; stockMinimo?: number }): void {
		this._items.update((items) =>
			items.map((item) =>
				item.id === id
					? {
							...item,
							estado: patch.estado ?? item.estado,
							responsable: patch.responsable?.trim() || item.responsable,
							stockMinimo: typeof patch.stockMinimo === 'number' ? Math.max(0, patch.stockMinimo) : item.stockMinimo,
						}
					: item,
			),
		);
	}

	public recordEntry(itemId: string, cantidad: number, motivo: string, usuario = 'Administrador'): boolean {
		if (cantidad <= 0) {
			return false;
		}
		return this.applyMovement(itemId, 'Entrada', cantidad, motivo, usuario);
	}

	public recordManualAdjustment(itemId: string, delta: number, motivo: string, usuario = 'Administrador'): boolean {
		if (!delta) {
			return false;
		}
		return this.applyMovement(itemId, 'Ajuste manual', delta, motivo, usuario);
	}

	public consumeForWorkOrder(linkedPartId: string, otId: string, usuario = 'Almacen'): void {
		const item = this._items().find((candidate) => candidate.linkedPartId === linkedPartId);
		if (!item) {
			return;
		}
		this.applyMovement(item.id, 'Salida OT', -1, 'Refaccion usada en OT', usuario, otId);
	}

	public getItemMovements(itemId: string): InventoryMovement[] {
		return this._movements()
			.filter((movement) => movement.itemId === itemId)
			.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
	}

	public createCustodyEntry(payload: CreateCustodyInput): void {
		const trimmedItem = payload.item.trim();
		if (!payload.otId.trim() || !trimmedItem) {
			return;
		}
		const entry = {
			id: `cus-${Date.now()}`,
			otId: payload.otId.trim(),
			cliente: payload.cliente.trim(),
			item: trimmedItem,
			fotoUrl: payload.fotoUrl.trim(),
			responsable: payload.responsable.trim() || 'Recepcion',
			estado: 'Resguardado' as const,
			fechaIngreso: this.nowTimestamp(),
		};
		this._custody.update((current) => [entry, ...current]);
	}

	public markCustodyDelivered(id: string): void {
		this._custody.update((entries) => entries.map((entry) => (entry.id === id ? { ...entry, estado: 'Entregado' as const } : entry)));
	}

	public deleteCustodyEntry(id: string): boolean {
		let removed = false;
		this._custody.update((entries) => {
			const filtered = entries.filter((entry) => entry.id !== id);
			removed = filtered.length !== entries.length;
			return filtered;
		});
		return removed;
	}

	private applyMovement(
		itemId: string,
		type: InventoryMovementType,
		delta: number,
		motivo: string,
		usuario: string,
		relatedOtId?: string,
	): boolean {
		const currentItem = this._items().find((item) => item.id === itemId);
		if (!currentItem) {
			return false;
		}

		const nextStock = currentItem.stockActual + delta;
		if (nextStock < 0) {
			this._notification.error(`Stock insuficiente para ${currentItem.nombre}.`);
			return false;
		}

		this._items.update((items) => items.map((item) => (item.id === itemId ? { ...item, stockActual: nextStock } : item)));
		const movement: InventoryMovement = {
			id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			itemId,
			type,
			cantidad: Math.abs(delta),
			stockResultante: nextStock,
			relatedOtId,
			motivo,
			usuario,
			timestamp: this.nowTimestamp(),
		};
		this._movements.update((movements) => [movement, ...movements]);

		if (nextStock <= currentItem.stockMinimo) {
			this._notification.warning(`Alerta administrador: ${currentItem.nombre} bajo minimo (${nextStock}/${currentItem.stockMinimo}).`);
		}
		return true;
	}

	private nowTimestamp(): string {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
	}
}
