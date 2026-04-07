import { Injectable, inject, computed, signal } from '@angular/core';
import type {
	DailyCashEntry,
	AccountReceivable,
	AccountPayable,
	DailyCashSummary,
} from '../models/finances.models';

@Injectable({
	providedIn: 'root',
})
export class FinancesDataService {
	private _workOrdersData = signal<any[]>([
		{
			id: 'WO-1042',
			cliente: 'Clinica Distrito Norte',
			tecnico: 'M. Rivera',
			fechaTerminado: '2026-03-28',
			estado: 'Entregado',
			monto: 3200,
			servicios: 'Cambio de discos, alineación y balanceo',
			tipoPago: 'Transferencia',
		},
		{
			id: 'WO-1038',
			cliente: 'Anexo de Palacio Municipal',
			tecnico: 'A. Salinas',
			fechaTerminado: '2026-03-25',
			estado: 'Entregado',
			monto: 2100,
			servicios: 'Revisión completa de frenos',
			tipoPago: 'Efectivo',
		},
		{
			id: 'WO-1035',
			cliente: 'Empresa Transportes Nacionales',
			tecnico: 'L. Medina',
			fechaTerminado: '2026-03-20',
			estado: 'Entregado',
			monto: 5400,
			servicios: 'Revisión motor, cambio de aceite',
			tipoPago: 'Tarjeta',
		},
		{
			id: 'WO-1029',
			cliente: 'Centro de Control de Transito',
			tecnico: 'C. Vega',
			fechaTerminado: '2026-03-18',
			estado: 'Entregado',
			monto: 1850,
			servicios: 'Diagnostico electrico',
			tipoPago: 'Efectivo',
		},
		{
			id: 'WO-1024',
			cliente: 'Parque Empresarial Regional',
			tecnico: 'D. Ortega',
			fechaTerminado: '2026-03-15',
			estado: 'Entregado',
			monto: 4200,
			servicios: 'Mantenimiento preventivo',
			tipoPago: 'Transferencia',
		},
	]);

	private _expensesData = signal<any[]>([
		{
			id: 'EXP-001',
			concepto: 'Refacciones - Discos de freno',
			monto: 950,
			fecha: '2026-03-28',
			categoria: 'Materiales',
			proveedor: 'AutoParts distribuidora',
		},
		{
			id: 'EXP-002',
			concepto: 'Refacciones - Balatas',
			monto: 620,
			fecha: '2026-03-26',
			categoria: 'Materiales',
			proveedor: 'SupplyCar',
		},
		{
			id: 'EXP-003',
			concepto: 'Aceite sintético 5W40',
			monto: 450,
			fecha: '2026-03-24',
			categoria: 'Fluidos',
			proveedor: 'Pemex Distribución',
		},
		{
			id: 'EXP-004',
			concepto: 'Servicios de energía',
			monto: 2800,
			fecha: '2026-03-01',
			categoria: 'Servicios',
			proveedor: 'ComEd',
		},
		{
			id: 'EXP-005',
			concepto: 'Nómina de empleados',
			monto: 15000,
			fecha: '2026-03-15',
			categoria: 'Nómina',
			proveedor: 'Recursos Humanos',
		},
	]);

	private _accountsReceivableData = signal<any[]>([
		{
			id: 'AR-1',
			otId: 'WO-1045',
			cliente: 'Clínica Privada San José',
			concepto: 'Servicio de mantenimiento - Ambulancia',
			monto: 2800,
			montoRecibido: 0,
			montoPendiente: 2800,
			estado: 'Pendiente',
			fechaVencimiento: '2026-04-06',
		},
		{
			id: 'AR-2',
			otId: 'WO-1044',
			cliente: 'Transportes Rápido',
			concepto: 'Reparación de caja de cambios',
			monto: 4500,
			montoRecibido: 2250,
			montoPendiente: 2250,
			estado: 'Parcial',
			fechaVencimiento: '2026-04-15',
		},
		{
			id: 'AR-3',
			otId: 'WO-1043',
			cliente: 'Taller Alianza',
			concepto: 'Servicio técnico - Diagnóstico',
			monto: 1200,
			montoRecibido: 1200,
			montoPendiente: 0,
			estado: 'Pagado',
			fechaVencimiento: '2026-03-28',
		},
		{
			id: 'AR-4',
			otId: 'WO-1041',
			cliente: 'Municipalidad de Xela',
			concepto: 'Mantenimiento general flotilla',
			monto: 3600,
			montoRecibido: 0,
			montoPendiente: 3600,
			estado: 'Vencido',
			fechaVencimiento: '2026-03-20',
		},
		{
			id: 'AR-5',
			otId: 'WO-1040',
			cliente: 'Hospital Central',
			concepto: 'Revisión de vehículos de emergencia',
			monto: 5200,
			montoRecibido: 5200,
			montoPendiente: 0,
			estado: 'Pagado',
			fechaVencimiento: '2026-04-05',
		},
	]);

