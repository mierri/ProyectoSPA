import { Injectable } from '@angular/core';

// Import pdfMake types
declare var pdfMake: any;

/**
 * PDF Export Service - Generates downloadable PDF files
 * Requires: npm install pdfmake
 */
@Injectable({ providedIn: 'root' })
export class PdfExportService {
	constructor() {
		// Initialize pdfMake fonts if available
		if (typeof pdfMake !== 'undefined' && pdfMake.vfs === undefined) {
			// Fonts will be registered by build process
		}
	}

	/**
	 * Export daily cash entries to PDF (real download)
	 */
	exportDailyCash(entries: any[]): void {
		const today = new Date().toLocaleDateString('es-MX');
		const ingresos = entries.filter((e: any) => e.tipo === 'Ingreso').reduce((sum, e: any) => sum + e.monto, 0);
		const egresos = entries.filter((e: any) => e.tipo === 'Egreso').reduce((sum, e: any) => sum + e.monto, 0);
		const saldo = ingresos - egresos;

		const tableData = entries.map((e: any) => [
			e.fecha,
			e.concepto,
			e.tipo,
			e.monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
			e.metodoPago,
		]);

		const docDefinition: any = {
			content: [
				{ text: 'REPORTE DE CAJA DIARIA', style: 'header' },
				{ text: `Fecha: ${today}`, style: 'subheader' },
				{ text: ' ', margin: [0, 10, 0, 10] },
				{
					columns: [
						{
							text: `Ingresos: ${ingresos.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
							style: 'metric',
						},
						{
							text: `Egresos: ${egresos.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
							style: 'metric',
						},
						{
							text: `Saldo: ${saldo.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
							style: 'metricBold',
						},
					],
				},
				{ text: ' ', margin: [0, 10, 0, 10] },
				{
					table: {
						headerRows: 1,
						widths: ['15%', '30%', '10%', '15%', '15%'],
						body: [
							['Fecha', 'Concepto', 'Tipo', 'Monto', 'Método'],
							...tableData,
						],
					},
					style: 'table',
				},
			],
			styles: {
				header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10], color: '#2c3e50' },
				subheader: { fontSize: 11, color: '#34495e', margin: [0, 0, 0, 5] },
				metric: { fontSize: 10, bold: false, color: '#27ae60', margin: [5, 0] },
				metricBold: { fontSize: 11, bold: true, color: '#c0392b', margin: [5, 0] },
				table: { fontSize: 9, margin: [0, 10, 0, 0] },
			},
		};

		this.downloadPDF(docDefinition, 'caja-diaria.pdf');
	}

	/**
	 * Export accounts receivable to PDF
	 */
	exportAccountsReceivable(accounts: any[]): void {
		const total = accounts.reduce((sum, a: any) => sum + a.monto, 0);
		const received = accounts.reduce((sum, a: any) => sum + a.montoRecibido, 0);
		const pending = accounts.reduce((sum, a: any) => sum + a.montoPendiente, 0);

		const tableData = accounts.map((a: any) => [
			a.otId,
			a.cliente,
			a.concepto,
			a.monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
			a.montoPendiente.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
			a.fechaVencimiento,
			a.estado,
		]);

		const docDefinition: any = {
			content: [
				{ text: 'REPORTE DE CUENTAS POR COBRAR', style: 'header' },
				{ text: `Generado: ${new Date().toLocaleDateString('es-MX')}`, style: 'subheader' },
				{ text: ' ', margin: [0, 10, 0, 10] },
				{
					columns: [
						{ text: `Total: ${total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, style: 'metric' },
						{ text: `Recibido: ${received.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, style: 'metricGreen' },
						{ text: `Pendiente: ${pending.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, style: 'metricRed' },
					],
				},
				{ text: ' ', margin: [0, 10, 0, 10] },
				{
					table: {
						headerRows: 1,
						widths: ['10%', '20%', '20%', '12%', '12%', '12%', '14%'],
						body: [
							['OT', 'Cliente', 'Concepto', 'Total', 'Pendiente', 'Vencimiento', 'Estado'],
							...tableData,
						],
					},
					style: 'table',
				},
			],
			styles: {
				header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10], color: '#2c3e50' },
				subheader: { fontSize: 11, color: '#34495e', margin: [0, 0, 0, 5] },
				metric: { fontSize: 9, bold: true, color: '#c0392b', margin: [3, 0] },
				metricGreen: { fontSize: 9, bold: true, color: '#27ae60', margin: [3, 0] },
				metricRed: { fontSize: 9, bold: true, color: '#e74c3c', margin: [3, 0] },
				table: { fontSize: 8, margin: [0, 10, 0, 0] },
			},
		};

		this.downloadPDF(docDefinition, 'cuentas-por-cobrar.pdf');
	}

	/**
	 * Export accounts payable to PDF
	 */
	exportAccountsPayable(accounts: any[]): void {
		const total = accounts.reduce((sum, a: any) => sum + a.monto, 0);
		const paid = accounts.reduce((sum, a: any) => sum + a.montoPagado, 0);
		const pending = accounts.reduce((sum, a: any) => sum + a.montoPendiente, 0);

		const tableData = accounts.map((a: any) => [
			a.proveedor,
			a.concepto,
			a.monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
			a.montoPendiente.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
			a.fechaVencimiento,
			a.estado,
		]);

		const docDefinition: any = {
			content: [
				{ text: 'REPORTE DE CUENTAS POR PAGAR', style: 'header' },
				{ text: `Generado: ${new Date().toLocaleDateString('es-MX')}`, style: 'subheader' },
				{ text: ' ', margin: [0, 10, 0, 10] },
				{
					columns: [
						{ text: `Total: ${total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, style: 'metric' },
						{ text: `Pagado: ${paid.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, style: 'metricGreen' },
						{ text: `Pendiente: ${pending.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, style: 'metricRed' },
					],
				},
				{ text: ' ', margin: [0, 10, 0, 10] },
				{
					table: {
						headerRows: 1,
						widths: ['20%', '25%', '15%', '15%', '12%', '13%'],
						body: [
							['Proveedor', 'Concepto', 'Total', 'Pendiente', 'Vencimiento', 'Estado'],
							...tableData,
						],
					},
					style: 'table',
				},
			],
			styles: {
				header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10], color: '#2c3e50' },
				subheader: { fontSize: 11, color: '#34495e', margin: [0, 0, 0, 5] },
				metric: { fontSize: 9, bold: true, color: '#c0392b', margin: [3, 0] },
				metricGreen: { fontSize: 9, bold: true, color: '#27ae60', margin: [3, 0] },
				metricRed: { fontSize: 9, bold: true, color: '#e74c3c', margin: [3, 0] },
				table: { fontSize: 8, margin: [0, 10, 0, 0] },
			},
		};

		this.downloadPDF(docDefinition, 'cuentas-por-pagar.pdf');
	}

	/**
	 * Export services summary to PDF
	 */
	exportServicesSummary(workOrders: any[]): void {
		const serviceSummary = new Map<string, { count: number; total: number }>();

		workOrders.forEach((wo: any) => {
			const current = serviceSummary.get(wo.servicios) || { count: 0, total: 0 };
			serviceSummary.set(wo.servicios, {
				count: current.count + 1,
				total: current.total + wo.monto,
			});
		});

		const tableData = Array.from(serviceSummary.entries()).map(([servicio, data]) => [
			servicio,
			data.count.toString(),
			data.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
		]);

		const totalWorkOrders = workOrders.length;
		const totalIncome = workOrders.reduce((sum: number, wo: any) => sum + wo.monto, 0);

		const docDefinition: any = {
			content: [
				{ text: 'RESUMEN DE SERVICIOS', style: 'header' },
				{ text: `Período: ${new Date().toLocaleDateString('es-MX')}`, style: 'subheader' },
				{ text: ' ', margin: [0, 10, 0, 10] },
				{
					columns: [
						{ text: `Órdenes completadas: ${totalWorkOrders}`, style: 'metric' },
						{ text: `Ingresos: ${totalIncome.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, style: 'metricGreen' },
					],
				},
				{ text: ' ', margin: [0, 10, 0, 10] },
				{
					table: {
						headerRows: 1,
						widths: ['50%', '15%', '35%'],
						body: [
							['Servicio', 'Cantidad', 'Total'],
							...tableData,
						],
					},
					style: 'table',
				},
			],
			styles: {
				header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10], color: '#2c3e50' },
				subheader: { fontSize: 11, color: '#34495e', margin: [0, 0, 0, 5] },
				metric: { fontSize: 10, bold: true, color: '#2c3e50', margin: [3, 0] },
				metricGreen: { fontSize: 10, bold: true, color: '#27ae60', margin: [3, 0] },
				table: { fontSize: 9, margin: [0, 10, 0, 0] },
			},
		};

		this.downloadPDF(docDefinition, 'resumen-servicios.pdf');
	}

	/**
	 * Generate and download PDF - handles pdfMake library
	 */
	private downloadPDF(docDefinition: any, filename: string): void {
		if (typeof pdfMake === 'undefined') {
			alert('⚠️ pdfMake no está disponible. Asegúrate de haber instalado: npm install pdfmake');
			console.log('📋 Documento PDF que se generaría:', docDefinition);
			return;
		}

		try {
			pdfMake.createPdf(docDefinition).download(filename);
		} catch (error) {
			console.error('Error generando PDF:', error);
			alert('Error al generar el PDF. Revisa la consola.');
		}
	}
}
