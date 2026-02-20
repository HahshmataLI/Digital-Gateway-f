import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ColorFallbackService } from './color-fallback.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  
  constructor(private colorFallback: ColorFallbackService) {}

  /**
   * Generate PDF from HTML element with color fallback
   */
  async generatePdf(elementId: string, fileName: string = 'document.pdf'): Promise<void> {
    let clone: HTMLElement | null = null;
    
    try {
      console.log('Starting PDF generation for element:', elementId);
      
      // Try with clone first (removes oklch colors)
      clone = this.colorFallback.createColorSafeClone(elementId);
      
      if (!clone) {
        throw new Error(`Element with id '${elementId}' not found`);
      }

      // Wait for fonts
      await document.fonts.ready;
      
      // Small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Capturing element with html2canvas...');

      // Capture with html2canvas using the clone
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          console.log('Clone created for PDF generation');
        }
      });

      console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height);

      // Clean up clone
      this.colorFallback.removeClone(clone);

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('PDF dimensions:', imgWidth, 'x', imgHeight);

      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > pageHeight ? 'p' : 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Add image
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

      // Handle multi-page if needed
      let heightLeft = imgHeight - pageHeight;
      let position = -pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
        position -= pageHeight;
      }

      console.log('PDF created, saving as:', fileName);
      
      // Save PDF
      pdf.save(fileName);
      
      console.log('PDF saved successfully');
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      
      // Clean up clone if error occurred
      if (clone) {
        this.colorFallback.removeClone(clone);
      }
      
      throw error;
    }
  }

  /**
   * Alternative method using simplified approach
   */
  async generateSimplePdf(elementId: string, fileName: string = 'document.pdf'): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error('Element not found');

      // Create a simplified clone
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.background = '#ffffff';
      
      // Remove all gradient backgrounds
      clone.querySelectorAll('*').forEach(el => {
        (el as HTMLElement).style.background = '#ffffff';
        (el as HTMLElement).style.color = '#000000';
        (el as HTMLElement).style.borderColor = '#cccccc';
      });

      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 1.5,
        backgroundColor: '#ffffff',
        logging: false
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF();
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(fileName);

    } catch (error) {
      console.error('Simple PDF Error:', error);
      throw error;
    }
  }

  /**
   * Fallback: Use print dialog
   */
  printElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (!element) return;

    const originalStyles = {
      width: element.style.width,
      maxWidth: element.style.maxWidth,
      margin: element.style.margin,
      padding: element.style.padding,
      boxShadow: element.style.boxShadow
    };

    element.style.width = '100%';
    element.style.maxWidth = '100%';
    element.style.margin = '0';
    element.style.padding = '15px';
    element.style.boxShadow = 'none';

    window.print();

    setTimeout(() => {
      element.style.width = originalStyles.width;
      element.style.maxWidth = originalStyles.maxWidth;
      element.style.margin = originalStyles.margin;
      element.style.padding = originalStyles.padding;
      element.style.boxShadow = originalStyles.boxShadow;
    }, 100);
  }
}