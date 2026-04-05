import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { TempAuthService } from '../../core/auth/auth.service';

@Component({
	selector: 'login-form',
	imports: [ReactiveFormsModule, RouterLink, HlmCardImports, HlmFieldImports, HlmInputImports, HlmButtonImports],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<hlm-card>
			<hlm-card-header>
				<h3 hlmCardTitle>Sign in</h3>
				<p hlmCardDescription>Use the temporary credentials shown below.</p>
			</hlm-card-header>
			<div hlmCardContent>
				<form [formGroup]="form" (ngSubmit)="login()">
					<hlm-field-group>
						<hlm-field>
							<label hlmFieldLabel for="username">Username</label>
							<input hlmInput type="text" id="username" placeholder="Temporary username" formControlName="username" />
							<hlm-field-error validator="required">Username is required.</hlm-field-error>
						</hlm-field>
						<hlm-field>
							<div class="flex items-center">
								<label hlmFieldLabel for="password">Password</label>
								<a hlmFieldDescription class="ml-auto text-sm underline-offset-4 hover:underline" routerLink=".">
									Forgot password?
								</a>
							</div>
							<input hlmInput type="password" id="password" formControlName="password" placeholder="Temporary password" />
							<hlm-field-error validator="required">Password is required.</hlm-field-error>
							<hlm-field-error validator="minlength">Password must be at least 8 characters.</hlm-field-error>
						</hlm-field>
						<hlm-field>
							<button hlmBtn type="submit" [disabled]="form.invalid">Sign in</button>
							@if (loginError()) {
								<p class="text-destructive text-sm">{{ loginError() }}</p>
							}
						</hlm-field>
					</hlm-field-group>
				</form>
			</div>
			<hlm-card-footer>
				<p hlmFieldDescription class="text-xs leading-5">
					Temp credentials: <br />
					Username: <strong>{{ tempCredentials.username }}</strong><br />
					Password: <strong>{{ tempCredentials.password }}</strong>
				</p>
			</hlm-card-footer>
		</hlm-card>
	`,
})
export class LoginForm {
	private readonly _fb = inject(FormBuilder);
	private readonly _router = inject(Router);
	private readonly _auth = inject(TempAuthService);

	public form = this._fb.group({
		username: ['', [Validators.required]],
		password: ['', [Validators.required, Validators.minLength(8)]],
	});
	public readonly tempCredentials = this._auth.credentials;
	public readonly loginError = signal<string | null>(null);

	public login() {
		if (this.form.invalid) {
			return;
		}

		const username = this.form.controls.username.value ?? '';
		const password = this.form.controls.password.value ?? '';
		const ok = this._auth.login(username, password);
		if (ok) {
			this.loginError.set(null);
			void this._router.navigate(['/app']);
			return;
		}

		this.loginError.set('Invalid temporary credentials.');
	}
}
