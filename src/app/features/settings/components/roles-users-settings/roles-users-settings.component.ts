import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';

@Component({
	selector: 'spartan-roles-users-settings',
	imports: [HlmCardImports, HlmTableImports, HlmButtonImports],
	templateUrl: './roles-users-settings.component.html',
	styleUrl: './roles-users-settings.component.css',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesUsersSettingsComponent {
	protected readonly roles = ['Admin', 'Mecanico', 'Recepcionista'];

	protected readonly users = [
		{ name: 'Juan Perez', email: 'juan.perez@colosio.com', role: 'Admin' },
		{ name: 'Ana Garcia', email: 'ana.garcia@colosio.com', role: 'Mecanico' },
		{ name: 'Luis Ramos', email: 'luis.ramos@colosio.com', role: 'Recepcionista' },
	];
}
