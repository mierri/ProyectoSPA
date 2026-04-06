export interface KPIIndicator {
	id: string;
	nombre: string;
	categoria: 'Commercial' | 'Operative' | 'Quality';
	valor: number;
	unidad: string;
	meta?: number;
	variacion?: number; // Porcentaje de variación
	tendencia: 'up' | 'down' | 'stable';
	descripcion: string;
	ultimaActualizacion: string;
	icon: string; // Nombre del icono lucide
}

export interface KPICategory {
	nombre: 'Commercial' | 'Operative' | 'Quality';
	label: string;
	indicadores: KPIIndicator[];
	color: string; // CSS variable ref
}

export interface IndicatorsData {
	fecha: string;
	periodoInicio: string;
	periodoFin: string;
	categorias: KPICategory[];
}
