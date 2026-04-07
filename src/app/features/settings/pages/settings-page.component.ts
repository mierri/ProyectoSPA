import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { ChangePasswordSettingsComponent } from '../components/change-password-settings/change-password-settings.component';
import { ProfileSettingsComponent } from '../components/profile-settings/profile-settings.component';
import { RolesUsersSettingsComponent } from '../components/roles-users-settings/roles-users-settings.component';

@Component({
	selector: 'spartan-settings-page',
	imports: [HlmTabsImports, ProfileSettingsComponent, ChangePasswordSettingsComponent, RolesUsersSettingsComponent],
	templateUrl: './settings-page.component.html',
	styleUrl: './settings-page.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
	protected readonly selectedTab = signal('mi-perfil');

	protected selectTab(tab: string): void {
		this.selectedTab.set(tab);
	}
}
