import { Injectable, signal } from '@angular/core';

type TempCredentials = {
	username: string;
	password: string;
};

@Injectable({ providedIn: 'root' })
export class TempAuthService {
	private static readonly SESSION_KEY = 'temp-auth-session';

	private readonly _credentials: TempCredentials = {
		username: this.generateToken('user'),
		password: this.generateToken('pass'),
	};

	private readonly _isAuthenticated = signal<boolean>(this.readSession());

	public readonly credentials = this._credentials;
	public readonly isAuthenticated = this._isAuthenticated.asReadonly();

	public login(username: string, password: string): boolean {
		const ok = username === this._credentials.username && password === this._credentials.password;
		this._isAuthenticated.set(ok);
		if (ok) {
			sessionStorage.setItem(TempAuthService.SESSION_KEY, '1');
		}
		return ok;
	}

	public logout(): void {
		this._isAuthenticated.set(false);
		sessionStorage.removeItem(TempAuthService.SESSION_KEY);
	}

	private readSession(): boolean {
		return sessionStorage.getItem(TempAuthService.SESSION_KEY) === '1';
	}

	private generateToken(prefix: string): string {
		const seed = Math.random().toString(36).slice(2, 8);
		return `${prefix}-${seed}`;
	}
}
