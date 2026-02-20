import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorFallbackService {
  
  /**
   * Creates a clone of the element with all oklch colors converted to hex/rgb
   */
  createColorSafeClone(elementId: string): HTMLElement | null {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) return null;

    // Clone the element
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Set styles for PDF generation
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '800px';
    clone.style.maxWidth = '100%';
    clone.style.margin = '0 auto';
    clone.style.padding = '20px';
    clone.style.background = '#ffffff';
    clone.style.color = '#000000';
    
    // Convert all colors to safe formats
    this.convertColors(clone);
    
    // Add to DOM temporarily
    document.body.appendChild(clone);
    
    return clone;
  }

  /**
   * Recursively convert all oklch colors to hex/rgb
   */
  private convertColors(element: HTMLElement): void {
    // Get computed styles
    const styles = window.getComputedStyle(element);
    
    // List of color properties to check
    const colorProperties = [
      'color',
      'background-color',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'outline-color',
      'text-decoration-color',
      'fill',
      'stroke'
    ];

    // Check each property
    colorProperties.forEach(prop => {
      const value = styles.getPropertyValue(prop);
      if (value && value.includes('oklch')) {
        // Convert oklch to a safe color (use a fallback)
        this.setSafeColor(element, prop, value);
      }
    });

    // Check inline styles
    if (element.style) {
      for (let i = 0; i < element.style.length; i++) {
        const prop = element.style[i];
        const value = element.style.getPropertyValue(prop);
        if (value && value.includes('oklch')) {
          this.setSafeColor(element, prop, value);
        }
      }
    }

    // Check for gradient backgrounds
    const backgroundImage = styles.getPropertyValue('background-image');
    if (backgroundImage && backgroundImage.includes('oklch')) {
      element.style.backgroundImage = 'none';
      element.style.backgroundColor = '#3b82f6'; // Primary blue fallback
    }

    // Process children
    for (let i = 0; i < element.children.length; i++) {
      this.convertColors(element.children[i] as HTMLElement);
    }
  }

  /**
   * Set a safe color based on the property
   */
  private setSafeColor(element: HTMLElement, prop: string, originalValue: string): void {
    // Map of property-specific fallback colors
    const fallbacks: { [key: string]: string } = {
      'color': '#000000',
      'background-color': '#ffffff',
      'border-color': '#e5e7eb',
      'border-top-color': '#e5e7eb',
      'border-right-color': '#e5e7eb',
      'border-bottom-color': '#e5e7eb',
      'border-left-color': '#e5e7eb',
    };

    // Use property-specific fallback or default
    const fallback = fallbacks[prop] || '#000000';
    element.style.setProperty(prop, fallback);
  }

  /**
   * Clean up the clone
   */
  removeClone(clone: HTMLElement): void {
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
}