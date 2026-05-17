import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NotificationService, QrCodeService } from '../../../../core';

export interface ShareWorkOrderDialogContext {
	orderId: string;
	portalUrl: string;
}

@Component({
	selector: 'spartan-share-work-order-dialog',
	imports: [HlmButtonImports],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './share-work-order-dialog.html',
	styleUrl: './share-work-order-dialog.css',
})
export class ShareWorkOrderDialogComponent {
	private readonly _dialogRef = inject(BrnDialogRef<unknown>);
	private readonly _context = injectBrnDialogContext<ShareWorkOrderDialogContext>();
	private readonly _qr = inject(QrCodeService);
	private readonly _notification = inject(NotificationService);

	protected readonly orderId = this._context.orderId;
	protected readonly portalUrl = this._context.portalUrl;
	protected readonly qrUrl = this._qr.getQrUrl(this._context.portalUrl, 220);

	protected copyLink(): void {
		navigator.clipboard.writeText(this.portalUrl).then(() => {
			this._notification.success('Enlace copiado al portapapeles.');
		});
	}

	protected close(): void {
		this._dialogRef.close();
	}
}
