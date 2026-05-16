import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class PdfMakerService {
  create(): jsPDF {
    return new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  }

  addTable(doc: jsPDF, options: Parameters<typeof autoTable>[1]): void {
    autoTable(doc, options);
  }
}
