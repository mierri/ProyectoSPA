import { Injectable, signal } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
	id: string;
	message: string;
	type: NotificationType;
	timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
	private readonly _notifications = signal<Notification[]>([]);
	public readonly notifications = this._notifications.asReadonly();

	public success(message: string): void {
		this.addNotification(message, 'success');
		toast.success(message);
	}

	public info(message: string): void {
		this.addNotification(message, 'info');
		toast.info(message);
	}

	public warning(message: string): void {
		this.addNotification(message, 'warning');
		toast.warning(message);
	}

	public error(message: string): void {
		this.addNotification(message, 'error');
		toast.error(message);
	}

	private addNotification(message: string, type: NotificationType): void {
		const notification: Notification = {
			id: `notif-${Date.now()}`,
			message,
			type,
			timestamp: new Date(),
		};
		this._notifications.update((notifs) => [notification, ...notifs].slice(0, 20));
	}

	public clearNotifications(): void {
		this._notifications.set([]);
	}
}
