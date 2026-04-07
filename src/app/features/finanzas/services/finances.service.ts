import { Injectable, computed, inject, signal } from '@angular/core';
import type {
	DailyCashEntry,
	DailyCashSummary,
	AccountReceivable,
	AccountPayable,
	ServicePopularity,
	TechnicianKPIData,
	MonthComparative,
} from '../models/finances.models';
import {
	dailyCashEntriesMock,
	accountsReceivableMock,
	accountsPayableMock,
	servicesPopularityMock,
	technicianKPIMock,
	monthComparativeMock,
	generateDailyCashSummary,
} from '../mocks/finances.mock';

@Injectable({ providedIn: 'root' })
export class FinancesService {
	private readonly _dailyCashEntries = signal<DailyCashEntry[]>(
		structuredClone(dailyCashEntriesMock)
	);
	private readonly _accountsReceivable = signal<AccountReceivable[]>(
		structuredClone(accountsReceivableMock)
	);
	private readonly _accountsPayable = signal<AccountPayable[]>(
		structuredClone(accountsPayableMock)
	);
	private readonly _servicesPopularity = signal<ServicePopularity[]>(
		structuredClone(servicesPopularityMock)
	);
	private readonly _technicianKPIs = signal<TechnicianKPIData[]>(
		structuredClone(technicianKPIMock)
	);
	private readonly _monthComparatives = signal<MonthComparative[]>(
		structuredClone(monthComparativeMock)
	);

	public readonly dailyCashEntries = this._dailyCashEntries.asReadonly();
	public readonly accountsReceivable = this._accountsReceivable.asReadonly();
	public readonly accountsPayable = this._accountsPayable.asReadonly();
	public readonly servicesPopularity = this._servicesPopularity.asReadonly();
	public readonly technicianKPIs = this._technicianKPIs.asReadonly();
	public readonly monthComparatives = this._monthComparatives.asReadonly();

	public readonly dailyCashSummary = computed(() => {
		const entries = this._dailyCashEntries();
		const today = new Date().toISOString().split('T')[0];

		const ingresos = entries
			.filter((e) => e.tipo === 'Ingreso')
			.reduce((sum, e) => sum + e.monto, 0);
		const egresos = entries
			.filter((e) => e.tipo === 'Egreso')
			.reduce((sum, e) => sum + e.monto, 0);

		const efectivo = entries
			.filter((e) => e.metodoPago === 'Efectivo')
			.reduce((sum, e) => sum + e.monto, 0);
		const transferencia = entries
			.filter((e) => e.metodoPago === 'Transferencia')
			.reduce((sum, e) => sum + e.monto, 0);
		const tarjeta = entries
			.filter((e) => e.metodoPago === 'Tarjeta')
			.reduce((sum, e) => sum + e.monto, 0);

		return {
			fecha: today,
			ingresosCaja: ingresos,
			egresosCaja: egresos,
			saldoFinal: ingresos - egresos,
			transacciones: entries,
			detalleMetodoPago: {
				efectivo,
				transferencia,
				tarjeta,
			},
		};
	});

	public readonly receivableSummary = computed(() => {
		const accounts = this._accountsReceivable();
		return {
			total: accounts.reduce((sum, a) => sum + a.monto, 0),
			received: accounts.reduce((sum, a) => sum + a.montoRecibido, 0),
			pending: accounts.reduce((sum, a) => sum + a.montoPendiente, 0),
			overdue: accounts.filter((a) => a.estado === 'Vencido').length,
			accounts,
		};
	});

	public readonly payableSummary = computed(() => {
		const accounts = this._accountsPayable();
		return {
			total: accounts.reduce((sum, a) => sum + a.monto, 0),
			paid: accounts.reduce((sum, a) => sum + a.montoPagado, 0),
			pending: accounts.reduce((sum, a) => sum + a.montoPendiente, 0),
			overdue: accounts.filter((a) => a.estado === 'Vencido').length,
			accounts,
		};
	});

	public readonly totalIncome = computed(() => {
		return this._monthComparatives().reduce((sum, m) => sum + m.ingresos, 0);
	});

