import { Injectable, signal } from '@angular/core';
import { Payment } from '../models/payment.model';
import { PAYMENTS_MOCK } from '../mocks/payments.mock';

@Injectable({ providedIn: 'root' })
export class PaymentsAgendaService {
  private payments = signal<Payment[]>([...PAYMENTS_MOCK]);

  private calculateEstado(payment: Payment): Payment['estado'] {
    // Si ya está marcado como pagado, mantenerlo así
    if (payment.estado === 'Pagado') {
      return 'Pagado';
    }

    // Comparar fecha de vencimiento con hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Reset time to start of day

    const fechaVencimiento = new Date(payment.fechaVencimiento);
    fechaVencimiento.setHours(0, 0, 0, 0);

    if (fechaVencimiento < hoy) {
      return 'Vencido';
    }

    return 'Pendiente';
  }

  private applyAutoEstado(payments: Payment[]): Payment[] {
    return payments.map(p => ({
      ...p,
      estado: this.calculateEstado(p)
    }));
  }

  getPayments() {
    return this.applyAutoEstado(this.payments());
  }

  addPayment(payment: Payment) {
    this.payments.set([...this.payments(), payment]);
  }

  updatePayment(id: string, update: Partial<Payment>) {
    this.payments.set(
      this.payments().map(p => p.id === id ? { ...p, ...update } : p)
    );
  }

  deletePayment(id: string) {
    this.payments.set(this.payments().filter(p => p.id !== id));
  }

  generatePaymentWithId(payment: Omit<Payment, 'id' | 'comprobanteUrl'>): Payment {
    return {
      ...payment,
      id: `PAG-${Date.now()}`,
    };
  }
}
