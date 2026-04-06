// Servicios Automotrices Estándar (Afinación y Otros, Mecánica Rápida, Mecánica General)
export interface ServicioAutomotriz {
  id: number;
  categoriaPrincipal: 'Afinación y Otros' | 'Mecánica Rápida' | 'Mecánica General';
  sistema: string;
  familia: string;
  concepto: string;
  precioAuto: string;
  precioCamioneta: string;
  precioCamion: string;
  observacion: string;
}

// Servicios de Torno
export interface ServicioTorno {
  id: number;
  categoriaPrincipal: 'Servicio de Torno';
  tamano: string;
  diametro: string;
  precio: string;
}

// Tipo union
export type Servicio = ServicioAutomotriz | ServicioTorno;

export interface PriceFilter {
  searchText: string;
  categoriaPrincipal?: string;
  sistema?: string;
  familia?: string;
  pageSize?: number;
  pageNumber?: number;
}

export interface QuoteLineItem {
  id: string;
  nombre: string;
  tipo: 'servicio' | 'consumible';
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  fecha: string;
  items: QuoteLineItem[];
  subtotal: number;
  impuesto: number;
  total: number;
}