	public readonly totalExpenses = computed(() => {
		return this._monthComparatives().reduce((sum, m) => sum + m.egresos, 0);
	});

	public readonly totalBalance = computed(() => {
		const income = this.totalIncome();
		const expenses = this.totalExpenses();
		return income - expenses;
	});

	public addDailyCashEntry(entry: Omit<DailyCashEntry, 'id'>): void {
		const newEntry: DailyCashEntry = {
			...entry,
			id: `cash-${Date.now()}`,
		};
		this._dailyCashEntries.update((entries) => [...entries, newEntry]);
	}

	public removeDailyCashEntry(id: string): void {
		this._dailyCashEntries.update((entries) =>
			entries.filter((e) => e.id !== id)
		);
	}

	public updateDailyCashEntry(id: string, updates: Partial<DailyCashEntry>): void {
		this._dailyCashEntries.update((entries) =>
			entries.map((e) => (e.id === id ? { ...e, ...updates } : e))
		);
	}

	public addAccountReceivable(account: Omit<AccountReceivable, 'id'>): void {
		const newAccount: AccountReceivable = {
			...account,
			id: `cxc-${Date.now()}`,
		};
		this._accountsReceivable.update((accounts) => [...accounts, newAccount]);
	}

	public updateAccountReceivable(id: string, updates: Partial<AccountReceivable>): void {
		this._accountsReceivable.update((accounts) =>
			accounts.map((a) => (a.id === id ? { ...a, ...updates } : a))
		);
	}

	public removeAccountReceivable(id: string): void {
		this._accountsReceivable.update((accounts) =>
			accounts.filter((a) => a.id !== id)
		);
	}

	public addAccountPayable(account: Omit<AccountPayable, 'id'>): void {
		const newAccount: AccountPayable = {
			...account,
			id: `cxp-${Date.now()}`,
		};
		this._accountsPayable.update((accounts) => [...accounts, newAccount]);
	}

	public updateAccountPayable(id: string, updates: Partial<AccountPayable>): void {
		this._accountsPayable.update((accounts) =>
			accounts.map((a) => (a.id === id ? { ...a, ...updates } : a))
		);
	}

	public removeAccountPayable(id: string): void {
		this._accountsPayable.update((accounts) =>
			accounts.filter((a) => a.id !== id)
		);
	}

	public getDailyCashEntry(id: string): DailyCashEntry | undefined {
		return this._dailyCashEntries().find((e) => e.id === id);
	}

	public getAccountReceivable(id: string): AccountReceivable | undefined {
		return this._accountsReceivable().find((a) => a.id === id);
	}

	public getAccountPayable(id: string): AccountPayable | undefined {
		return this._accountsPayable().find((a) => a.id === id);
	}

	public getReceivablesByStatus(status: string): AccountReceivable[] {
		return this._accountsReceivable().filter((a) => a.estado === status);
	}

	public getPayablesByStatus(status: string): AccountPayable[] {
		return this._accountsPayable().filter((a) => a.estado === status);
	}

	public getOverdueReceivables(): AccountReceivable[] {
		return this._accountsReceivable().filter((a) => a.estado === 'Vencido');
	}

	public getOverduePayables(): AccountPayable[] {
		return this._accountsPayable().filter((a) => a.estado === 'Vencido');
	}

	public getMonthlyComparative(): MonthComparative[] {
		return this._monthComparatives();
	}

	public getServicePopularity(): ServicePopularity[] {
		return this._servicesPopularity();
	}

	public getTechnicianKPIs(): TechnicianKPIData[] {
		return this._technicianKPIs();
	}

	public getTopTechnicians(limit: number = 3): TechnicianKPIData[] {
		return this._technicianKPIs()
			.sort((a, b) => b.ingresoGenerado - a.ingresoGenerado)
			.slice(0, limit);
	}

	public getMostPopularServices(limit: number = 3): ServicePopularity[] {
		return this._servicesPopularity()
			.sort((a, b) => b.cantidad - a.cantidad)
			.slice(0, limit);
	}
}