	private _accountsPayableData = signal<any[]>([
		{
			id: 'AP-1',
			proveedor: 'AutoParts Distribuidora SA',
			concepto: 'Refacciones - Factura INV-2024-001',
			monto: 8900,
			montoPagado: 0,
			montoPendiente: 8900,
			estado: 'Pendiente',
			fechaVencimiento: '2026-04-20',
			notas: 'Terminos: 30 días',
		},
		{
			id: 'AP-2',
			proveedor: 'SupplyCar Express',
			concepto: 'Materiales y refacciones - Factura SC-2024-45',
			monto: 5600,
			montoPagado: 5600,
			montoPendiente: 0,
			estado: 'Pagado',
			fechaVencimiento: '2026-03-28',
			notas: 'Pago realizado 28/03/2026',
		},
		{
			id: 'AP-3',
			proveedor: 'Pemex Distribución',
			concepto: 'Aceites y fluidos - Factura PX-2024-782',
			monto: 3200,
			montoPagado: 1600,
			montoPendiente: 1600,
			estado: 'Parcial',
			fechaVencimiento: '2026-04-10',
			notas: 'Primer pago: 50%',
		},
		{
			id: 'AP-4',
			proveedor: 'Servicios CFE',
			concepto: 'Consumo de energía eléctrica - Marzo',
			monto: 2800,
			montoPagado: 0,
			montoPendiente: 2800,
			estado: 'Vencido',
			fechaVencimiento: '2026-03-15',
			notas: 'Requiere pago urgente',
		},
		{
			id: 'AP-5',
			proveedor: 'Global Logistics',
			concepto: 'Servicio de transporte de refacciones',
			monto: 1450,
			montoPagado: 0,
			montoPendiente: 1450,
			estado: 'Pendiente',
			fechaVencimiento: '2026-04-25',
		},
	]);

	private _dailyCashData = signal<DailyCashEntry[]>([
		{
			id: 'cash-001',
			fecha: '2026-04-06',
			concepto: 'Pago OT-1045 - Clinica San José',
			tipo: 'Ingreso',
			monto: 1000,
			metodoPago: 'Efectivo',
			referencia: 'WO-1045',
			usuario: 'Juan Pérez',
			notas: 'Pago parcial',
		},
		{
			id: 'cash-002',
			fecha: '2026-04-06',
			concepto: 'Pago OT-1044 - Transportes Rápido',
			tipo: 'Ingreso',
			monto: 2250,
			metodoPago: 'Transferencia',
			referencia: 'WO-1044',
			usuario: 'María García',
			notas: 'Segunda cuota',
		},
		{
			id: 'cash-003',
			fecha: '2026-04-05',
			concepto: 'Compra de refacciones',
			tipo: 'Egreso',
			monto: 1500,
			metodoPago: 'Transferencia',
			referencia: 'PROV-APD-001',
			usuario: 'Carlos López',
			notas: 'Disco de freno',
		},
		{
			id: 'cash-004',
			fecha: '2026-04-05',
			concepto: 'Pago de servicios (CFE)',
			tipo: 'Egreso',
			monto: 2800,
			metodoPago: 'Transferencia',
			referencia: 'CFE-2024-MAR',
			usuario: 'Carlos López',
			notas: 'Consumo eléctrico marzo',
		},
		{
			id: 'cash-005',
			fecha: '2026-04-04',
			concepto: 'Pago OT-1043 - Taller Alianza',
			tipo: 'Ingreso',
			monto: 1200,
			metodoPago: 'Tarjeta',
			referencia: 'WO-1043',
			usuario: 'Juan Pérez',
			notas: 'Pago completo',
		},
	]);

	constructor() {}

	getCompletedWorkOrders() {
		return this._workOrdersData();
	}

	getExpenses() {
		return this._expensesData();
	}

	getAccountsReceivable() {
		return this._accountsReceivableData();
	}

	getAccountsPayable() {
		return this._accountsPayableData();
	}

	getDailyCashEntries() {
		return this._dailyCashData();
	}

	addDailyCashEntry(entry: DailyCashEntry) {
		const current = this._dailyCashData();
		this._dailyCashData.set([entry, ...current]);
	}

	removeDailyCashEntry(id: string) {
		const current = this._dailyCashData();
		this._dailyCashData.set(current.filter((e) => e.id !== id));
	}

	updateReceivablePayment(id: string, paymentAmount: number) {
		const current = this._accountsReceivableData();
		const updated = current.map((ar) => {
			if (ar.id === id) {
				const newReceived = ar.montoRecibido + paymentAmount;
				const newPending = ar.montoPendiente - paymentAmount;
				const statusMap: any = {
					Pendiente: newPending > 0 ? 'Parcial' : 'Pagado',
					Parcial: newPending > 0 ? 'Parcial' : 'Pagado',
					Pagado: 'Pagado',
					Vencido: newPending > 0 ? 'Parcial' : 'Pagado',
				};
				return {
					...ar,
					montoRecibido: newReceived,
					montoPendiente: Math.max(0, newPending),
					estado: statusMap[ar.estado],
				};
			}
			return ar;
		});
		this._accountsReceivableData.set(updated);
	}

	updatePayablePayment(id: string, paymentAmount: number) {
		const current = this._accountsPayableData();
		const updated = current.map((ap) => {
			if (ap.id === id) {
				const newPaid = ap.montoPagado + paymentAmount;
				const newPending = ap.montoPendiente - paymentAmount;
				const statusMap: any = {
					Pendiente: newPending > 0 ? 'Parcial' : 'Pagado',
					Parcial: newPending > 0 ? 'Parcial' : 'Pagado',
					Pagado: 'Pagado',
					Vencido: newPending > 0 ? 'Parcial' : 'Pagado',
				};
				return {
					...ap,
					montoPagado: newPaid,
					montoPendiente: Math.max(0, newPending),
					estado: statusMap[ap.estado],
				};
			}
			return ap;
		});
		this._accountsPayableData.set(updated);
	}

	removeReceivable(id: string) {
		const current = this._accountsReceivableData();
		this._accountsReceivableData.set(current.filter((ar) => ar.id !== id));
	}

	removePayable(id: string) {
		const current = this._accountsPayableData();
		this._accountsPayableData.set(current.filter((ap) => ap.id !== id));
	}
}
