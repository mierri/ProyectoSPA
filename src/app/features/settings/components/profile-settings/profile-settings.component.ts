import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
	selector: 'spartan-profile-settings',
	imports: [HlmCardImports, HlmLabelImports, HlmInputImports, HlmButtonImports],
	templateUrl: './profile-settings.component.html',
	styleUrl: './profile-settings.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsComponent {}
