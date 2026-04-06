import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucidePlus, lucideDownload } from '@ng-icons/lucide';
import { NotificationService } from '../../../../core';
import { PricesService } from '../../services/prices.service';
import { Servicio, QuoteLineItem } from '../../models/price.model';

@Component({
  selector: 'spartan-price-quoter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideTrash2, lucidePlus, lucideDownload })],
  templateUrl: './price-quoter.html',
  styleUrl: './price-quoter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceQuoterComponent {
  private readonly service = inject(PricesService);
  private readonly notification = inject(NotificationService);

  public readonly servicios = computed(() => this.service.getServicios());

  protected readonly selectedService = signal<number>(0);
  protected readonly selectedQuantity = signal<number>(1);
  protected readonly quoteItems = signal<QuoteLineItem[]>([]);

  protected readonly subtotal = computed(() => {
    return this.quoteItems().reduce((sum, item) => sum + item.subtotal, 0);
  });

  protected readonly taxAmount = computed(() => {
    return Math.round(this.subtotal() * 0.2 * 100) / 100;
  });

  protected readonly total = computed(() => {
    return this.roundPrice(this.subtotal() + this.taxAmount());
  });

  protected addServiceToQuote(): void {
    const serviceId = this.selectedService();
    if (serviceId === 0) {
      this.notification.error('Selecciona un servicio');
      return;
    }

    const servicio = this.servicios().find(s => s.id === serviceId);
    if (!servicio) return;

    const quantity = Math.max(1, this.selectedQuantity());
    
    // Parse price depending on type
    let priceStr = '';
    if ('precioAuto' in servicio) {
      priceStr = servicio['precioAuto'];
    } else if ('precio' in servicio) {
      priceStr = servicio['precio'];
    }

    const precioUnitario = this.parsePrice(priceStr);
    const subtotal = this.roundPrice(precioUnitario * quantity);
    
    const nombreServicio = 'concepto' in servicio ? servicio['concepto'] : servicio['tamano'];

    const item: QuoteLineItem = {
      id: `${serviceId}-${Date.now()}`,
      nombre: nombreServicio,
      tipo: 'servicio',
      cantidad: quantity,
      precioUnitario,
      subtotal,
    };

    this.quoteItems.update(items => [...items, item]);
    this.selectedService.set(0);
    this.selectedQuantity.set(1);
    this.notification.success(`${nombreServicio} agregado a la cotización`);
  }

  protected removeItem(itemId: string): void {
    this.quoteItems.update(items => items.filter(item => item.id !== itemId));
  }

  protected generatePDF(): void {
    const doc = this.generateQuoteDocument();
    const blob = new Blob([doc], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cotizacion-${Date.now()}.html`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.notification.success('Cotización descargada');
  }

  private parsePrice(priceStr: string): number {
    return parseFloat(priceStr.replace(/[$,]/g, ''));
  }

  private roundPrice(price: number): number {
    return Math.round(price * 100) / 100;
  }

  private generateQuoteDocument(): string {
    const date = new Date().toLocaleDateString('es-MX');
    const items = this.quoteItems()
      .map(
        item => `
      <tr>
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>$${item.precioUnitario.toFixed(2)}</td>
        <td>$${item.subtotal.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Cotización</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 2cm; }
            table { width: 100%; border-collapse: collapse; margin: 1cm 0; }
            th, td { border: 1px solid #ddd; padding: 0.5cm; text-align: left; }
            th { background-color: #f5f5f5; }
            .header { text-align: center; margin-bottom: 1cm; }
            .total-section { width: 300px; margin-left: auto; margin-top: 1cm; }
            .total-row { display: flex; justify-content: space-between; padding: 0.5cm; border-bottom: 1px solid #ddd; }
            .total-value { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cotización</h1>
            <p>Fecha: ${date}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items}
            </tbody>
          </table>
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span class="total-value">$${this.subtotal().toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Impuesto (20%):</span>
              <span class="total-value">$${this.taxAmount().toFixed(2)}</span>
            </div>
            <div class="total-row" style="border-bottom: 2px solid #000; font-size: 1.2em;">
              <span>TOTAL:</span>
              <span class="total-value">$${this.total().toFixed(2)}</span>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  protected onQuantityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = +(target?.value || 1);
    this.selectedQuantity.set(Math.max(1, value));
  }
}
