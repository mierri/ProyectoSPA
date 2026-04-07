import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { dashboardMockData } from '../mocks/dashboard.mock';
import { FinancialSummaryComponent } from '../components';
import { NotificationsAlertsComponent } from '../components';
import { QuickAccessComponent } from '../components/quick-access';
import { RecentWorkOrdersComponent } from '../components/recent-work-orders';
import { FinancesService } from '../../finanzas/services/finanzas.service';
import { NotificationService, type Notification } from '../../../core/notifications/notification.service';
import type { FinancialSummaryItem, BadgeVariant } from '../models/dashboard.models';

@Component({
	selector: 'spartan-dashboard',
	imports: [FinancialSummaryComponent, RecentWorkOrdersComponent, NotificationsAlertsComponent, QuickAccessComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './dashboard.html',
	styleUrl: './dashboard.css',
})
export class DashboardComponent {
	private readonly _financesService = inject(FinancesService);
	private readonly _notificationService = inject(NotificationService);

	public readonly data = computed(() => {
		const receivable = this._financesService.receivableSummary();
		const notifications = this._notificationService.notifications();

		const financialSummary: FinancialSummaryItem[] = [
			{
				id: 'FS-1',
				title: 'Ingresos del Mes',
				amount: `$${(this._financesService.totalIncome() / 1000).toFixed(1)}k`,
				changeLabel: `${receivable.received > 0 ? '+' : ''}${receivable.received} recaudado`,
				changeVariant: 'default',
				footnote: 'Capturado de ordenes cerradas',
			},
			{
				id: 'FS-2',
				title: 'Facturas Pendientes',
				amount: `$${(receivable.pending / 1000).toFixed(1)}k`,
				changeLabel: `${receivable.accounts.length} facturas pendientes`,
				changeVariant: 'outline',
				footnote: 'En espera de validacion del cliente',
			},
			{
				id: 'FS-3',
				title: 'Costos Operativos',
				amount: `$${(this._financesService.totalExpenses() / 1000).toFixed(1)}k`,
				changeLabel: `De ${this._financesService.receivableSummary().total / 1000}k total`,
				changeVariant: 'secondary',
				footnote: 'Incluye horas extra y transporte',
			},
			{
				id: 'FS-4',
				title: 'Tasa de Cobranza',
				amount: receivable.total > 0 ? `${((receivable.received / receivable.total) * 100).toFixed(1)}%` : '0%',
				changeLabel: `${receivable.overdue} facturas vencidas`,
				changeVariant: receivable.overdue > 0 ? 'destructive' : 'default',
				footnote: 'Pagado durante los primeros 15 dias',
			},
		];

		return {
			...dashboardMockData,
			financialSummary,
			notifications: notifications.map((n: Notification) => ({
				id: n.id,
				title: n.type.charAt(0).toUpperCase() + n.type.slice(1),
				message: n.message,
				timeLabel: this.getTimeLabel(n.timestamp),
				severityLabel:
					n.type === 'error'
						? 'Alta'
						: n.type === 'warning'
							? 'Advertencia'
							: n.type === 'success'
								? 'OK'
								: 'Info',
				severityVariant: (
					n.type === 'error'
						? 'destructive'
						: n.type === 'warning'
							? 'outline'
							: n.type === 'success'
								? 'default'
								: 'secondary'
				) as BadgeVariant,
			})),
		};
	});

	private getTimeLabel(timestamp: Date): string {
		const now = new Date();
		const diff = now.getTime() - timestamp.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return 'Hace unos segundos';
		if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
		if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
		return `Hace ${days} dia${days > 1 ? 's' : ''}`;
	}
}
