export interface SurveyResponse {
	id: string;
	workOrderId: string;
	cliente: string;
	fecha: string;
	// Satisfacción general (1-5)
	satisfaccionGeneral: number;
	// Calidad del trabajo (1-5)
	calidadTrabajo: number;
	// Trato recibido (1-5)
	tratoRecibido: number;
	// Recomendación (1-5)
	recomendacion: number;
	// Comentarios opcionales
	comentarios: string;
}

export interface SurveySummary {
	totalRespuestas: number;
	promedioSatisfaccionGeneral: number;
	promedioCalidadTrabajo: number;
	promedioTratoRecibido: number;
	promedioRecomendacion: number;
	tasaPonderada: number; // Promedio general
	respondedoresCount: number;
	ultimaEncuesta: string;
}

export interface SurveyWidgetData {
	workOrderId: string;
	cliente: string;
	mostrar: boolean;
}
