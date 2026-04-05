import { ChangeDetectionStrategy, Component } from '@angular/core';
import { dashboardMockData } from '../mocks/dashboard.mock';
import { FinancialSummaryComponent } from '../components';
import { NotificationsAlertsComponent } from '../components';
import { QuickAccessComponent } from '../components/quick-access';
import { RecentWorkOrdersComponent } from '../components/recent-work-orders';

@Component({
	selector: 'spartan-dashboard',
	imports: [FinancialSummaryComponent, RecentWorkOrdersComponent, NotificationsAlertsComponent, QuickAccessComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './dashboard.html',
	styleUrl: './dashboard.css',
})
export class DashboardComponent {
	public readonly data = dashboardMockData;
}
