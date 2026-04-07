import { Injectable, computed, inject, signal } from '@angular/core';
import type { Activity, ActivityTag, CreateActivityInput, CreateKPIInput, CreateTagInput, CreateEmployeeInput, Employee, KPI, OrganizationInfo, RoleType } from '../models';
import { activitiesMock, activityTagsMock, employeesMock, kpisMock, organizationInfoMock } from '../mocks';

@Injectable({ providedIn: 'root' })
export class KpisService {
	private readonly _employees = signal<Employee[]>(structuredClone(employeesMock));
	private readonly _kpis = signal<KPI[]>(structuredClone(kpisMock));
	private readonly _activities = signal<Activity[]>(structuredClone(activitiesMock));
	private readonly _tags = signal<ActivityTag[]>(structuredClone(activityTagsMock));
	private readonly _organizationInfo = signal<OrganizationInfo>(structuredClone(organizationInfoMock));

	public readonly employees = this._employees.asReadonly();
	public readonly kpis = this._kpis.asReadonly();
	public readonly activities = this._activities.asReadonly();
	public readonly tags = this._tags.asReadonly();
	public readonly organizationInfo = this._organizationInfo.asReadonly();

	public readonly employeesByRole = computed(() => {
		const emps = this._employees();
		const roles: RoleType[] = ['Líder Admin', 'Director General', 'Asesor de Servicio', 'Líder Técnico', 'Técnico Automotriz', 'Personal de Apoyo'];
		return roles.map(role => ({
			role,
			employees: emps.filter(e => e.role === role),
		}));
	});

	public readonly activitiesByRole = computed(() => {
		const acts = this._activities();
		const roles: RoleType[] = ['Líder Admin', 'Director General', 'Asesor de Servicio', 'Líder Técnico', 'Técnico Automotriz', 'Personal de Apoyo'];
		return roles.map(role => ({
			role,
			activities: acts.filter(a => a.roleAsignado === role),
		}));
	});

	public readonly activitiesByTag = computed(() => {
		const acts = this._activities();
		const allTags = this._tags();
		return allTags.map(tag => ({
			tag,
			activities: acts.filter(a => a.tags.includes(tag.id)),
		}));
	});

	public readonly activitiesByStatus = computed(() => {
		const acts = this._activities();
		const statuses = ['Pendiente', 'En Proceso', 'Completada', 'Cancelada'] as const;
		return statuses.map(status => ({
			status,
			activities: acts.filter(a => a.status === status),
		}));
	});

	public readonly kpisWithCalculatedProgress = computed(() => {
		return this._kpis().map(kpi => {
			const roleActivities = this._activities().filter(a => a.roleAsignado === kpi.roleResponsable);
			const completedActivities = roleActivities.filter(a => a.status === 'Completada');
			const calculatedProgress = roleActivities.length > 0 
				? Math.round((completedActivities.length / roleActivities.length) * 100)
				: 0;
			
			return {
				...kpi,
				calculatedProgress,
				rolActivityCount: roleActivities.length,
				roleCompletedCount: completedActivities.length,
			};
		});
	});

	public createEmployee(input: CreateEmployeeInput): Employee {
		const employee: Employee = {
			id: `emp-${Date.now()}`,
			nombre: input.nombre,
			apellido: input.apellido,
			email: input.email,
			telefono: input.telefono,
			role: input.role,
			fotoUrl: input.fotoUrl,
			fechaIngreso: new Date().toISOString().split('T')[0],
			activo: true,
		};
		this._employees.update(emps => [employee, ...emps]);
		return employee;
	}

	public updateEmployee(id: string, updates: Partial<Employee>): boolean {
		const found = this._employees().find(e => e.id === id);
		if (!found) return false;
		this._employees.update(emps => emps.map(e => (e.id === id ? { ...e, ...updates } : e)));
		return true;
	}

	public deleteEmployee(id: string): boolean {
		const initial = this._employees().length;
		this._employees.update(emps => emps.filter(e => e.id !== id));
		return this._employees().length < initial;
	}

	public createKPI(input: CreateKPIInput): KPI {
		const kpi: KPI = {
			id: `kpi-${Date.now()}`,
			...input,
			activo: true,
		};
		this._kpis.update(kpis => [kpi, ...kpis]);
		return kpi;
	}

	public updateKPI(id: string, updates: Partial<KPI>): boolean {
		const found = this._kpis().find(k => k.id === id);
		if (!found) return false;
		this._kpis.update(kpis => kpis.map(k => (k.id === id ? { ...k, ...updates } : k)));
		return true;
	}

	public updateKPIProgress(id: string, progreso: number): boolean {
		return this.updateKPI(id, { progreso: Math.min(100, Math.max(0, progreso)) });
	}

	public deleteKPI(id: string): boolean {
		const initial = this._kpis().length;
		this._kpis.update(kpis => kpis.filter(k => k.id !== id));
		return this._kpis().length < initial;
	}

	public createActivity(input: CreateActivityInput): Activity {
		const activity: Activity = {
			id: `act-${Date.now()}`,
			titulo: input.titulo,
			descripcion: input.descripcion,
			roleAsignado: input.roleAsignado,
			status: 'Pendiente',
			tags: input.tags,
			empleadoAsignado: input.empleadoAsignado,
			fechaCreacion: new Date().toISOString().split('T')[0],
			fechaVencimiento: input.fechaVencimiento,
			prioridad: input.prioridad,
		};
		this._activities.update(acts => [activity, ...acts]);
		return activity;
	}

	public updateActivity(id: string, updates: Partial<Activity>): boolean {
		const found = this._activities().find(a => a.id === id);
		if (!found) return false;
		this._activities.update(acts => acts.map(a => (a.id === id ? { ...a, ...updates } : a)));
		return true;
	}

	public updateActivityStatus(id: string, status: Activity['status']): boolean {
		return this.updateActivity(id, { status });
	}

	public updateActivityRole(id: string, roleAsignado: RoleType): boolean {
		return this.updateActivity(id, { roleAsignado });
	}

	public deleteActivity(id: string): boolean {
		const initial = this._activities().length;
		this._activities.update(acts => acts.filter(a => a.id !== id));
		return this._activities().length < initial;
	}

	public createTag(input: CreateTagInput): ActivityTag {
		const tag: ActivityTag = {
			id: `tag-${Date.now()}`,
			nombre: input.nombre,
			color: input.color,
		};
		this._tags.update(tags => [tag, ...tags]);
		return tag;
	}

	public updateTag(id: string, updates: Partial<ActivityTag>): boolean {
		const found = this._tags().find(t => t.id === id);
		if (!found) return false;
		this._tags.update(tags => tags.map(t => (t.id === id ? { ...t, ...updates } : t)));
		return true;
	}

	public deleteTag(id: string): boolean {
		const initial = this._tags().length;
		this._tags.update(tags => tags.filter(t => t.id !== id));
		if (this._tags().length < initial) {
			this._activities.update(acts => 
				acts.map(a => ({
					...a,
					tags: a.tags.filter(tag => tag !== id),
				}))
			);
			return true;
		}
		return false;
	}

	public updateOrganizationInfo(updates: Partial<OrganizationInfo>): boolean {
		this._organizationInfo.update(org => ({ ...org, ...updates }));
		return true;
	}

	public getEmployeeById(id: string): Employee | undefined {
		return this._employees().find(e => e.id === id);
	}

	public getActivityById(id: string): Activity | undefined {
		return this._activities().find(a => a.id === id);
	}

	public getTagById(id: string): ActivityTag | undefined {
		return this._tags().find(t => t.id === id);
	}
}
