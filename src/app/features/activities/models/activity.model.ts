export interface Activity {
  id: string;
  titulo: string;
  descripcion: string;
  asignadoA: string; // Nombre de la persona
  fechaLimite: string; // ISO date
  prioridad: 'Alta' | 'Media' | 'Baja';
  etiqueta: 'Administrativa' | 'Técnica' | 'Comercial' | 'Compras' | 'Mantenimiento' | string;
  estado: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada';
  comentarios: Comment[];
}

export interface Comment {
  id: string;
  usuario: string;
  texto: string;
  timestamp: string; // ISO datetime
}
