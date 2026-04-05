export interface Payment {
  id: string;
  concepto: string;
  tipo: 'Periódico' | 'No Periódico';
  categoria: 'Renta' | 'Nómina' | 'Servicios' | 'Suscripciones' | 'Créditos' | 'Proveedores' | 'Mantenimiento' | 'Extraordinario';
  fechaVencimiento: string; // ISO date
  estado: 'Pendiente' | 'Pagado' | 'Vencido';
  montoPresupuestado: number;
  montoPagado: number;
  comprobanteUrl?: string;
  notas?: string;
}

export interface PaymentAlert {
  paymentId: string;
  fechaAlerta: string; // ISO date
  enviado: boolean;
}