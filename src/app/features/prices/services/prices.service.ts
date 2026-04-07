import { Injectable, signal } from '@angular/core';
import { Servicio, ServicioAutomotriz, ServicioTorno, PriceFilter } from '../models/price.model';
import { TODOS_SERVICIOS, SERVICIOS_AUTOMOTRIZ, SERVICIOS_TORNO, getSistemas, getFamilias } from '../mocks/prices.mock';

@Injectable({ providedIn: 'root' })
export class PricesService {
  private servicios = signal<Servicio[]>([...TODOS_SERVICIOS]);

  getServicios() {
    return this.servicios();
  }

  getServicioById(id: number): Servicio | undefined {
    return this.servicios().find(s => s.id === id);
  }

  addServicio(servicio: Servicio) {
    this.servicios.set([...this.servicios(), servicio]);
  }

  updateServicio(id: number, update: Partial<Servicio>) {
    this.servicios.set(
      this.servicios().map(s => s.id === id ? Object.assign({}, s, update) : s)
    );
  }

  deleteServicio(id: number) {
    this.servicios.set(this.servicios().filter(s => s.id !== id));
  }

  filterServicios(filter: PriceFilter): { items: Servicio[]; total: number } {
    let filtered = [...this.servicios()];

    if (filter.categoriaPrincipal && filter.categoriaPrincipal !== 'Todas') {
      filtered = filtered.filter(s => s.categoriaPrincipal === filter.categoriaPrincipal);
    }

    if (filter.sistema) {
      filtered = filtered.filter(s => {
        if ('sistema' in s) {
          return (s as ServicioAutomotriz).sistema === filter.sistema;
        }
        return false;
      });
    }

    if (filter.familia) {
      filtered = filtered.filter(s => {
        if ('familia' in s) {
          return (s as ServicioAutomotriz).familia === filter.familia;
        }
        return false;
      });
    }

    if (filter.searchText) {
      const query = filter.searchText.toLowerCase().trim();
      filtered = filtered.filter(s => {
        if ('concepto' in s) {
          return (s as ServicioAutomotriz).concepto.toLowerCase().includes(query);
        } else if ('tamano' in s) {
          const torno = s as ServicioTorno;
          return torno.tamano.toLowerCase().includes(query) || 
                 torno.diametro.toLowerCase().includes(query);
        }
        return false;
      });
    }

    const pageSize = filter.pageSize || 10;
    const pageNumber = filter.pageNumber || 0;
    const start = pageNumber * pageSize;
    const end = start + pageSize;

    return {
      items: filtered.slice(start, end),
      total: filtered.length,
    };
  }

  getCategoriaPrincipal(): string[] {
    return ['Todas', 'Afinación y Otros', 'Mecánica Rápida', 'Mecánica General', 'Servicio de Torno'];
  }

  getSistemasPorCategoria(categoria: string): string[] {
    if (!categoria || categoria === 'Todas') {
      return [];
    }
    const servicios = this.servicios().filter(s => s.categoriaPrincipal === categoria) as ServicioAutomotriz[];
    const sistemas = new Set(servicios.map(s => s.sistema).filter(Boolean));
    return Array.from(sistemas).sort();
  }

  getFamiliasPorSistema(categoria: string, sistema?: string): string[] {
    return getFamilias(categoria, sistema);
  }

  isTorno(servicio: Servicio): boolean {
    return servicio.categoriaPrincipal === 'Servicio de Torno';
  }

  parsePrice(priceStr: string): number {
    return parseFloat(priceStr.replace(/[$,]/g, ''));
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getSistemas(categoria: string): string[] {
    return getSistemas(categoria);
  }

  getFamilias(categoria: string, sistema?: string): string[] {
    return getFamilias(categoria, sistema);
  }
}
